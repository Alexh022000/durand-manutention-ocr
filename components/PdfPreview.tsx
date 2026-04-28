"use client";

import type { Plan } from "@/lib/types";

/**
 * Aperçu d'un plan technique — PDF via <iframe>, image via <img>.
 * Si le plan est mocké (file_data_url null), affiche un faux plan stylisé
 * avec cartouche/nomenclature pour que la démo reste crédible avant l'upload
 * d'un vrai document.
 */
export default function PdfPreview({ plan }: { plan: Plan | null }) {
  return (
    <section className="flex-1 bg-dm-secondary-dark flex flex-col min-w-0">
      {/* Header */}
      <div className="h-14 bg-white border-b border-dm-border flex items-center justify-between px-5 shrink-0">
        <div className="font-bold text-dm-ink text-sm tracking-wider uppercase">
          Aperçu du plan
        </div>
        {plan && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center bg-dm-red-light text-dm-red-dark text-xs font-semibold px-2 py-1 rounded">
              {plan.mime_type.includes("pdf") ? "PDF" : "IMAGE"}
            </span>
            {plan.extraction && (
              <span className="inline-flex items-center bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded">
                {Math.round(plan.extraction.overall_confidence * 100)}%
                fiabilité
              </span>
            )}
          </div>
        )}
      </div>

      {/* Corps */}
      <div className="flex-1 min-h-0 flex items-stretch justify-center p-3">
        {!plan && (
          <div className="text-white/60 text-sm mt-16 self-start">
            Sélectionne un plan à gauche
          </div>
        )}

        {plan && plan.file_data_url && plan.mime_type.includes("pdf") && (
          <iframe
            // #navpanes=0 masque la sidebar de miniatures de Chrome
            // #toolbar=1 garde la barre d'outils (zoom, download)
            // #view=FitH force un fit horizontal -> le document prend toute la largeur dispo
            src={`${plan.file_data_url}#navpanes=0&toolbar=1&view=FitH`}
            title={plan.filename}
            className="w-full h-full rounded-lg shadow-xl bg-white border-0"
          />
        )}

        {plan && plan.file_data_url && !plan.mime_type.includes("pdf") && (
          <img
            src={plan.file_data_url}
            alt={plan.filename}
            className="max-w-full max-h-full object-contain rounded-lg shadow-xl bg-white"
          />
        )}

        {plan && !plan.file_data_url && (
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[760px] aspect-[1.414/1] p-6 flex flex-col gap-3 text-[10px] relative">
            {/* Faux plan stylisé pour données mockées (format paysage A3-like) */}

            {/* Cadre du plan */}
            <div className="absolute inset-3 border border-slate-300 pointer-events-none" />
            <div className="absolute inset-5 border border-slate-200 pointer-events-none" />

            {/* Zone de dessin schématique */}
            <div className="flex-1 mx-2 mt-1 mb-2 relative flex items-center justify-center">
              <svg
                viewBox="0 0 500 250"
                className="w-full h-full text-slate-500"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Schéma stylisé d'un convoyeur ou élévateur */}
                <rect x="40" y="80" width="420" height="90" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <circle cx="80" cy="125" r="22" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <circle cx="420" cy="125" r="22" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <line x1="80" y1="103" x2="420" y2="103" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 2" />
                <line x1="80" y1="147" x2="420" y2="147" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 2" />
                {/* Cotation */}
                <line x1="40" y1="200" x2="460" y2="200" stroke="currentColor" strokeWidth="0.6" />
                <line x1="40" y1="195" x2="40" y2="205" stroke="currentColor" strokeWidth="0.6" />
                <line x1="460" y1="195" x2="460" y2="205" stroke="currentColor" strokeWidth="0.6" />
                <text x="250" y="215" fontSize="8" textAnchor="middle" fill="currentColor">
                  L = {plan.extraction?.dimensions_principales[0]?.value.value ?? "—"}
                </text>
                {/* Trémie d'entrée */}
                <path d="M 200 30 L 260 30 L 240 80 L 220 80 Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <text x="230" y="22" fontSize="8" textAnchor="middle" fill="currentColor">Entrée</text>
                {/* Sortie */}
                <path d="M 380 170 L 380 210 L 440 210 L 440 170" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <text x="410" y="225" fontSize="8" textAnchor="middle" fill="currentColor">Sortie</text>
              </svg>
            </div>

            {/* Cartouche en bas à droite */}
            <div className="absolute bottom-5 right-5 left-1/2 border border-slate-400 grid grid-cols-12 text-[8.5px] bg-white">
              {/* Logo + société */}
              <div className="col-span-3 border-r border-slate-300 p-2 flex flex-col items-center justify-center">
                <div className="w-12 h-5 bg-dm-red rounded" />
                <div className="text-slate-600 mt-1 text-center text-[7.5px]">
                  Durand Manutention
                </div>
              </div>
              {/* Bloc titre */}
              <div className="col-span-6 border-r border-slate-300 p-2 flex flex-col justify-center">
                <div className="font-bold text-dm-ink text-[10px] truncate">
                  {plan.extraction?.title_block.title.value || plan.display_name}
                </div>
                {plan.extraction?.title_block.subtitle.value && (
                  <div className="text-slate-500 truncate">
                    {plan.extraction.title_block.subtitle.value}
                  </div>
                )}
                <div className="text-slate-500 mt-0.5">
                  {plan.extraction?.project.client.value
                    ? `Client : ${plan.extraction.project.client.value}`
                    : ""}
                </div>
              </div>
              {/* Métadonnées */}
              <div className="col-span-3 p-2 flex flex-col text-[7.5px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">N°</span>
                  <span className="font-semibold">
                    {plan.extraction?.title_block.drawing_number.value || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Indice</span>
                  <span className="font-semibold">
                    {plan.extraction?.title_block.revision.value || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Échelle</span>
                  <span className="font-semibold">
                    {plan.extraction?.title_block.scale.value || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Format</span>
                  <span className="font-semibold">
                    {plan.extraction?.title_block.format.value || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Tableau de révisions en haut à droite */}
            <div className="absolute top-5 right-5 border border-slate-300 text-[8px] bg-white">
              <div className="bg-slate-100 px-2 py-1 font-semibold text-slate-700 border-b border-slate-300">
                Révisions
              </div>
              {plan.extraction?.revision_history.slice(0, 3).map((r, i) => (
                <div
                  key={i}
                  className="px-2 py-1 border-b border-slate-200 last:border-b-0 flex gap-2"
                >
                  <span className="font-semibold w-3">{r.rev.value || "—"}</span>
                  <span className="text-slate-500">{r.date.value || "—"}</span>
                </div>
              )) ?? (
                <div className="px-2 py-1 text-slate-400 italic">—</div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
