"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

export function confirmDiscardChanges() {
  return window.confirm("Bạn có thay đổi chưa lưu. Thoát và bỏ các thay đổi này?");
}

export function useUnsavedChanges(dirty: boolean) {
  const dirtyRef = useRef(dirty);
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
  return useCallback(() => !dirtyRef.current || confirmDiscardChanges(), []);
}
