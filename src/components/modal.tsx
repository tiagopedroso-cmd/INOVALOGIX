"use client";

import { useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0E1B22]/45 p-4 pt-10 backdrop-blur-[2px] sm:pt-16">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-[20px] border border-border bg-white p-5 shadow-[0_24px_60px_rgba(16,40,44,.24)] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-[#F2F5F6]"
            aria-label="Fechar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-border-strong px-3.5 py-2.5 text-sm outline-none focus:border-primary";
export const labelClass = "mb-1 block text-[13px] font-semibold text-[#2B3B41]";
