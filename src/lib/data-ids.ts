import type { Project, SparkItem } from "@/lib/types";

export type SparkData = { items: SparkItem[]; projects: Project[] };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

export function normalizeDataIds(
  data: SparkData,
  createId: () => string = () => crypto.randomUUID(),
): SparkData {
  const usedProjectIds = new Set<string>();
  const projectIdMap = new Map<string, string>();

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

  const projects = data.projects.map((project) => {
    const id = nextUniqueId(project.id, usedProjectIds);
    projectIdMap.set(project.id, id);
    return { ...project, id };
  });

  const usedItemIds = new Set<string>();
  const items = data.items.map((item) => ({
    ...item,
    id: nextUniqueId(item.id, usedItemIds),
    projectId: item.projectId ? projectIdMap.get(item.projectId) ?? null : null,
  }));

  return { items, projects };
}
