# Durand Manutention — Démonstrateur Lecture IA de plans techniques

Démonstrateur web qui lit automatiquement les plans techniques de
**Durand Manutention** (groupe Cérès — solutions pour la manutention et les
process du vrac) à l'aide de l'IA française **Mistral**.

À partir d'un plan PDF ou image, le pipeline extrait :

- le **cartouche** : numéro de plan, indice de révision, désignation, échelle, format, date, dessinateur / vérificateur / approbateur
- le **bloc projet** : nom du projet, client final, site d'installation, référence interne Durand
- la **nomenclature** : repère, désignation, référence, quantité, matériau, dimensions, masse pour chaque composant
- les **cotations principales** annotées (longueur totale, débit, puissance, etc.)
- les **notes techniques** (tolérances, soudures, finition, peinture)
- l'**historique des révisions**
- les **plans externes cités** et les **normes** (EN, ISO, NF, ATEX…)

Chaque champ extrait est accompagné d'une **confiance par champ** (0–100 %),
affichée comme une pastille verte / orange / rouge dans le panneau de droite —
le human-in-the-loop sait immédiatement où vérifier.

---

## Stack technique

- **Next.js 14** (App Router) + TypeScript strict + Tailwind CSS
- **Mistral OCR** (`mistral-ocr-latest`) pour la reconnaissance native de plans PDF / image
- **Mistral Large** (`mistral-large-latest`) pour la structuration JSON avec confiance par champ
- **Vercel** pour l'hébergement (serverless functions, max 60 s)

Aucune base de données, aucune authentification : c'est un démonstrateur destiné
à la démo commerciale. Aucune information n'est conservée après traitement —
le pipeline est 100 % en mémoire côté serveur.

---

## Démarrage local

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer la clé API Mistral
cp .env.local.example .env.local
# Édite .env.local et remplace MISTRAL_API_KEY=...

