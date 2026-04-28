import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Pipeline d'extraction Durand Manutention — 100% Mistral (IA française, souveraine).
 *
 * Étape 1 : mistral-ocr-latest → extrait texte + layout du plan technique
 *           (PDF ou image) en markdown structuré, en conservant les tableaux
 *           du cartouche et de la nomenclature.
 * Étape 2 : mistral-large-latest → transforme le markdown en JSON strict avec
 *           confiance par champ pour le métier "lecture de plans industriels".
 *
 * Pourquoi ce découpage :
 *  - L'endpoint OCR de Mistral est optimisé pour la reconnaissance de
 *    documents (cartouches, blocs de cotation, tableaux de nomenclature) et
 *    produit un markdown propre, plus facile à parser pour un modèle texte.
 *  - Le modèle Large se charge uniquement du raisonnement structuré
 *    (interprétation du cartouche, agrégation des composants, détection des
 *    normes citées, confiance par champ).
 */

const STRUCTURE_PROMPT = `Tu es un agent de structuration documentaire spécialisé pour Durand Manutention (groupe Cérès, ceres-groupe.fr), constructeur français de solutions pour la manutention et les process du vrac (convoyeurs à chaîne, élévateurs à godets, vis sans fin, transporteurs à bande, trémies, silos, doseurs, aspirations centralisées, équipements pour l'industrie agro-alimentaire et céréalière).

Tu reçois le markdown d'un PLAN TECHNIQUE (plan d'ensemble, plan de détail, schéma d'implantation, plan de fabrication) déjà OCRisé par Mistral OCR.

Ta mission : extraire toutes les informations pertinentes du plan et retourner UNIQUEMENT un objet JSON STRICTEMENT conforme au schéma ci-dessous. Pas de texte avant/après, pas de balise Markdown.

Éléments à reconnaître prioritairement :
- Cartouche (bloc en bas à droite) : numéro de plan, indice de révision, titre/désignation, échelle, format papier (A0/A1/A2/A3/A4), date, nom du dessinateur, vérificateur, approbateur.
- Bloc projet : nom du projet, client final, site d'installation, référence interne Durand.
- Nomenclature / liste des composants : repère, désignation, référence, quantité, matériau, dimensions, masse.
- Cotations principales annotées : longueur totale, hauteur d'appui, débit nominal, puissance moteur, capacité, etc.
- Notes techniques : tolérances générales, soudures, finition (peinture, galvanisation), traitements de surface.
- Historique des révisions (souvent un petit tableau dans le cartouche).
- Plans externes cités (références à d'autres numéros de plan).
- Normes citées (NF, EN, ISO, ATEX, CE, etc.).

Chaque champ extrait doit être accompagné d'une confiance (0 à 1) que TU estimes : fiabilité haute (0.9+) pour un champ clairement lisible et sans ambiguïté dans le markdown OCR, moyenne (0.6-0.85) pour un champ partiellement lisible ou déductible du contexte, faible (0-0.5) pour un champ absent ou très incertain.

Schéma JSON attendu :
{
  "title_block": {
    "drawing_number": {"value": string|null, "confidence": number},
    "revision": {"value": string|null, "confidence": number},
    "title": {"value": string|null, "confidence": number},
    "subtitle": {"value": string|null, "confidence": number},
    "scale": {"value": string|null, "confidence": number},
    "format": {"value": string|null, "confidence": number},
    "date": {"value": string|null, "confidence": number},
    "drawn_by": {"value": string|null, "confidence": number},
    "checked_by": {"value": string|null, "confidence": number},
    "approved_by": {"value": string|null, "confidence": number}
  },
  "project": {
    "name": {"value": string|null, "confidence": number},
    "client": {"value": string|null, "confidence": number},
    "site": {"value": string|null, "confidence": number},
    "internal_reference": {"value": string|null, "confidence": number}
  },
  "components": [
    {
      "item_number": {"value": string|null, "confidence": number},
      "designation": {"value": string|null, "confidence": number},
      "reference": {"value": string|null, "confidence": number},
      "quantity": {"value": number|null, "confidence": number},
      "material": {"value": string|null, "confidence": number},
      "dimensions": {"value": string|null, "confidence": number},
      "weight_kg": {"value": number|null, "confidence": number}
    }
  ],
  "dimensions_principales": [
    {
      "label": {"value": string|null, "confidence": number},
      "value": {"value": string|null, "confidence": number},
      "unit": {"value": string|null, "confidence": number}
    }
  ],
  "technical_notes": [
    {
      "type": {"value": string|null, "confidence": number},
      "content": {"value": string|null, "confidence": number}
    }
  ],
  "revision_history": [
    {
      "rev": {"value": string|null, "confidence": number},
      "date": {"value": string|null, "confidence": number},
      "description": {"value": string|null, "confidence": number},
      "author": {"value": string|null, "confidence": number}
    }
  ],
  "external_references": {"value": string[], "confidence": number},
  "norms_cited": {"value": string[], "confidence": number},
  "notes": {"value": string|null, "confidence": number},
  "overall_confidence": number
}

RÈGLES :
1. Si un champ est absent : value=null et confidence=0 (pas "N/A" ni "inconnu").
2. Pour les nombres (quantity, weight_kg) : décimaux purs (ex: 12.5), pas de string.
3. Pour les listes vides (external_references, norms_cited) : tableau vide [] mais confidence reste haute si tu en es sûr qu'il n'y en a pas.
4. Pour les dates : format ISO "YYYY-MM-DD" si possible.
5. overall_confidence = ta confiance globale sur la qualité de l'extraction (moyenne pondérée mentalement des champs critiques : numéro de plan, désignation, nomenclature).
6. NE JAMAIS inventer. Si doute, value=null.
7. Réponse en JSON pur, parsable directement par JSON.parse().`;

