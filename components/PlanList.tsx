"use client";

import type { Plan } from "@/lib/types";
import PlanCard from "./PlanCard";

export default function PlanList({
  plans,
  selectedId,
  onSelect,
  onDelete,
  width
}: {
  plans: Plan[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  width?: number;
}) {
  return (
    <aside
      style={width ? { width: `${width}px` } : undefined}
      className="shrink-0 bg-white flex flex-col min-w-0"
    >
      {/* Header */}
      <div className="px-4 h-14 flex items-center justify-between border-b border-dm-border shrink-0">
        <div className="font-bold text-dm-ink text-sm tracking-wider uppercase">
          Plans reçus
        </div>
        <span className="text-xs text-dm-muted bg-dm-bg px-2 py-0.5 rounded-full">
          {plans.length} reçus
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {plans.length === 0 && (
          <div className="text-center text-sm text-dm-muted mt-8 px-4">
            Aucun plan pour le moment. Utilise le bouton{" "}
            <span className="text-dm-red font-medium">Déposer un plan</span>{" "}
            pour commencer.
          </div>
        )}
        {plans.map((p) => (
          <PlanCard
            key={p.id}
            plan={p}
            selected={p.id === selectedId}
            onClick={() => onSelect(p.id)}
            onDelete={onDelete ? () => onDelete(p.id) : undefined}
          />
        ))}
      </div>

      {/* Footer pagination (statique pour démo) */}
      <div className="border-t border-dm-border p-3 flex items-center justify-between text-xs shrink-0">
        <button className="px-3 py-1.5 rounded-md border border-dm-border text-dm-muted hover:bg-dm-bg">
          ← Préc.
        </button>
        <span className="text-dm-muted">1 / 1</span>
        <button className="px-3 py-1.5 rounded-md border border-dm-border text-dm-muted hover:bg-dm-bg">
          Suiv. →
        </button>
      </div>
    </aside>
  );
}
