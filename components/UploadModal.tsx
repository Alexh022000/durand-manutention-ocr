"use client";

import { useRef, useState } from "react";

const ACCEPTED = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp"
];
const MAX_SIZE_MB = 12;

export default function UploadModal({
  open,
  onClose,
  onUpload
}: {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const validate = (file: File): boolean => {
    if (!ACCEPTED.includes(file.type)) {
      setError("Format non supporté — PDF, PNG, JPG ou WEBP uniquement.");
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${MAX_SIZE_MB} Mo).`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleFile = (file: File) => {
    if (!validate(file)) return;
    onUpload(file);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-dm-ink">
              Déposer un plan technique
            </h3>
            <p className="text-sm text-dm-muted mt-0.5">
              PDF, PNG, JPG — max {MAX_SIZE_MB} Mo
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-dm-muted hover:text-dm-ink p-1"
            aria-label="Fermer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className={`rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
            dragActive
              ? "border-dm-red bg-dm-red-light"
              : "border-dm-border hover:border-dm-red/60 hover:bg-dm-red-light/30"
          }`}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <div className="w-14 h-14 rounded-full bg-dm-red-light flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" stroke="#C6000A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="mt-4 font-medium text-dm-ink">
            Glisse ton plan ici
          </div>
          <div className="text-sm text-dm-muted mt-1">
            ou{" "}
            <span className="text-dm-red font-medium underline">
              parcours tes fichiers
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="mt-5 text-xs text-dm-muted">
          Aucun document n'est conservé après traitement — traitement en mémoire
          uniquement côté serveur.
        </div>
      </div>
    </div>
  );
}