type AnyExtraction = Record<string, any>;

function safeParseJson(text: string): AnyExtraction | null {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

// Defensive field normalizer — garantit la forme {value, confidence}
function cf<T>(
  raw: any,
  defaultValue: T,
  defaultConfidence = 0
): { value: T; confidence: number } {
  if (raw && typeof raw === "object" && "value" in raw) {
    return {
      value: (raw.value ?? defaultValue) as T,
      confidence:
        typeof raw.confidence === "number"
          ? Math.max(0, Math.min(1, raw.confidence))
          : defaultConfidence
    };
  }
  if (raw !== undefined && raw !== null) {
    return { value: raw as T, confidence: 0.7 };
  }
  return { value: defaultValue, confidence: defaultConfidence };
}

function normalize(parsed: AnyExtraction) {
  const tb = parsed.title_block ?? {};
  const pj = parsed.project ?? {};
  const components = Array.isArray(parsed.components) ? parsed.components : [];
  const dims = Array.isArray(parsed.dimensions_principales)
    ? parsed.dimensions_principales
    : [];
  const notes = Array.isArray(parsed.technical_notes)
    ? parsed.technical_notes
    : [];
  const revs = Array.isArray(parsed.revision_history)
    ? parsed.revision_history
    : [];

  return {
    title_block: {
      drawing_number: cf<string | null>(tb.drawing_number, null),
      revision: cf<string | null>(tb.revision, null),
      title: cf<string | null>(tb.title, null),
      subtitle: cf<string | null>(tb.subtitle, null),
      scale: cf<string | null>(tb.scale, null),
      format: cf<string | null>(tb.format, null),
      date: cf<string | null>(tb.date, null),
      drawn_by: cf<string | null>(tb.drawn_by, null),
      checked_by: cf<string | null>(tb.checked_by, null),
      approved_by: cf<string | null>(tb.approved_by, null)
    },
    project: {
      name: cf<string | null>(pj.name, null),
      client: cf<string | null>(pj.client, null),
      site: cf<string | null>(pj.site, null),
      internal_reference: cf<string | null>(pj.internal_reference, null)
    },
    components: components.map((c: any) => ({
      item_number: cf<string | null>(c?.item_number, null),
      designation: cf<string | null>(c?.designation, null),
      reference: cf<string | null>(c?.reference, null),
      quantity: cf<number | null>(c?.quantity, null),
      material: cf<string | null>(c?.material, null),
      dimensions: cf<string | null>(c?.dimensions, null),
      weight_kg: cf<number | null>(c?.weight_kg, null)
    })),
    dimensions_principales: dims.map((d: any) => ({
      label: cf<string | null>(d?.label, null),
      value: cf<string | null>(d?.value, null),
      unit: cf<string | null>(d?.unit, null)
    })),
    technical_notes: notes.map((n: any) => ({
      type: cf<string | null>(n?.type, null),
      content: cf<string | null>(n?.content, null)
    })),
    revision_history: revs.map((r: any) => ({
      rev: cf<string | null>(r?.rev, null),
      date: cf<string | null>(r?.date, null),
      description: cf<string | null>(r?.description, null),
      author: cf<string | null>(r?.author, null)
    })),
    external_references: cf<string[]>(parsed.external_references, []),
    norms_cited: cf<string[]>(parsed.norms_cited, []),
    notes: cf<string | null>(parsed.notes, null),
    overall_confidence:
      typeof parsed.overall_confidence === "number"
        ? Math.max(0, Math.min(1, parsed.overall_confidence))
        : 0.75
  };
}

const MISTRAL_BASE = "https://api.mistral.ai/v1";

async function mistralOcr(
  apiKey: string,
  ocrModel: string,
  mediaType: string,
  b64: string,
  isPdf: boolean
): Promise<string> {
  const dataUrl = `data:${mediaType};base64,${b64}`;
  const body = isPdf
    ? {
        model: ocrModel,
        document: { type: "document_url", document_url: dataUrl },
        include_image_base64: false
      }
    : {
        model: ocrModel,
        document: { type: "image_url", image_url: dataUrl },
        include_image_base64: false
      };

  const res = await fetch(`${MISTRAL_BASE}/ocr`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Mistral OCR ${res.status}: ${txt.slice(0, 300)}`);
  }

  const data = await res.json();
  const pages: any[] = Array.isArray(data?.pages) ? data.pages : [];
  const markdown = pages
    .map((p: any, i: number) =>
      `## Page ${p.index ?? i + 1}\n\n${p.markdown ?? p.text ?? ""}`
    )
    .join("\n\n---\n\n");

  if (!markdown.trim()) {
    throw new Error("Mistral OCR n'a rien renvoyé (document vide ou illisible).");
  }
  return markdown;
}

async function mistralStructure(
  apiKey: string,
  chatModel: string,
  markdown: string
): Promise<AnyExtraction | null> {
  const res = await fetch(`${MISTRAL_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: chatModel,
      temperature: 0,
      max_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: STRUCTURE_PROMPT },
        {
          role: "user",
          content: `Voici le markdown issu de Mistral OCR sur un plan technique Durand Manutention. Structure-le selon le schéma demandé.\n\n---\n\n${markdown}`
        }
      ]
    })
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Mistral chat ${res.status}: ${txt.slice(0, 300)}`);
  }

  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  return safeParseJson(content);
}

