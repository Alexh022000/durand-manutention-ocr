import type { Plan } from "./types";

// Helper pour générer un champ avec confiance
const f = <T,>(value: T, confidence = 0.95) => ({ value, confidence });

/**
 * Plans de démonstration chargés au démarrage de l'app.
 * Permet à la démo d'être visuellement "vivante" même avant le premier upload.
 *
 * Le premier plan est complètement extrait (status:success) pour que le démo
 * soit immédiatement visuel. Les 7 suivants sont en pending : un clic sur
 * "Lancer la lecture IA" déclenchera une extraction simulée (fakeExtractionFor)
 * dans AppShell — le tout sans nécessiter de plan PDF réel.
 *
 * Les clients sont anonymisés ("Client A, B, C…") pour la démo prospect.
 * Les produits couvrent la gamme manutention/vrac : convoyeur à chaîne,
 * élévateur à godets, vis sans fin, transporteur à bande, trémie, silo,
 * doseur volumétrique, aspiration centralisée.
 */
export const MOCK_PLANS: Plan[] = [
  {
    id: "mock-conv-chaine-a",
    filename: "DM-2026-0142_convoyeur-chaine-25th.pdf",
    display_name: "Convoyeur à chaîne 25 t/h — Client A",
    file_data_url: null,
    mime_type: "application/pdf",
    uploaded_at: "2026-04-21T08:12:00Z",
    uploaded_at_short: "08:12",
    status: "success",
    processing_ms: 11400,
    model_used: "mistral-ocr-latest → mistral-large-latest",
    error_message: null,
    extraction: {
      title_block: {
        drawing_number: f("DM-2026-0142", 0.97),
        revision: f("C", 0.94),
        title: f("Convoyeur à chaîne 25 t/h", 0.96),
        subtitle: f("Plan d'ensemble", 0.92),
        scale: f("1:20", 0.93),
        format: f("A1", 0.95),
        date: f("2026-04-15", 0.94),
        drawn_by: f("M. LEROY", 0.88),
        checked_by: f("J. BERTRAND", 0.85),
        approved_by: f("P. DURAND", 0.82)
      },
      project: {
        name: f("Ligne de transfert céréales — silo Nord", 0.9),
        client: f("Client A", 0.95),
        site: f("Site de Beauce", 0.85),
        internal_reference: f("PRJ-2026-018", 0.9)
      },
      components: [
        {
          item_number: f("1", 0.97),
          designation: f("Auget de transport en acier inox", 0.93),
          reference: f("AUG-INOX-150", 0.9),
          quantity: f(48, 0.95),
          material: f("Inox 304L", 0.92),
          dimensions: f("150 × 200 × 100 mm", 0.91),
          weight_kg: f(2.4, 0.85)
        },
        {
          item_number: f("2", 0.96),
          designation: f("Chaîne FV90 normalisée", 0.92),
          reference: f("CHAINE-FV90-12M", 0.89),
          quantity: f(2, 0.96),
          material: f("Acier traité 30CrMo4", 0.88),
          dimensions: f("Pas 100 mm × 12000 mm", 0.9),
          weight_kg: f(85, 0.82)
        },
        {
          item_number: f("3", 0.95),
          designation: f("Tête motrice avec moto-réducteur SEW", 0.91),
          reference: f("TM-SEW-3KW-IE3", 0.87),
          quantity: f(1, 0.97),
          material: f("Acier S235 + carter alu", 0.85),
          dimensions: f("800 × 600 × 700 mm", 0.88),
          weight_kg: f(140, 0.8)
        },
        {
          item_number: f("4", 0.94),
          designation: f("Caisson en tôle pliée 3 mm", 0.9),
          reference: f("CAISS-3-12000", 0.86),
          quantity: f(1, 0.95),
          material: f("Acier S235 galvanisé", 0.88),
          dimensions: f("12000 × 400 × 350 mm", 0.89),
          weight_kg: f(420, 0.78)
        },
        {
          item_number: f("5", 0.93),
          designation: f("Trémie d'entrée à brides DN300", 0.89),
          reference: f("TREM-300-INOX", 0.85),
          quantity: f(1, 0.95),
          material: f("Inox 304L", 0.9),
          dimensions: f("Ø300 × 600 mm", 0.88),
          weight_kg: f(28, 0.78)
        }
      ],
      dimensions_principales: [
        { label: f("Longueur totale", 0.96), value: f("12000", 0.95), unit: f("mm", 0.97) },
        { label: f("Débit nominal", 0.94), value: f("25", 0.92), unit: f("t/h", 0.95) },
        { label: f("Vitesse de chaîne", 0.92), value: f("0.4", 0.9), unit: f("m/s", 0.95) },
        { label: f("Puissance moteur", 0.93), value: f("3", 0.92), unit: f("kW", 0.96) }
      ],
      technical_notes: [
        {
          type: f("Tolérances générales", 0.92),
          content: f("ISO 2768-mK pour pièces mécano-soudées", 0.88)
        },
        {
          type: f("Soudures", 0.9),
          content: f(
            "Soudures continues étanches sur les caissons en contact produit, conformes EN ISO 5817 niveau B",
            0.84
          )
        },
        {
          type: f("Finition", 0.91),
          content: f(
            "Galvanisation à chaud du caisson et du châssis, parties en contact produit en inox 304L",
            0.85
          )
        }
      ],
      revision_history: [
        {
          rev: f("A", 0.95),
          date: f("2026-02-10", 0.92),
          description: f("Création", 0.94),
          author: f("MLE", 0.88)
        },
        {
          rev: f("B", 0.95),
          date: f("2026-03-22", 0.92),
          description: f("Modification trémie d'entrée DN250 → DN300", 0.86),
          author: f("MLE", 0.88)
        },
        {
          rev: f("C", 0.95),
          date: f("2026-04-15", 0.92),
          description: f("Ajout brides normalisées sortie", 0.86),
          author: f("MLE", 0.88)
        }
      ],
      external_references: f(["DM-2026-0138", "DM-2026-0141", "DM-2026-0145"], 0.84),
      norms_cited: f(["EN ISO 13857", "NF EN 619", "ATEX 22", "EN ISO 5817"], 0.86),
      notes: f(
        "Convoyeur destiné au transfert de blé tendre vers le silo Nord. Conditions ATEX 22 obligatoires côté produit.",
        0.78
      ),
      overall_confidence: 0.91
    }
  },
  {
    id: "mock-elev-godets-b",
    filename: "DM-2026-0156_elevateur-godets.pdf",
    display_name: "Élévateur à godets EG-200 — Client B",
    file_data_url: null,
    mime_type: "application/pdf",
    uploaded_at: "2026-04-21T08:34:00Z",
    uploaded_at_short: "08:34",
    status: "pending",
    processing_ms: null,
    model_used: null,
    error_message: null,
    extraction: null
  },
  {
    id: "mock-tremie-c",
    filename: "DM-2026-0163_tremie-reception.pdf",
    display_name: "Trémie de réception 8 m³ — Client C",
    file_data_url: null,
    mime_type: "application/pdf",
    uploaded_at: "2026-04-21T09:01:00Z",
    uploaded_at_short: "09:01",
    status: "pending",
    processing_ms: null,
    model_used: null,
    error_message: null,
    extraction: null
  },
  {
    id: "mock-vis-d",
    filename: "DM-2026-0171_vis-sans-fin-d250.pdf",
    display_name: "Vis sans fin Ø250 — Client D",
    file_data_url: null,
    mime_type: "application/pdf",
    uploaded_at: "2026-04-21T09:15:00Z",
    uploaded_at_short: "09:15",
    status: "pending",
    processing_ms: null,
    model_used: null,
    error_message: null,
    extraction: null
  },
  {
    id: "mock-aspi-e",
    filename: "DM-2026-0178_aspiration-centralisee.pdf",
    display_name: "Aspiration centralisée 4500 m³/h — Client E",
    file_data_url: null,
    mime_type: "application/pdf",
    uploaded_at: "2026-04-21T09:28:00Z",
    uploaded_at_short: "09:28",
    status: "pending",
    processing_ms: null,
    model_used: null,
    error_message: null,
    extraction: null
  },
  {
    id: "mock-tb-f",
    filename: "DM-2026-0184_transporteur-bande-650.pdf",
    display_name: "Transporteur à bande 650 mm — Client F",
    file_data_url: null,
    mime_type: "application/pdf",
    uploaded_at: "2026-04-21T09:42:00Z",
    uploaded_at_short: "09:42",
    status: "pending",
    processing_ms: null,
    model_used: null,
    error_message: null,
    extraction: null
  },
  {
    id: "mock-silo-g",
    filename: "DM-2026-0190_silo-200m3.pdf",
    display_name: "Silo de stockage 200 m³ — Client G",
    file_data_url: null,
    mime_type: "application/pdf",
    uploaded_at: "2026-04-21T09:55:00Z",
    uploaded_at_short: "09:55",
    status: "pending",
    processing_ms: null,
    model_used: null,
    error_message: null,
    extraction: null
  },
  {
    id: "mock-doseur-h",
    filename: "DM-2026-0198_doseur-volumetrique.pdf",
    display_name: "Doseur volumétrique 2 t/h — Client H",
    file_data_url: null,
    mime_type: "application/pdf",
    uploaded_at: "2026-04-21T10:08:00Z",
    uploaded_at_short: "10:08",
    status: "pending",
    processing_ms: null,
    model_used: null,
    error_message: null,
    extraction: null
  }
];
