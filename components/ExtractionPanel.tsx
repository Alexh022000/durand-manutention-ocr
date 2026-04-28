"use client";

import type { Plan, Component } from "@/lib/types";
import FieldRow from "./FieldRow";
import Spinner from "./Spinner";

function ComponentCard({
  component,
  index
}: {
  component: Component;
  index: number;
}) {
  return (
    <div className="rounded-lg border border-dm-border bg-white p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-dm-red bg-dm-red-light px-2 py-0.5 rounded">
            Repère {component.item_number.value || index + 1}
          </div>
          <div className="mt-1 text-base font-semibold text-dm-ink">
            {component.designation.value || "Désignation non identifiée"}
          </div>
          {component.reference.value && (
            <div className="text-sm text-dm-muted mt-0.5">
              Réf. {component.reference.value}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          {component.quantity.value != null && (
            <div className="font-bold text-dm-ink">
              ×{component.quantity.value}
            </div>
          )}
          {component.weight_kg.value != null && (
            <div className="text-xs text-dm-muted">
              {component.weight_kg.value} kg
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <FieldRow label="Matériau" field={component.material} compact />
        <FieldRow label="Dimensions" field={component.dimensions} compact />
        <FieldRow
          label="Quantité"
          field={component.quantity}
          render={(v) => (v != null ? String(v) : "—")}
          compact
        />
      </div>
    </div>
  );
}

export default function ExtractionPanel({
  plan,
  onExtract,
  onRetry,
  onValidate,
  width
}: {
  plan: Plan | null;
  onExtract: () => void;
  onRetry: () => void;
  onValidate: () => void;
  width?: number;
}) {
  return (
    <section
      style={width ? { width: `${width}px` } : undefined}
      className="shrink-0 bg-white flex flex-col min-w-0"
    >
      {/* ---------- Idle : aucun plan sélectionné ---------- */}
      {!plan && (
        <div className="flex-1 flex items-center justify-center text-center p-10">
          <div className="max-w-xs">
            <div className="w-16 h-16 rounded-full bg-dm-bg flex items-center justify-center mx-auto border border-dm-border">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26A7 7 0 0012 2z" stroke="#C6000A" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="mt-4 text-dm-ink font-semibold">
              Aucun plan sélectionné
            </div>
            <div className="text-sm text-dm-muted mt-1">
              Choisis un plan dans la liste à gauche, ou dépose-en un nouveau.
            </div>
          </div>
        </div>
      )}

      {/* ---------- Pending : plan pas encore lu ---------- */}
      {plan && plan.status === "pending" && (
        <div className="flex-1 flex items-center justify-center text-center p-10">
          <div className="max-w-sm">
            <div className="w-16 h-16 rounded-full bg-dm-red-light flex items-center justify-center mx-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="#C6000A" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="4" stroke="#C6000A" strokeWidth="2" />
              </svg>
            </div>
            <div className="mt-4 font-mono text-dm-muted text-xs break-all">
              {plan.filename}
            </div>
            <div className="mt-1 text-dm-ink">
              Ce plan n'a pas encore été analysé
            </div>
            <button
              onClick={onExtract}
              className="mt-6 inline-flex items-center gap-2 bg-dm-red hover:bg-dm-red-dark text-white font-semibold px-5 py-3 rounded-lg shadow transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="white" />
              </svg>
              Lancer la lecture IA
            </button>
          </div>
        </div>
      )}

      {/* ---------- Processing ---------- */}
      {plan && plan.status === "processing" && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 gap-4">
          <Spinner />
          <div>
            <div className="font-semibold text-dm-ink">
              Lecture IA en cours…
            </div>
            <div className="text-sm text-dm-muted mt-1">
              Mistral OCR lit le plan, puis Mistral Large structure le cartouche
              et la nomenclature.
            </div>
          </div>
        </div>
      )}

      {/* ---------- Error ---------- */}
      {plan && plan.status === "error" && (
        <div className="flex-1 flex items-center justify-center text-center p-10">
          <div className="max-w-sm bg-red-50 border border-red-200 rounded-lg p-5">
            <div className="font-semibold text-red-700 mb-2">
              Erreur de lecture
            </div>
            <div className="text-sm text-red-600 mb-4">
              {plan.error_message || "Une erreur est survenue."}
            </div>
            <button
              onClick={onExtract}
              className="inline-flex items-center gap-2 text-red-700 text-sm font-medium underline"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* ---------- Success : fiche complète ---------- */}
      {plan && plan.status === "success" && plan.extraction && (
        <>
          {/* En-tête fiche */}
          <div className="px-6 pt-5 pb-4 border-b border-dm-border shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-dm-ink text-lg truncate">
                {plan.extraction.title_block.title.value || plan.display_name}
              </h2>
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">
                {Math.round(plan.extraction.overall_confidence * 100)}%
              </span>
              <span className="text-xs text-dm-muted">Fiabilité IA</span>
              <div className="ml-auto text-xs text-dm-muted">
                Plan {plan.extraction.title_block.drawing_number.value || "—"}{" "}
                · Ind. {plan.extraction.title_block.revision.value || "—"} ·{" "}
                {plan.extraction.components.length} composant
                {plan.extraction.components.length > 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* CARTOUCHE */}
            <section>
              <h3 className="text-dm-red text-xs font-bold uppercase tracking-wider mb-3">
                Cartouche
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <FieldRow
                  label="N° de plan"
                  field={plan.extraction.title_block.drawing_number}
                />
                <FieldRow
                  label="Indice"
                  field={plan.extraction.title_block.revision}
                />
                <div className="col-span-2">
                  <FieldRow
                    label="Désignation"
                    field={plan.extraction.title_block.title}
                  />
                </div>
                {plan.extraction.title_block.subtitle.value && (
                  <div className="col-span-2">
                    <FieldRow
                      label="Sous-titre"
                      field={plan.extraction.title_block.subtitle}
                    />
                  </div>
                )}
                <FieldRow
                  label="Échelle"
                  field={plan.extraction.title_block.scale}
                />
                <FieldRow
                  label="Format"
                  field={plan.extraction.title_block.format}
                />
                <FieldRow
                  label="Date"
                  field={plan.extraction.title_block.date}
                />
                <FieldRow
                  label="Dessinateur"
                  field={plan.extraction.title_block.drawn_by}
                />
                <FieldRow
                  label="Vérificateur"
                  field={plan.extraction.title_block.checked_by}
                />
                <FieldRow
                  label="Approbateur"
                  field={plan.extraction.title_block.approved_by}
                />
              </div>
            </section>

            {/* PROJET */}
            <section>
              <h3 className="text-dm-red text-xs font-bold uppercase tracking-wider mb-3">
                Projet
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <FieldRow
                  label="Nom du projet"
                  field={plan.extraction.project.name}
                />
                <FieldRow
                  label="Client"
                  field={plan.extraction.project.client}
                />
                <FieldRow
                  label="Site d'installation"
                  field={plan.extraction.project.site}
                />
                <FieldRow
                  label="Réf. interne Durand"
                  field={plan.extraction.project.internal_reference}
                />
              </div>
            </section>

            {/* COMPOSANTS / NOMENCLATURE */}
            <section>
              <h3 className="text-dm-red text-xs font-bold uppercase tracking-wider mb-3">
                Nomenclature ({plan.extraction.components.length} composant
                {plan.extraction.components.length > 1 ? "s" : ""})
              </h3>
              {plan.extraction.components.length === 0 ? (
                <div className="text-sm text-dm-muted italic bg-dm-bg border border-dm-border rounded-lg p-3">
                  Aucun composant identifié dans la nomenclature.
                </div>
              ) : (
                <div className="space-y-3">
                  {plan.extraction.components.map((c, i) => (
                    <ComponentCard key={i} component={c} index={i} />
                  ))}
                </div>
              )}
            </section>

            {/* COTATIONS PRINCIPALES */}
            {plan.extraction.dimensions_principales.length > 0 && (
              <section>
                <h3 className="text-dm-red text-xs font-bold uppercase tracking-wider mb-3">
                  Cotations principales
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {plan.extraction.dimensions_principales.map((d, i) => (
                    <FieldRow
                      key={i}
                      label={d.label.value || `Cote ${i + 1}`}
                      field={{
                        value:
                          d.value.value && d.unit.value
                            ? `${d.value.value} ${d.unit.value}`
                            : d.value.value,
                        confidence: Math.min(
                          d.value.confidence,
                          d.unit.confidence || d.value.confidence
                        )
                      }}
                      compact
                    />
                  ))}
                </div>
              </section>
            )}

            {/* NOTES TECHNIQUES */}
            {plan.extraction.technical_notes.length > 0 && (
              <section>
                <h3 className="text-dm-red text-xs font-bold uppercase tracking-wider mb-3">
                  Notes techniques
                </h3>
                <div className="space-y-2">
                  {plan.extraction.technical_notes.map((n, i) => (
                    <div
                      key={i}
                      className="bg-dm-bg border border-dm-border rounded-lg p-3"
                    >
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-dm-muted">
                        {n.type.value || "Note"}
                      </div>
                      <div className="text-sm text-dm-ink mt-0.5">
                        {n.content.value || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* HISTORIQUE DES RÉVISIONS */}
            {plan.extraction.revision_history.length > 0 && (
              <section>
                <h3 className="text-dm-red text-xs font-bold uppercase tracking-wider mb-3">
                  Historique des révisions
                </h3>
                <div className="bg-white border border-dm-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-dm-bg text-xs uppercase tracking-wider text-dm-muted">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold w-12">
                          Ind.
                        </th>
                        <th className="px-3 py-2 text-left font-semibold w-24">
                          Date
                        </th>
                        <th className="px-3 py-2 text-left font-semibold">
                          Description
                        </th>
                        <th className="px-3 py-2 text-left font-semibold w-20">
                          Auteur
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dm-border">
                      {plan.extraction.revision_history.map((r, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 font-mono font-semibold">
                            {r.rev.value || "—"}
                          </td>
                          <td className="px-3 py-2 text-dm-muted">
                            {r.date.value || "—"}
                          </td>
                          <td className="px-3 py-2">
                            {r.description.value || "—"}
                          </td>
                          <td className="px-3 py-2 text-dm-muted">
                            {r.author.value || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* RÉFÉRENCES & NORMES */}
            {(plan.extraction.external_references.value.length > 0 ||
              plan.extraction.norms_cited.value.length > 0) && (
              <section className="grid grid-cols-2 gap-2">
                <FieldRow
                  label="Plans cités"
                  field={plan.extraction.external_references}
                />
                <FieldRow
                  label="Normes citées"
                  field={plan.extraction.norms_cited}
                />
              </section>
            )}

            {/* BANDEAU SYNTHÈSE */}
            <section className="bg-dm-red text-white rounded-xl p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="uppercase tracking-wider text-[10px] opacity-80 font-bold">
                    Composants
                  </div>
                  <div className="font-bold text-lg mt-0.5">
                    {plan.extraction.components.length}
                  </div>
                </div>
                <div>
                  <div className="uppercase tracking-wider text-[10px] opacity-80 font-bold">
                    Cotations
                  </div>
                  <div className="font-bold text-lg mt-0.5">
                    {plan.extraction.dimensions_principales.length}
                  </div>
                </div>
                <div>
                  <div className="uppercase tracking-wider text-[10px] opacity-80 font-bold">
                    Indice
                  </div>
                  <div className="font-bold text-lg mt-0.5">
                    {plan.extraction.title_block.revision.value || "—"}
                  </div>
                </div>
              </div>
            </section>

            {plan.extraction.notes.value && (
              <section>
                <h3 className="text-dm-red text-xs font-bold uppercase tracking-wider mb-2">
                  Notes
                </h3>
                <div className="text-sm text-dm-muted bg-dm-bg border border-dm-border rounded-lg p-3 whitespace-pre-wrap">
                  {plan.extraction.notes.value}
                </div>
              </section>
            )}
          </div>

          {/* Footer actions */}
          <div className="border-t border-dm-border px-6 py-3 flex items-center gap-3 shrink-0 text-xs">
            <div className="flex items-center gap-4 text-dm-muted">
              <span className="inline-flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Lecture en{" "}
                {plan.processing_ms
                  ? `${(plan.processing_ms / 1000).toFixed(1)}s`
                  : "—"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Qualité :{" "}
                <span className="font-semibold text-dm-ink">
                  {plan.extraction.overall_confidence >= 0.9
                    ? "excellente"
                    : plan.extraction.overall_confidence >= 0.7
                    ? "haute"
                    : "à vérifier"}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12h6M9 16h6M9 8h2M14 3h-4a2 2 0 00-2 2v14a2 2 0 002 2h8a2 2 0 002-2V9l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                {plan.extraction.components.length} composants extraits
              </span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1 px-3 py-2 border border-dm-border rounded-md text-dm-ink hover:bg-dm-bg font-medium"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M23 4v6h-6M20.49 15A9 9 0 115.64 5.64L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Re-lire
              </button>
              <button
                onClick={onValidate}
                className="inline-flex items-center gap-1 px-4 py-2 bg-dm-red hover:bg-dm-red-dark text-white rounded-md font-semibold shadow"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Valider et pousser PLM
              </button>
            </div>
          </div>

          {/* Bandeau technique */}
          <div className="border-t border-dm-border px-6 py-2 flex items-center gap-4 text-[10px] text-dm-muted shrink-0 bg-dm-bg/50 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-dm-red" /> Mistral OCR +
              Mistral Large (IA française)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-dm-red" /> Lecture
              documentaire
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-dm-red" /> API REST /
              Webhook PLM
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-dm-red" /> Human-in-the-loop
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500" /> Cloud
              souverain UE
            </span>
          </div>
        </>
      )}
    </section>
  );
}