export async function POST(req: Request) {
  const started = Date.now();
  try {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "MISTRAL_API_KEY manquante côté serveur. Ajoute la variable d'environnement dans Vercel (https://console.mistral.ai)."
        },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const b64 = Buffer.from(arrayBuffer).toString("base64");

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    const mediaType = isPdf ? "application/pdf" : file.type || "image/jpeg";

    const ocrModel = process.env.MISTRAL_OCR_MODEL || "mistral-ocr-latest";
    const chatModel = process.env.MISTRAL_MODEL || "mistral-large-latest";

    // Étape 1 — OCR
    const markdown = await mistralOcr(apiKey, ocrModel, mediaType, b64, isPdf);

    // Étape 2 — Structuration JSON
    const parsed = await mistralStructure(apiKey, chatModel, markdown);

    if (!parsed) {
      return NextResponse.json(
        {
          error:
            "Mistral Large a répondu dans un format inattendu. Réessaie avec un plan de meilleure qualité (résolution >= 200 dpi).",
          debug_markdown: markdown.slice(0, 500)
        },
        { status: 502 }
      );
    }

    const extraction = normalize(parsed);

    return NextResponse.json({
      extraction,
      raw_model: `${ocrModel} → ${chatModel}`,
      processing_ms: Date.now() - started
    });
  } catch (err: any) {
    console.error("[extract] error:", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Erreur lors de l'extraction. Vérifie le format du document et la clé API Mistral."
      },
      { status: 500 }
    );
  }
}
