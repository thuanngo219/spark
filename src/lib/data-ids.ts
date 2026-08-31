import type { Project, SparkItem } from "@/lib/types";
import { createUuid } from "@/lib/ids";

export type SparkData = { items: SparkItem[]; projects: Project[] };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

export function normalizeDataIds(
  data: SparkData,
  createId: () => string = createUuid,
): SparkData {
  const usedProjectIds = new Set<string>();
  const projectIdMap = new Map<string, string>();
  let projectsChanged = false;

  const nextUniqueId = (candidate: string, used: Set<string>) => {
    if (isUuid(candidate) && !used.has(candidate)) {
      used.add(candidate);
      return candidate;
    }

    let next = createId();
    while (!isUuid(next) || used.has(next)) next = createId();
    used.add(next);
    return next;
  };

  const projects = data.projects.map((project, index) => {
    const id = nextUniqueId(project.id, usedProjectIds);
    projectIdMap.set(project.id, id);
    const isStarred = Boolean(project.isStarred);
    const archivedAt = project.archivedAt ?? null;
    const position = Number.isFinite(project.position) ? project.position : index;
    if (
      id === project.id &&
      isStarred === project.isStarred &&
      archivedAt === project.archivedAt &&
      position === project.position
    ) {
      return project;
    }
    projectsChanged = true;
    return { ...project, id, isStarred, archivedAt, position };
  });

  const usedItemIds = new Set<string>();
  let itemsChanged = false;
  const items = data.items.map((item) => {
    const id = nextUniqueId(item.id, usedItemIds);
    const projectId = item.projectId ? projectIdMap.get(item.projectId) ?? null : null;
    const description = item.description?.trim() || null;
    const archivedAt = item.type === "note" ? item.archivedAt ?? null : null;
    if (
      id === item.id &&
      projectId === item.projectId &&
      description === item.description &&
      archivedAt === item.archivedAt
    ) {
      return item;
    }
    itemsChanged = true;
    return { ...item, id, projectId, description, archivedAt };
  });

  return projectsChanged || itemsChanged ? { items, projects } : data;
}

function projectsEqual(left: Project, right: Project) {
  return left.id === right.id &&
    left.name === right.name &&
    left.color === right.color &&
    left.isStarred === right.isStarred &&
    left.archivedAt === right.archivedAt &&
    left.position === right.position;
}

function itemsEqual(left: SparkItem, right: SparkItem) {
  return left.id === right.id &&
    left.type === right.type &&
    left.title === right.title &&
    left.description === right.description &&
    left.dueDate === right.dueDate &&
    left.projectId === right.projectId &&
    left.completedAt === right.completedAt &&
    left.archivedAt === right.archivedAt &&
    left.isImportant === right.isImportant &&
    left.isUrgent === right.isUrgent &&
    left.createdAt === right.createdAt;
}

export function areSparkDataEqual(left: SparkData | null, right: SparkData) {
  if (!left || left.projects.length !== right.projects.length || left.items.length !== right.items.length) {
    return false;
  }
  return left.projects.every((project, index) => projectsEqual(project, right.projects[index])) &&
    left.items.every((item, index) => itemsEqual(item, right.items[index]));
}
