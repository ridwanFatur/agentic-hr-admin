"use client";

import { useEffect, useRef } from "react";

export interface DialogProps {
  /** Controls visibility */
  open: boolean;
  /** Called when the user dismisses the dialog (Escape key or backdrop click) */
  onClose: () => void;
  /** Dialog heading */
  title: string;
  /** Optional supporting text below the title */
  description?: string;
  /** Optional body content rendered between description and actions */
  children?: React.ReactNode;
  /** Action buttons rendered in the footer (right-aligned) */
  actions?: React.ReactNode;
  /**
   * Whether clicking the backdrop dismisses the dialog.
   * @default true
   */
  closeOnBackdrop?: boolean;
}

/**
 * Reusable modal dialog component.
 *
 * Features:
 * - Closes on Escape key
 * - Optional backdrop-click dismissal
 * - Body scroll lock while open
 * - Focus returns to trigger element on close
 * - Fully accessible: role="dialog", aria-modal, aria-labelledby, aria-describedby
 */
export default function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  closeOnBackdrop = true,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store and restore focus
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Move focus into the dialog panel
      requestAnimationFrame(() => {
        panelRef.current?.focus();
      });
    } else {
      previousFocusRef.current?.focus();
    }
  }, [open]);

  // Dismiss on Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby={description ? "dialog-description" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative z-10 mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-200 focus:outline-none"
      >
        {/* Header */}
        <div className="mb-1">
          <h2
            id="dialog-title"
            className="text-lg font-semibold text-gray-900"
          >
            {title}
          </h2>
          {description && (
            <p
              id="dialog-description"
              className="mt-2 text-sm text-gray-500 leading-relaxed"
            >
              {description}
            </p>
          )}
        </div>

        {/* Optional body content */}
        {children && <div className="mt-4">{children}</div>}

        {/* Footer actions */}
        {actions && (
          <div className="mt-6 flex items-center justify-end gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
