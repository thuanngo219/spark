"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/Icon";
import type { ThemePreference as Preference } from "@/lib/theme";

const options: { value: Preference; label: string; icon: "monitor" | "sun" | "moon" }[] = [
  { value: "system", label: "Theo hệ thống", icon: "monitor" },
  { value: "light", label: "Sáng", icon: "sun" },
  { value: "dark", label: "Tối", icon: "moon" },
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
      </span>
      <div className="theme-options" role="radiogroup" aria-labelledby="theme-preference-label">
        {options.map(({ value, label, icon }) => (
          <label key={value} title={label}>
            <input
              type="radio"
              aria-label={label}
              name="theme-preference"
              value={value}
              checked={preference === value}
              onChange={() => window.dispatchEvent(new CustomEvent("spark:theme-select", { detail: value }))}
            />
            <span><Icon name={icon} size={18} /></span>
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

export function useSidebarChrome(open: boolean) {
  useLayoutEffect(() => {
    window.dispatchEvent(new CustomEvent("spark:sidebar-chrome", { detail: open }));
    return () => { window.dispatchEvent(new CustomEvent("spark:sidebar-chrome", { detail: false })); };
  }, [open]);
}
