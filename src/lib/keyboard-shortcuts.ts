export type StandaloneShortcut =
  | "new-task"
  | "today"
  | "upcoming"
  | "calendar"
  | "all"
  | "important"
  | "urgent"
  | "toggle-sidebar"
  | "help";

export function resolveStandaloneShortcut(key: string): StandaloneShortcut | null {
  const normalized = key.toLowerCase();
  if (normalized === "n") return "new-task";
  if (normalized === "t") return "today";
  if (normalized === "s") return "upcoming";
  if (normalized === "d") return "calendar";
  if (normalized === "a") return "all";
  if (normalized === "i") return "important";
  if (normalized === "u") return "urgent";
  if (key === "[") return "toggle-sidebar";
  if (key === "?") return "help";
  return null;
}

export function resolveProjectShortcut(key: string) {
  return /^[1-9]$/.test(key) ? Number(key) - 1 : null;
}
