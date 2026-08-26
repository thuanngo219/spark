import type { Project, SparkItem } from "@/lib/types";
import type { SparkData } from "@/lib/data-ids";

export type CloudMutation =
  | { id: string; kind: "upsert-project"; project: Project }
  | { id: string; kind: "delete-project"; projectId: string }
  | { id: string; kind: "upsert-item"; item: SparkItem }
  | { id: string; kind: "delete-item"; itemId: string };

export const DEMO_DATA_KEY = "spark:data:v2:demo";

export function cloudDataKey(userId: string) {
  return `spark:data:v2:user:${userId}`;
}

export function pendingMutationsKey(userId: string) {
  return `spark:sync-pending:v1:${userId}`;
}

function mutationEntityKey(mutation: CloudMutation) {
  if (mutation.kind === "upsert-project") return `project:${mutation.project.id}`;
  if (mutation.kind === "delete-project") return `delete-project:${mutation.projectId}`;
  if (mutation.kind === "upsert-item") return `item:${mutation.item.id}`;
  return `item:${mutation.itemId}`;
}

export function appendCloudMutation(
  mutations: CloudMutation[],
  mutation: CloudMutation,
) {
  // Keep project creation before queued item writes; deletion must run last.
  if (mutation.kind === "delete-project") {
    const projectId = mutation.projectId;
    return [...mutations.filter((entry) => entry.kind !== "delete-project" || entry.projectId !== projectId), mutation];
  }
  if (mutation.kind === "upsert-item") {
    const projectId = mutation.item.projectId;
    if (mutations.some((entry) => entry.kind === "delete-project" && entry.projectId === projectId)) {
      mutation = { ...mutation, item: { ...mutation.item, projectId: null } };
    }
  }
  const entityKey = mutationEntityKey(mutation);
  const previousIndex = mutations.findIndex(
    (entry) => mutationEntityKey(entry) === entityKey,
  );
  if (previousIndex === -1) return [...mutations, mutation];

  const next = [...mutations];
  next[previousIndex] = mutation;
  return next;
}

export function applyCloudMutations(
  base: SparkData,
  mutations: CloudMutation[],
): SparkData {
  return mutations.reduce<SparkData>((current, mutation) => {
    if (mutation.kind === "delete-project") {
      return removeProjectFromData(current, mutation.projectId);
    }
    if (mutation.kind === "upsert-project") {
      const exists = current.projects.some(
        (project) => project.id === mutation.project.id,
      );
      return {
        ...current,
        projects: exists
          ? current.projects.map((project) =>
              project.id === mutation.project.id ? mutation.project : project,
            )
          : [...current.projects, mutation.project],
      };
    }

    if (mutation.kind === "delete-item") {
      return {
        ...current,
        items: current.items.filter((item) => item.id !== mutation.itemId),
      };
    }

    const exists = current.items.some((item) => item.id === mutation.item.id);
    return {
      ...current,
      items: exists
        ? current.items.map((item) =>
            item.id === mutation.item.id ? mutation.item : item,
          )
        : [...current.items, mutation.item],
    };
  }, base);
}

export function removeProjectFromData(data: SparkData, projectId: string): SparkData {
  return {
    projects: data.projects.filter((project) => project.id !== projectId),
    items: data.items.map((item) => item.projectId === projectId ? { ...item, projectId: null } : item),
  };
}

export function resolveCloudActivationData(
  remote: SparkData,
  pendingMutations: CloudMutation[],
) {
  return applyCloudMutations(remote, pendingMutations);
}

export function parseCloudMutations(value: unknown): CloudMutation[] {
  if (!Array.isArray(value)) return [];

  return value.filter((entry): entry is CloudMutation => {
    if (!entry || typeof entry !== "object") return false;
    const mutation = entry as Partial<CloudMutation> & Record<string, unknown>;
    if (typeof mutation.id !== "string") return false;
    if (mutation.kind === "delete-item") return typeof mutation.itemId === "string";
    if (mutation.kind === "delete-project") return typeof mutation.projectId === "string";
    if (mutation.kind === "upsert-item") {
      return Boolean(
        mutation.item &&
          typeof mutation.item === "object" &&
          typeof (mutation.item as SparkItem).id === "string",
      );
    }
    if (mutation.kind === "upsert-project") {
      return Boolean(
        mutation.project &&
          typeof mutation.project === "object" &&
          typeof (mutation.project as Project).id === "string",
      );
    }
    return false;
  });
}
