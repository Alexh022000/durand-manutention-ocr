"use client";

import type { ConfidenceField } from "@/lib/types";

function confColor(c: number) {
  if (c === 0) return { dot: "bg-red-500", pct: "text-red-500" };
  if (c < 0.6) return { dot: "bg-amber-500", pct: "text-amber-500" };
  if (c < 0.85) return { dot: "bg-sky-500", pct: "text-sky-600" };
  return { dot: "bg-emerald-500", pct: "text-emerald-600" };
}

export default function FieldRow<T>({
  label,
  field,
  render,
  compact = false
}: {
  label: string;
  field: ConfidenceField<T>;
  render?: (v: T) => React.ReactNode;
  compact?: boolean;
}) {
  const displayValue = (() => {
    const v = field.value;
    if (v == null || v === "" || (Array.isArray(v) && v.length === 0)) {
      return <span className="text-dm-muted italic">—</span>;
    }
    if (render) return render(v);
    if (Array.isArray(v)) return (v as unknown as string[]).join(", ");
    return String(v);
  })();

  const c = confColor(field.confidence);

  return (
    <div
      className={`rounded-lg bg-dm-bg border border-dm-border px-3 ${
        compact ? "py-2" : "py-2.5"
      }`}
    >
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-dm-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
          {label}
        </span>
        <span className={`${c.pct} font-bold`}>
          {Math.round(field.confidence * 100)}%
        </span>
      </div>
      <div className="mt-1 text-sm text-dm-ink font-medium break-words">
        {displayValue}
      </div>
    </div>
  );
}