# 3. Lancer en dev
npm run dev
# → http://localhost:3000
```

Tu obtiens ta clé API Mistral sur [console.mistral.ai](https://console.mistral.ai/api-keys).

---

## Variables d'environnement

| Nom                | Requis  | Défaut                  | Description                                           |
| ------------------ | ------- | ----------------------- | ----------------------------------------------------- |
| `MISTRAL_API_KEY`  | **Oui** | —                       | Clé API Mistral pour appeler OCR + chat completions   |
| `MISTRAL_OCR_MODEL`| Non     | `mistral-ocr-latest`    | Modèle OCR utilisé pour lire le PDF / image          |
| `MISTRAL_MODEL`    | Non     | `mistral-large-latest`  | Modèle de raisonnement pour structurer le JSON        |

---

## Déploiement Vercel

1. Pousse ce repo sur GitHub.
2. Sur [vercel.com/new](https://vercel.com/new), importe le repo.
3. Dans les paramètres du projet → **Environment Variables**, ajoute :
   - `MISTRAL_API_KEY` = ta clé Mistral
   - (optionnel) `MISTRAL_OCR_MODEL` et `MISTRAL_MODEL`
4. **Deploy** → l'URL `durand-manutention-ocr.vercel.app` est live en ~60 secondes.

---

## Architecture

```
durand-manutention-ocr/
├── app/
│   ├── api/extract/route.ts   ← Pipeline Mistral OCR → Mistral Large
│   ├── layout.tsx
│   ├── page.tsx               ← Monte AppShell
│   └── globals.css
├── components/
│   ├── AppShell.tsx           ← Orchestration 3 colonnes redimensionnables
│   ├── TopBar.tsx             ← Bandeau sombre + tabs Lecture / GED / Stats
│   ├── PlanList.tsx           ← Colonne gauche — liste des plans
│   ├── PlanCard.tsx           ← Card plan avec status pill
│   ├── PdfPreview.tsx         ← Colonne centre — iframe PDF / faux plan stylisé
│   ├── ExtractionPanel.tsx    ← Colonne droite — résultats + confiance par champ
│   ├── FieldRow.tsx           ← Ligne champ avec pastille de confiance
│   ├── UploadModal.tsx        ← Modal drag-drop
│   ├── ResizableDivider.tsx   ← Séparateur draggable entre panneaux
│   ├── SecondaryTabs.tsx      ← Vues GED + Statistiques
│   └── Spinner.tsx
├── lib/
│   ├── types.ts               ← ConfidenceField<T>, Extraction (cartouche,
│   │                            project, components, dimensions,
│   │                            technical_notes, revision_history…), Plan
│   └── mockPlans.ts           ← 8 plans de démo crédibles (convoyeur,
│                                élévateur, vis, trémie, etc.)
├── public/favicon.svg
└── tailwind.config.ts         ← Palette Durand Manutention (rouge #C6000A)
```

---

## Pipeline d'extraction — comment ça marche

```
PDF / image
   │
   ▼
mistral-ocr-latest        ← Reconnaissance native du document (cartouche,
   │                        nomenclature, annotations) → markdown structuré
   ▼
mistral-large-latest      ← Structuration JSON avec un schéma strict spécifique
   │                        au métier "lecture de plans industriels", avec
   │                        confiance estimée par champ (0–1)
   ▼
JSON typé { Extraction }  ← Affichage dans l'UI avec pastilles de confiance
                            par champ (vert ≥85 %, ambre 70–85 %, rouge <70 %)
```

Le découpage en 2 étapes apporte deux avantages :

- **OCR optimisé pour les documents techniques** : Mistral OCR reconnaît
  nativement les tableaux du cartouche, les blocs de nomenclature et les
  annotations cotées — bien mieux qu'un modèle texte à qui on enverrait
  l'image brute.
- **Structuration métier** : le modèle Large reçoit du markdown propre et se
  concentre sur la sémantique métier (interprétation du cartouche Durand,
  agrégation des composants, détection des normes).

Les helpers `cf<T>()` et `normalize()` de `app/api/extract/route.ts` rendent
la pipeline défensive : si Mistral renvoie un JSON imparfait (champ manquant,
type incorrect), le résultat est ramené à la forme `{ value, confidence }`
sans erreur côté client.

---

## Modèle de données métier

Voir `lib/types.ts`. L'extraction renvoie un objet `Extraction` :

- `title_block` — cartouche (drawing_number, revision, title, scale, format,
  date, drawn_by, checked_by, approved_by…)
- `project` — name, client, site, internal_reference
- `components[]` — repère, désignation, référence, qté, matériau, dimensions,
  masse
- `dimensions_principales[]` — cotations annotées (label / value / unit)
- `technical_notes[]` — tolérances, soudures, finition…
- `revision_history[]` — historique des révisions du cartouche
- `external_references` — autres plans cités
- `norms_cited` — normes EN / ISO / NF / ATEX
- `overall_confidence` — confiance globale 0–1

Chaque champ scalaire est typé `ConfidenceField<T> = { value: T, confidence: number }`.

---

## Mode démo (sans plan PDF réel)

L'application démarre avec **8 plans de démonstration** déjà visibles dans la
liste de gauche (convoyeur à chaîne, élévateur à godets, trémie, vis sans fin,
aspiration, transporteur à bande, silo, doseur). Le premier est complètement
extrait — pour montrer immédiatement le résultat. Les 7 autres sont en
"En attente" : un clic sur **Lancer la lecture IA** déclenche une extraction
**simulée** (sans appel API), pour que la démo reste fluide même sans
connexion ou sans clé API valide.

Pour tester avec un vrai plan, utilise le bouton **Déposer un plan** en haut
à droite — Mistral OCR lira le document et Mistral Large structurera le
résultat.

---

## Crédits

Démonstrateur réalisé par [JUWA](https://juwa.co) — agence IA française.

Conçu pour Durand Manutention, [groupe Cérès](https://ceres-groupe.fr/),
constructeur français de solutions pour la manutention et les process du
vrac.
