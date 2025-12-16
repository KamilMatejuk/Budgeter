'use client';

import React, { PropsWithChildren, useEffect, useRef } from "react";
import ButtonWithLoader from "../button/ButtonWithLoader";
import { Item } from "../table/Table";


const classes = {
  container: "fixed inset-0 z-50 flex items-center justify-center m-0 p-0",
  backdrop: "absolute inset-0 backdrop-blur-xs bg-black/40",
  dialog: "relative z-10 min-w-96 p-4 rounded-2xl bg-first-bg shadow-2xl ring-1 ring-black/10 flex flex-col gap-4",
  title: "text-lg font-bold text-center",
  buttons: "flex justify-end gap-2",
};


export interface ModalProps extends PropsWithChildren {
  open: boolean;
  onClose: () => Promise<void>;
  cancellable?: boolean;
  onSave?: () => Promise<void>;
  onDelete?: () => Promise<void>;
  title?: string;
}

export interface BackendModalProps<T extends Item> extends ModalProps {
  url: string;
  item?: T | null;
}

export default function Modal({ open, onClose, children, cancellable, onSave, onDelete, title }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // focus the dialog for accessibility, and exit with escape
  useEffect(() => {
    if (!open) return;
    const prevActive: Element | null = document.activeElement;
    dialogRef.current?.focus();
    const escape = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      // Ignore Escape from inputs / textareas / selects
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.getAttribute("role") === "combobox") return;
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("keydown", escape);
      if (prevActive instanceof HTMLElement) prevActive.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={classes.container} aria-hidden={open ? "false" : "true"} onClick={onClose}>
      <div className={classes.backdrop} />
      <div
        role="dialog"
        aria-modal="true"
        ref={dialogRef}
        tabIndex={-1}
        className={classes.dialog}
        onClick={e => e.stopPropagation()}
      >
        {title && <h3 className={classes.title}>{title}</h3>}
        {children}
        {(cancellable || onSave || onDelete) &&
          <div className={classes.buttons}>
            {cancellable && <ButtonWithLoader action="neutral" onClick={onClose} text="Cancel" />}
            {onSave && <ButtonWithLoader action="positive" onClick={onSave} text="Save" />}
            {onDelete && <ButtonWithLoader action="negative" onClick={onDelete} text="Delete" />}
          </div>
        }
      </div>
    </div>
  );
}
