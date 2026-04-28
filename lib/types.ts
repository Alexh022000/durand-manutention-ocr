// Types partagés front ↔ back pour le démonstrateur Durand Manutention.
// Adapté du modèle "ConfidenceField par champ" — chaque valeur extraite d'un
// plan technique embarque sa propre confiance (0..1) pour l'affichage des
// pastilles vert/orange/rouge dans le panneau de droite.

export type ConfidenceField<T> = {
  value: T;
  confidence: number; // 0..1
};

/** Composant identifié dans la nomenclature du plan (cartouche listing). */
export type Component = {
  item_number: ConfidenceField<string | null>; // n° de repère sur le plan
  designation: ConfidenceField<string | null>;
  reference: ConfidenceField<string | null>; // réf. interne / fournisseur
  quantity: ConfidenceField<number | null>;
  material: ConfidenceField<string | null>; // S235, inox 304, galva...
  dimensions: ConfidenceField<string | null>; // ex: Ø250 × 3000 mm
  weight_kg: ConfidenceField<number | null>;
};

/** Cotation principale annotée sur le plan (longueurs, hauteurs, débits...). */
export type Dimension = {
  label: ConfidenceField<string | null>; // "Longueur totale", "Débit nominal"
  value: ConfidenceField<string | null>;
  unit: ConfidenceField<string | null>; // mm, m, t/h, kW, etc.
};

/** Annotation technique : tolérance, soudure, finition, peinture, etc. */
export type TechnicalNote = {
  type: ConfidenceField<string | null>;
  content: ConfidenceField<string | null>;
};

/** Une ligne du tableau "Historique des révisions" du cartouche. */
export type RevisionEntry = {
  rev: ConfidenceField<string | null>;
  date: ConfidenceField<string | null>;
  description: ConfidenceField<string | null>;
  author: ConfidenceField<string | null>;
};

export type Extraction = {
  /** Cartouche du plan (le bloc en bas à droite). */
  title_block: {
    drawing_number: ConfidenceField<string | null>;
    revision: ConfidenceField<string | null>;
    title: ConfidenceField<string | null>;
    subtitle: ConfidenceField<string | null>;
    scale: ConfidenceField<string | null>;
    format: ConfidenceField<string | null>; // A0/A1/A2/A3/A4
    date: ConfidenceField<string | null>;
    drawn_by: ConfidenceField<string | null>;
    checked_by: ConfidenceField<string | null>;
    approved_by: ConfidenceField<string | null>;
  };
  project: {
    name: ConfidenceField<string | null>;
    client: ConfidenceField<string | null>;
    site: ConfidenceField<string | null>;
    internal_reference: ConfidenceField<string | null>;
  };
  components: Component[];
  dimensions_principales: Dimension[];
  technical_notes: TechnicalNote[];
  revision_history: RevisionEntry[];
  external_references: ConfidenceField<string[]>; // autres plans cités
  norms_cited: ConfidenceField<string[]>; // EN, ISO, NF, ATEX...
  notes: ConfidenceField<string | null>;
  overall_confidence: number;
};

export type PlanStatus = "pending" | "processing" | "success" | "error";

export type Plan = {
  id: string;
  filename: string;
  /** Nom affiché dans la liste : "Convoyeur principal — Client A" */
  display_name: string;
  /** data: URL pour l'aperçu — null pour les plans mockés sans fichier réel */
  file_data_url: string | null;
  mime_type: string;
  uploaded_at: string; // ISO
  uploaded_at_short: string; // "08:12"
  status: PlanStatus;
  extraction: Extraction | null;
  processing_ms: number | null;
  error_message: string | null;
  model_used: string | null;
};
