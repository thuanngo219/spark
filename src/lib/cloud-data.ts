import type { SupabaseClient } from "@supabase/supabase-js";
import type { Project, SparkItem } from "@/lib/types";

type ProjectRow = {
  id: string;
  name: string;
  color: string;
  archived_at: string | null;
};

type ItemRow = {
  id: string;
  type: "task" | "note";
  title: string;
  due_date: string | null;
  project_id: string | null;
  completed_at: string | null;
  is_important: boolean;
  is_urgent: boolean;
  created_at: string;
};

function toProject(row: ProjectRow): Project {
  return { id: row.id, name: row.name, color: row.color, archivedAt: row.archived_at };
}

function toItem(row: ItemRow): SparkItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    dueDate: row.due_date,
    projectId: row.project_id,
    completedAt: row.completed_at,
    isImportant: row.is_important,
    isUrgent: row.is_urgent,
    createdAt: row.created_at,
  };
}

export async function fetchCloudData(client: SupabaseClient) {
  const [projectsResult, itemsResult] = await Promise.all([
    client.from("projects").select("id,name,color,archived_at").order("position"),
    client
      .from("items")
      .select("id,type,title,due_date,project_id,completed_at,is_important,is_urgent,created_at")
      .order("position"),
  ]);
  if (projectsResult.error) throw projectsResult.error;
  if (itemsResult.error) throw itemsResult.error;
  return {
    projects: (projectsResult.data as ProjectRow[]).map(toProject),
    items: (itemsResult.data as ItemRow[]).map(toItem),
  };
}

export async function upsertProject(client: SupabaseClient, project: Project, userId: string) {
  const { error } = await client.from("projects").upsert({
    id: project.id,
    user_id: userId,
    name: project.name,
    color: project.color,
    archived_at: project.archivedAt,
  });
  if (error) throw error;
}

export async function upsertItem(client: SupabaseClient, item: SparkItem, userId: string) {
  const { error } = await client.from("items").upsert({
    id: item.id,
    user_id: userId,
    project_id: item.projectId,
    type: item.type,
    title: item.title,
    due_date: item.dueDate,
    completed_at: item.completedAt,
    is_important: item.isImportant,
    is_urgent: item.isUrgent,
    created_at: item.createdAt,
  });
  if (error) throw error;
}

export async function deleteCloudItem(client: SupabaseClient, itemId: string) {
  const { error } = await client.from("items").delete().eq("id", itemId);
  if (error) throw error;
}

export async function seedCloudData(
  client: SupabaseClient,
  data: { projects: Project[]; items: SparkItem[] },
  userId: string,
) {
  await Promise.all(data.projects.map((project) => upsertProject(client, project, userId)));
  await Promise.all(data.items.map((item) => upsertItem(client, item, userId)));
}
