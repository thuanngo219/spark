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
  | "help"
  | "theme-light"
  | "theme-dark"
  | "theme-system";

type ShortcutModifiers = {
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
};

export function resolveStandaloneShortcut(
  key: string,
  { ctrlKey = false, metaKey = false, altKey = false }: ShortcutModifiers = {},
): StandaloneShortcut | null {
  if (altKey) return null;
  if (ctrlKey || metaKey) {
    return key === "\\" ? "toggle-sidebar" : null;
  }

  const normalized = key.toLowerCase();
  if (key === "<") return "theme-light";
  if (key === ">") return "theme-dark";
  if (normalized === "m") return "theme-system";
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
