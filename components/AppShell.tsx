"use client";

import { useCallback, useMemo, useState } from "react";
import type { Plan, Extraction } from "@/lib/types";
import { MOCK_PLANS } from "@/lib/mockPlans";
import TopBar from "./TopBar";
import PlanList from "./PlanList";
import PdfPreview from "./PdfPreview";
import ExtractionPanel from "./ExtractionPanel";
import UploadModal from "./UploadModal";
import ResizableDivider from "./ResizableDivider";
import { GedView, StatsView } from "./SecondaryTabs";

type Tab = "lecture" | "ged" | "stats";

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function AppShell() {
  const [plans, setPlans] = useState<Plan[]>(MOCK_PLANS);
  const [selectedId, setSelectedId] = useState<string | null>(
    MOCK_PLANS[0]?.id ?? null
  );
  const [uploadOpen, setUploadOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("lecture");
  const [leftWidth, setLeftWidth] = useState<number>(320);
  const [rightWidth, setRightWidth] = useState<number>(560);

  const selected = useMemo(
    () => plans.find((p) => p.id === selectedId) ?? null,
    [plans, selectedId]
  );

  const patchPlan = useCallback((id: string, patch: Partial<Plan>) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      const dataUrl = await readFileAsDataURL(file);
      const now = new Date();
      const short = now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
      });
      const newPlan: Plan = {
        id: `up-${Date.now()}`,
        filename: file.name,
        display_name: file.name.replace(/\.[a-z0-9]+$/i, ""),
        file_data_url: dataUrl,
        mime_type: file.type,
        uploaded_at: now.toISOString(),
        uploaded_at_short: short,
        status: "pending",
        extraction: null,
        processing_ms: null,
        error_message: null,
        model_used: null
      };
      setPlans((prev) => [newPlan, ...prev]);
      setSelectedId(newPlan.id);
      setTab("lecture");
    },
    []
  );

  const handleExtract = useCallback(async () => {
    if (!selected) return;
    const id = selected.id;
    patchPlan(id, { status: "processing", error_message: null });

    // Si le plan n'a pas de fichier réel (données mockées), on simule une lecture
    if (!selected.file_data_url) {
      setTimeout(() => {
        patchPlan(id, {
          status: "success",
          processing_ms: 11200,
          model_used: "mistral-ocr-latest → mistral-large-latest",
          extraction: fakeExtractionFor(selected.display_name)
        });
      }, 1400);
      return;
    }

    try {
      // Reconstruire un File à partir de la data URL
      const res0 = await fetch(selected.file_data_url);
      const blob = await res0.blob();
      const file = new File([blob], selected.filename, { type: blob.type });

      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: form });
      if (!res.ok) {
        const p = await res.json().catch(() => ({}));
        throw new Error(p.error || `Erreur serveur (${res.status}).`);
      }
      const data = await res.json();
      patchPlan(id, {
        status: "success",
        processing_ms: data.processing_ms ?? null,
        model_used: data.raw_model ?? null,
        extraction: data.extraction as Extraction
      });
    } catch (e: any) {
      patchPlan(id, {
        status: "error",
        error_message: e?.message || "Erreur inconnue"
      });
    }
  }, [selected, patchPlan]);

  const handleValidate = useCallback(() => {
    if (!selected) return;
    // Démo : on affiche juste une notification via alert pour simuler le push PLM
    alert(
      `Plan ${selected.extraction?.title_block.drawing_number.value || selected.id} validé et poussé vers le PLM (démo).`
    );
  }, [selected]);

  const handleDelete = useCallback(
    (id: string) => {
      setPlans((prev) => {
        const idx = prev.findIndex((p) => p.id === id);
        const next = prev.filter((p) => p.id !== id);
        if (selectedId === id) {
          const newSelected = next[idx] ?? next[idx - 1] ?? next[0] ?? null;
          setSelectedId(newSelected?.id ?? null);
        }
        return next;
      });
    },
    [selectedId]
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-dm-bg">
      <TopBar
        activeTab={tab}
        onTabChange={setTab}
        onDeposer={() => setUploadOpen(true)}
      />

      <div className="flex-1 flex min-h-0">
        {tab === "lecture" && (
          <>
            <PlanList
              plans={plans}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={handleDelete}
              width={leftWidth}
            />
            <ResizableDivider
              currentWidth={leftWidth}
              onResize={setLeftWidth}
              direction="left"
              min={240}
              max={520}
            />
            <PdfPreview plan={selected} />
            <ResizableDivider
              currentWidth={rightWidth}
              onResize={setRightWidth}
              direction="right"
              min={360}
              max={820}
            />
            <ExtractionPanel
              plan={selected}
              onExtract={handleExtract}
              onRetry={handleExtract}
              onValidate={handleValidate}
              width={rightWidth}
            />
          </>
        )}
        {tab === "ged" && <GedView plans={plans} />}
        {tab === "stats" && <StatsView plans={plans} />}
      </div>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}

