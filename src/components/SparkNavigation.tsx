"use client";

import { Icon } from "@/components/ui/Icon";
import type { ItemDisplayMode } from "@/lib/task-filters";
import type { View } from "@/lib/types";

export function ItemDisplaySwitcher({
  mode,
  mobile = false,
  onChange,
}: {
  mode: ItemDisplayMode;
  mobile?: boolean;
  onChange: (mode: ItemDisplayMode) => void;
}) {
  const entries = [
    { mode: "all" as const, label: "Hiển thị tất cả", shortcut: "\\", icon: "layers" as const },
    { mode: "note" as const, label: "Chỉ hiển thị note", shortcut: "[", icon: "note" as const },
    { mode: "task" as const, label: "Chỉ hiển thị task", shortcut: "]", icon: "task" as const },
  ];

  return (
    <div
      className={`item-display-switcher ${mobile ? "mobile" : ""}`}
      role="group"
      aria-label="Lọc loại nội dung"
    >
      {entries.map((entry) => (
        <button
          type="button"
          className={mode === entry.mode ? "selected" : ""}
          onClick={() => onChange(entry.mode)}
          aria-label={entry.label}
          aria-pressed={mode === entry.mode}
          title={`${entry.label} (${entry.shortcut})`}
          key={entry.mode}
        >
          <Icon name={entry.icon} size={18} />
        </button>
      ))}
    </div>
  );
}

export function MobileDock({
  currentView,
  onAdd,
  onNavigate,
  today,
}: {
  currentView: View;
  onAdd: () => void;
  onNavigate: (view: View) => void;
  today: string;
}) {
  const entries = [
    { label: "Hôm nay", icon: "sun" as const, view: { type: "today" } as View },
    { label: "Sắp tới", icon: "clock" as const, view: { type: "upcoming" } as View },
    { label: "Theo ngày", icon: "calendar" as const, view: { type: "calendar", date: today } as View },
    { label: "Tất cả", icon: "list" as const, view: { type: "all" } as View },
  ];
  const isActive = (candidate: View) => candidate.type === currentView.type;

  return (
    <nav className="mobile-dock" aria-label="Điều hướng mobile">
      {entries.slice(0, 2).map((entry) => (
        <button
          type="button"
          className={isActive(entry.view) ? "active" : ""}
          onClick={() => onNavigate(entry.view)}
          aria-label={entry.label}
          aria-current={isActive(entry.view) ? "page" : undefined}
          key={entry.label}
        >
          <Icon name={entry.icon} size={27} />
        </button>
      ))}
      <button className="mobile-dock-add" type="button" onClick={onAdd} aria-label="Thêm công việc">
        <span><Icon name="plus" size={31} /></span>
      </button>
      {entries.slice(2).map((entry) => (
        <button
          type="button"
          className={isActive(entry.view) ? "active" : ""}
          onClick={() => onNavigate(entry.view)}
          aria-label={entry.label}
          aria-current={isActive(entry.view) ? "page" : undefined}
          key={entry.label}
        >
          <Icon name={entry.icon} size={27} />
        </button>
      ))}
    </nav>
  );
}
