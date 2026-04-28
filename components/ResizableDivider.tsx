"use client";

import { useCallback } from "react";

/**
 * Barre verticale fine, draggable à la souris pour redimensionner un panneau voisin.
 *
 * Passer `direction: "left"` quand le divider est à droite d'un panneau à gauche
 * (bouger à droite = agrandir le panneau).
 * Passer `direction: "right"` quand le divider est à gauche d'un panneau à droite
 * (bouger à gauche = agrandir le panneau).
 */
export default function ResizableDivider({
  currentWidth,
  onResize,
  direction,
  min = 220,
  max = 900
}: {
  currentWidth: number;
  onResize: (newWidth: number) => void;
  direction: "left" | "right";
  min?: number;
  max?: number;
}) {
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = currentWidth;
      const sign = direction === "left" ? 1 : -1;

      // Évite la sélection de texte pendant le drag
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";

      const onMove = (me: MouseEvent) => {
        const delta = (me.clientX - startX) * sign;
        const next = Math.max(min, Math.min(max, startWidth + delta));
        onResize(next);
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [currentWidth, onResize, direction, min, max]
  );

  return (
    <div
      onMouseDown={onMouseDown}
      role="separator"
      aria-orientation="vertical"
      className="group relative w-1 shrink-0 bg-dm-border hover:bg-dm-red/60 cursor-col-resize transition-colors"
      title="Glisser pour redimensionner"
    >
      {/* Zone de hit plus large que le visuel, pour faciliter l'accrochage */}
      <div className="absolute inset-y-0 -left-1 -right-1" />
    </div>
  );
}
