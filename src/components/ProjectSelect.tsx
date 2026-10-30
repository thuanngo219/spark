"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/types";

export function ProjectSelect({ value, projects, onChange }: { value: string; projects: Project[]; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const options = [{ id: "", name: "Không có dự án", archivedAt: null }, ...projects];
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    root.current?.querySelector<HTMLElement>('[role="option"][aria-selected="true"]')?.focus();
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  const choose = (id: string) => { onChange(id); setOpen(false); trigger.current?.focus(); };
  return <div className="project-select" ref={root}>
    <select className="project-select-native" aria-label="Dự án" value={value} onChange={event => onChange(event.target.value)}>{options.map(option => <option key={option.id} value={option.id} disabled={Boolean(option.archivedAt)}>{option.name}{option.archivedAt ? " (đã lưu trữ)" : ""}</option>)}</select>
    <button ref={trigger} type="button" className="project-select-trigger" aria-label="Dự án" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)} onKeyDown={event => { if (["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); setOpen(true); } }}>{options.find(option => option.id === value)?.name ?? "Không có dự án"}<span aria-hidden="true">⌄</span></button>
    {open && <div className="project-select-menu" role="listbox" aria-label="Dự án" onKeyDown={event => {
      if (event.key === "Escape" || event.key === "Tab") { setOpen(false); if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); trigger.current?.focus(); } return; }
      const entries = Array.from(root.current!.querySelectorAll<HTMLButtonElement>('[role="option"]:not(:disabled)'));
      const index = entries.indexOf(document.activeElement as HTMLButtonElement);
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? entries.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + entries.length) % entries.length;
        entries[next]?.focus();
      }
    }}>{options.map(option => <button type="button" role="option" aria-selected={option.id === value} disabled={Boolean(option.archivedAt)} key={option.id} onClick={() => choose(option.id)}><span aria-hidden="true">{option.id === value ? "✓" : ""}</span>{option.name}{option.archivedAt ? " (đã lưu trữ)" : ""}</button>)}</div>}
  </div>;
}
