"use client";

import type { Plan, PlanStatus } from "@/lib/types";

function StatusPill({ status }: { status: PlanStatus }) {
  const styles: Record<PlanStatus, { label: string; cls: string }> = {
    pending: { label: "En attente", cls: "bg-slate-100 text-slate-600" },
    processing: { label: "Lecture…", cls: "bg-amber-50 text-amber-700" },
    success: { label: "Lu", cls: "bg-emerald-50 text-emerald-700" },
    error: { label: "Erreur", cls: "bg-red-50 text-red-600" }
  };
  const s = styles[status];
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-md ${s.cls} shrink-0`}>
      {s.label}
    </span>
  );
}

export default function PlanCard({
  plan,
  selected,
  onClick,
  onDelete
}: {
  plan: Plan;
  selected: boolean;
  onClick: () => void;
  onDelete?: () => void;
}) {
  const componentCount = plan.extraction?.components.length ?? null;

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKey}
      role="button"
      tabIndex={0}
      className={`group w-full text-left rounded-lg border transition-all px-3 py-3 flex items-start gap-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-dm-red/40 ${
        selected
          ? "bg-dm-red-light border-dm-red shadow-sm"
          : "bg-white border-dm-border hover:border-dm-red/40 hover:bg-dm-red-light/30"
      }`}
    >
      {/* Badge PDF ou check */}
      <div
        className={`w-10 h-10 rounded-md flex items-center justify-center text-[10px] font-bold tracking-wide shrink-0 ${
          plan.status === "success"
            ? "bg-emerald-100 text-emerald-700"
            : selected
            ? "bg-white text-dm-red border border-dm-red/30"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {plan.status === "success" ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          "PDF"
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="font-semibold text-dm-ink text-sm truncate">
            {plan.display_name}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <StatusPill status={plan.status} />
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Supprimer le plan "${plan.display_name}" ?`)) {
                    onDelete();
                  }
                }}
                className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded hover:bg-red-100 text-dm-muted hover:text-red-600 flex items-center justify-center transition-all"
                aria-label={`Supprimer ${plan.display_name}`}
                title="Supprimer ce plan"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="text-xs text-dm-muted mt-0.5 truncate">
          <span className="inline-flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            {plan.filename.length > 24
              ? plan.filename.slice(0, 24) + "…"
              : plan.filename}
          </span>
          {componentCount != null && (
            <>
              <span className="mx-1.5">·</span>
              <span>{componentCount} comp.</span>
            </>
          )}
          <span className="mx-1.5">·</span>
          <span>{plan.uploaded_at_short}</span>
        </div>
      </div>
    </div>
  );
}
