import type { Project } from "@/lib/types";

export type ProjectDropPlacement = "before" | "after";

export function reorderProjectsForDrop(
  projects: Project[],
  sourceId: string,
  targetId: string,
  placement: ProjectDropPlacement,
) {
  if (sourceId === targetId) return null;
  const sourceProject = projects.find((project) => project.id === sourceId);
  const targetProject = projects.find((project) => project.id === targetId);
  if (!sourceProject || !targetProject || sourceProject.isStarred !== targetProject.isStarred) return null;

  const ordered = [...projects].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const sourceIndex = ordered.findIndex((project) => project.id === sourceId);
  if (sourceIndex < 0) return null;
  const [moved] = ordered.splice(sourceIndex, 1);
  const targetIndex = ordered.findIndex((project) => project.id === targetId);
  if (targetIndex < 0) return null;
  ordered.splice(targetIndex + (placement === "after" ? 1 : 0), 0, moved);
  return ordered.map((project, position) => ({ ...project, position }));
}
