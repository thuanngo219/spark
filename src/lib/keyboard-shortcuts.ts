export type StandaloneShortcut =
  | "new-task"
  | "today"
  | "upcoming"
  | "calendar"
  | "all"
  | "important"
  | "urgent"
  | "display-notes"
  | "display-tasks"
  | "display-all"
  | "toggle-sidebar"
  | "help";

type ShortcutModifiers = {
  ctrlKey?: boolean;
  metaKey?: boolean;
};

export function resolveStandaloneShortcut(
  key: string,
  { ctrlKey = false, metaKey = false }: ShortcutModifiers = {},
): StandaloneShortcut | null {
  if (ctrlKey || metaKey) {
    return key === "\\" ? "toggle-sidebar" : null;
  }

  const normalized = key.toLowerCase();
  if (normalized === "n") return "new-task";
  if (normalized === "t") return "today";
  if (normalized === "s") return "upcoming";
  if (normalized === "d") return "calendar";
  if (normalized === "a") return "all";
  if (normalized === "i") return "important";
  if (normalized === "u") return "urgent";
  if (key === "[") return "display-notes";
  if (key === "]") return "display-tasks";
  if (key === "\\") return "display-all";
  if (key === "?") return "help";
  return null;
}

export function resolveProjectShortcut(key: string) {
  return /^[1-9]$/.test(key) ? Number(key) - 1 : null;
}
