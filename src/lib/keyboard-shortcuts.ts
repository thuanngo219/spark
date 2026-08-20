export type StandaloneShortcut = "new-task" | "toggle-sidebar" | "help";

export function resolveStandaloneShortcut(key: string): StandaloneShortcut | null {
  if (key.toLowerCase() === "n") return "new-task";
  if (key === "[") return "toggle-sidebar";
  if (key === "?") return "help";
  return null;
}
