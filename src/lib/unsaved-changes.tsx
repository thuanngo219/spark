"use client";

import { Icon } from "@/components/ui/Icon";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useId } from "react";

export function useUnsavedChanges(dirty: boolean) {
  const dirtyRef = useRef(dirty);
  const [open, setOpen] = useState(false);
  const pending = useRef<{ promise: Promise<boolean>; resolve: (discard: boolean) => void } | null>(null);
  useEffect(() => () => { pending.current?.resolve(false); pending.current = null; }, []);
  const respond = useCallback((discard: boolean) => {
    setOpen(false);
    pending.current?.resolve(discard);
    pending.current = null;
  }, []);
  const canDiscard = useCallback((force = false): Promise<boolean> => {
    if (pending.current) return pending.current.promise;
    if (!force && !dirtyRef.current) return Promise.resolve(true);
    let resolve!: (discard: boolean) => void;
    const promise = new Promise<boolean>(done => { resolve = done; });
    pending.current = { promise, resolve };
    setOpen(true);
    return promise;
  }, []);
  useLayoutEffect(() => { dirtyRef.current = dirty; }, [dirty]);
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);
  return { canDiscard, confirmation: open ? <DiscardChangesDialog onRespond={respond} /> : null };
}

function DiscardChangesDialog({ onRespond }: { onRespond: (discard: boolean) => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  const choose = (discard: boolean) => {
    dialogRef.current?.close();
    onRespond(discard);
  };
  return createPortal(
    <dialog ref={dialogRef} className="editor-sheet confirm-delete-sheet unsaved-changes-dialog"
      aria-labelledby={titleId} aria-describedby={descriptionId}
      onClick={event => event.stopPropagation()}
      onCancel={event => { event.preventDefault(); choose(false); }}
      onKeyDownCapture={event => {
        event.stopPropagation();
        if (event.key === "Escape") { event.preventDefault(); choose(false); }
        if (event.key === "Tab") {
          const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>("button");
          const first = buttons[0];
          const last = buttons[buttons.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      }}>
      <div className="editor-header"><h2 id={titleId}>Nội dung chưa lưu?</h2></div>
      <p id={descriptionId}>Bạn có thay đổi chưa được lưu. Bạn có thật sự muốn thoát?</p>
      <div className="editor-actions">
        <button type="button" className="primary-button" autoFocus onClick={() => choose(false)}><Icon name="edit" size={17} />Tiếp tục sửa</button>
        <button type="button" className="delete-button" onClick={() => choose(true)}><Icon name="log-out" size={17} />Bỏ thay đổi</button>
      </div>
    </dialog>, document.body,
  );
}
