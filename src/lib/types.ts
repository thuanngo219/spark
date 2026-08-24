export type ItemType = "task" | "note";

export type Project = {
  id: string;
  name: string;
  color: string;
  isStarred: boolean;
  archivedAt: string | null;
};

export type SparkItem = {
  id: string;
  type: ItemType;
  title: string;
  description: string | null;
  dueDate: string | null;
  projectId: string | null;
  completedAt: string | null;
  archivedAt: string | null;
  isImportant: boolean;
  isUrgent: boolean;
  createdAt: string;
};

export type View =
  | { type: "today" }
  | { type: "upcoming" }
  | { type: "calendar"; date: string }
  | { type: "all" }
  | { type: "important" }
  | { type: "urgent" }
  | { type: "project"; projectId: string };