/**
 * Génère une extraction plausible pour un plan mocké, afin que le prospect
 * puisse cliquer sur "Lancer la lecture IA" même sans plan réel uploadé.
 */
function fakeExtractionFor(displayName: string): Extraction {
  const f = <T,>(v: T, c = 0.92) => ({ value: v, confidence: c });
  const slug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 12);
  const num = Math.floor(Math.random() * 900 + 100);
  return {
    title_block: {
      drawing_number: f(`DM-2026-${num}`, 0.96),
      revision: f("B", 0.92),
      title: f(displayName.toUpperCase(), 0.95),
      subtitle: f("Plan d'ensemble", 0.85),
      scale: f("1:25", 0.9),
      format: f("A1", 0.93),
      date: f("2026-04-21", 0.92),
      drawn_by: f("M. LEROY", 0.85),
      checked_by: f("J. BERTRAND", 0.82),
      approved_by: f("P. DURAND", 0.78)
    },
    project: {
      name: f("Mise en place ligne de réception vrac", 0.85),
      client: f("Client " + slug.toUpperCase().slice(0, 1), 0.82),
      site: f("Site de Beauce — silo Nord", 0.78),
      internal_reference: f(`PRJ-2026-${Math.floor(Math.random() * 90 + 10)}`, 0.84)
    },
    components: [
      {
        item_number: f("1", 0.96),
        designation: f("Tambour de tête motorisé", 0.93),
        reference: f("DM-TT-400-IE3", 0.9),
        quantity: f(1, 0.97),
        material: f("Acier S235", 0.88),
        dimensions: f("Ø400 × 800 mm", 0.91),
        weight_kg: f(85, 0.82)
      },
      {
        item_number: f("2", 0.95),
        designation: f("Bande transporteuse PVC alimentaire", 0.9),
        reference: f("BANDE-PVC-650-FDA", 0.86),
        quantity: f(1, 0.94),
        material: f("PVC qualité alimentaire", 0.85),
        dimensions: f("650 mm × 12 m", 0.88),
        weight_kg: f(42, 0.7)
      },
      {
        item_number: f("3", 0.94),
        designation: f("Châssis support en profilés mécano-soudés", 0.9),
        reference: f("CH-MS-12000", 0.84),
        quantity: f(1, 0.94),
        material: f("Acier S235 galvanisé", 0.86),
        dimensions: f("12000 × 800 × 1200 mm", 0.88),
        weight_kg: f(380, 0.78)
      }
    ],
    dimensions_principales: [
      { label: f("Longueur totale", 0.95), value: f("12000", 0.94), unit: f("mm", 0.96) },
      { label: f("Largeur de bande", 0.93), value: f("650", 0.94), unit: f("mm", 0.96) },
      { label: f("Débit nominal", 0.88), value: f("25", 0.86), unit: f("t/h", 0.9) },
      { label: f("Puissance moteur", 0.86), value: f("1.5", 0.88), unit: f("kW", 0.92) }
    ],
    technical_notes: [
      {
        type: f("Tolérances générales", 0.9),
        content: f("ISO 2768-mK pour pièces mécano-soudées", 0.86)
      },
      {
        type: f("Finition", 0.88),
        content: f(
          "Galvanisation à chaud pour le châssis, peinture époxy RAL 3000 sur les capotages",
          0.82
        )
      }
    ],
    revision_history: [
      {
        rev: f("A", 0.95),
        date: f("2026-03-15", 0.9),
        description: f("Création", 0.92),
        author: f("MLE", 0.85)
      },
      {
        rev: f("B", 0.95),
        date: f("2026-04-18", 0.92),
        description: f("Modification dimensions trémie d'entrée", 0.88),
        author: f("MLE", 0.85)
      }
    ],
    external_references: f(["DM-2026-138", "DM-2026-141"], 0.82),
    norms_cited: f(["EN ISO 13857", "NF EN 619", "ATEX 22"], 0.85),
    notes: f(null, 0),
    overall_confidence: 0.88
  };
}
