"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Accessible admin modal built on the native <dialog> element.
 *
 * Uses `showModal()` so the browser handles the top layer, backdrop, focus
 * trapping and Escape-to-close for free. We add: click-outside to dismiss,
 * scroll lock, and a titled header. Rendering nothing when closed keeps forms
 * unmounted, so each open starts from clean defaults.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={ref}
      className={`admin-modal admin-modal-${size}`}
      // The native dialog fires `cancel` on Escape and `close` on close();
      // route both back to the caller so its state stays in sync.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      // A click landing on the dialog element itself is the backdrop area.
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-labelledby="admin-modal-title"
    >
      <div className="admin-modal-inner">
        <header className="admin-modal-head">
          <div>
            <h2 id="admin-modal-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>
        <div className="admin-modal-body">{children}</div>
      </div>
    </dialog>
  );
}
