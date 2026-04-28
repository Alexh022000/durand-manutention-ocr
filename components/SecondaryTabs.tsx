"use client";

import type { Plan } from "@/lib/types";

/**
 * Vues "GED" et "Statistiques" simplifiées pour la démo — montrent au prospect
 * que l'application est une vraie plateforme de lecture de plans, pas un
 * simple POC.
 */

export function GedView({ plans }: { plans: Plan[] }) {
  const processed = plans.filter((p) => p.status === "success");
  return (
    <div className="flex-1 overflow-auto p-8 bg-dm-bg">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-dm-ink mb-1">
          Gestion Électronique de Documents
        </h2>
        <p className="text-dm-muted mb-6">
          Historique complet des plans techniques traités — accessible à tout
          moment, exportable vers votre PLM / GED.
        </p>

        <div className="bg-white border border-dm-border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-dm-bg border-b border-dm-border">
              <tr className="text-left text-xs uppercase tracking-wider text-dm-muted">
                <th className="px-4 py-3 font-semibold">N° de plan</th>
                <th className="px-4 py-3 font-semibold">Désignation</th>
                <th className="px-4 py-3 font-semibold">Indice</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold text-right">
                  Composants
                </th>
                <th className="px-4 py-3 font-semibold text-right">
                  Fiabilité
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dm-border">
              {processed.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-dm-muted"
                  >
                    Aucun plan traité pour le moment.
                  </td>
                </tr>
              )}
              {processed.map((p) => (
                <tr key={p.id} className="hover:bg-dm-bg/50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-dm-ink">
                    {p.extraction?.title_block.drawing_number.value || "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-dm-ink">
                    {p.extraction?.title_block.title.value || p.display_name}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {p.extraction?.title_block.revision.value || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {p.extraction?.project.client.value || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.extraction?.components.length ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                        (p.extraction?.overall_confidence ?? 0) >= 0.85
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {Math.round(
                        (p.extraction?.overall_confidence ?? 0) * 100
                      )}
                      %
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function StatsView({ plans }: { plans: Plan[] }) {
  const processed = plans.filter((p) => p.status === "success");
  const total = plans.length;
  const successRate = total > 0 ? processed.length / total : 0;
  const avgMs =
    processed.length > 0
      ? processed.reduce((s, p) => s + (p.processing_ms || 0), 0) /
        processed.length
      : 0;
  const avgConfidence =
    processed.length > 0
      ? processed.reduce(
          (s, p) => s + (p.extraction?.overall_confidence || 0),
          0
        ) / processed.length
      : 0;

  // Hypothèse : 25 min de saisie/contrôle manuel économisés par plan
  const hoursSaved = ((processed.length * 25) / 60).toFixed(1);

  const totalComponents = processed.reduce(
    (s, p) => s + (p.extraction?.components.length || 0),
    0
  );

  const kpis = [
    {
      label: "Plans traités",
      value: String(processed.length),
      sub: `sur ${total} reçus`
    },
    {
      label: "Taux de succès",
      value: `${Math.round(successRate * 100)}%`,
      sub: "lectures valides"
    },
    {
      label: "Temps moyen",
      value: `${(avgMs / 1000).toFixed(1)}s`,
      sub: "par plan"
    },
    {
      label: "Fiabilité moyenne",
      value: `${Math.round(avgConfidence * 100)}%`,
      sub: "confiance IA"
    },
    {
      label: "Gain estimé",
      value: `${hoursSaved}h`,
      sub: "temps de saisie évité"
    },
    {
      label: "Composants extraits",
      value: String(totalComponents),
      sub: "lignes de nomenclature"
    }
  ];

  return (
    <div className="flex-1 overflow-auto p-8 bg-dm-bg">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-dm-ink mb-1">Statistiques</h2>
        <p className="text-dm-muted mb-6">
          Performance de la lecture IA sur les plans Durand Manutention.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {kpis.map((k) => (
            <div
              key={k.label}
              className="bg-white border border-dm-border rounded-xl p-5 shadow-sm"
            >
              <div className="text-xs uppercase tracking-wider text-dm-muted font-semibold">
                {k.label}
              </div>
              <div className="mt-2 text-3xl font-bold text-dm-ink">
                {k.value}
              </div>
              <div className="text-xs text-dm-muted mt-1">{k.sub}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white border border-dm-border rounded-xl p-5 shadow-sm">
          <div className="text-sm font-semibold text-dm-ink mb-3">
            Répartition par matériau (composants)
          </div>
          <MaterialBreakdown plans={processed} />
        </div>
      </div>
    </div>
  );
}

function MaterialBreakdown({ plans }: { plans: Plan[] }) {
  const counts: Record<string, number> = {};
  plans.forEach((p) =>
    p.extraction?.components.forEach((c) => {
      const m = c.material.value || "Non précisé";
      counts[m] = (counts[m] || 0) + (c.quantity.value || 1);
    })
  );
  const items = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...items.map(([, v]) => v));

  if (items.length === 0) {
    return (
      <div className="text-sm text-dm-muted italic">
        Aucune donnée — traite au moins un plan pour voir les statistiques.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map(([material, count]) => (
        <div key={material} className="flex items-center gap-3 text-sm">
          <div className="w-32 font-medium text-dm-ink shrink-0 truncate">
            {material}
          </div>
          <div className="flex-1 bg-dm-bg rounded-full h-6 overflow-hidden">
            <div
              className="h-full bg-dm-red rounded-full flex items-center px-3 text-xs font-semibold text-white"
              style={{ width: `${(count / max) * 100}%` }}
            >
              {count}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
