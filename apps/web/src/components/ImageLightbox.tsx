import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center cursor-zoom-out"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
        <X className="w-8 h-8" />
      </button>
      <img
        src={src}
        className="max-w-[90vw] max-h-[90vh] object-contain cursor-default rounded-lg"
        onClick={(e) => e.stopPropagation()}
        alt=""
      />
    </div>
  );
}
