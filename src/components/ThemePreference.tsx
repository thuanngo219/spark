"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import type { ThemePreference as Preference } from "@/lib/theme";

const options: { value: Preference; label: string }[] = [
  { value: "system", label: "Theo hệ thống" },
  { value: "light", label: "Sáng" },
  { value: "dark", label: "Tối" },
];

function subscribe(callback: () => void) {
  window.addEventListener("spark:theme-change", callback);
  return () => window.removeEventListener("spark:theme-change", callback);
}
function getSnapshot() {
  return document.documentElement.dataset.themePreference ?? "system";
}
function getServerSnapshot() { return "system"; }

export function ThemePreference() {
  const preference = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return (
    <section className="display-preference theme-preference" aria-labelledby="theme-preference-label">
      <span>
        <strong id="theme-preference-label">Giao diện</strong>
        <small>Ghi nhớ trên thiết bị này.</small>
      </span>
      <div className="theme-options" role="radiogroup" aria-labelledby="theme-preference-label">
        {options.map(({ value, label }) => (
          <label key={value}>
            <input
              type="radio"
              name="theme-preference"
              value={value}
              checked={preference === value}
              onChange={() => window.dispatchEvent(new CustomEvent("spark:theme-select", { detail: value }))}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

// React Strict Mode may reset root attributes during its development remount.
export function ThemeSync() {
  useLayoutEffect(() => { window.dispatchEvent(new Event("spark:theme-refresh")); }, []);
  return null;
}
