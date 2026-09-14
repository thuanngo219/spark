import { CONTENT_LIMIT, contentLength, normalizeContent } from "@/lib/content-format";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CloudMutation } from "@/lib/cloud-sync";
import type { Project, SparkItem } from "@/lib/types";
import { getLegacyStartDate, isValidDateRange } from "@/lib/dates";

type ProjectRow = {
  id: string;
  name: string;
  color: string;
  is_starred: boolean;
  archived_at: string | null;
  position: number;
};

type ItemRow = {
  id: string;
  type: "task" | "note";
  title: string;
  description: string | null;
  description_format?: unknown;
  start_date: string | null;
  due_date: string | null;
  project_id: string | null;
  completed_at: string | null;
  archived_at: string | null;
  is_important: boolean;
  is_urgent: boolean;
  created_at: string;
};

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    isStarred: row.is_starred,
    archivedAt: row.archived_at,
    position: row.position,
  };
}

function toItem(row: ItemRow): SparkItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    ...normalizeContent(row.description, row.description_format),
    startDate: row.start_date,
    dueDate: row.due_date,
    projectId: row.project_id,
    completedAt: row.completed_at,
    archivedAt: row.archived_at,
    isImportant: row.is_important,
    isUrgent: row.is_urgent,
    createdAt: row.created_at,
  };
}

export async function fetchCloudData(client: SupabaseClient) {
  const [projectsResult, itemsResult] = await Promise.all([
    client.from("projects").select("id,name,color,is_starred,archived_at,position").order("position"),
    client
      .from("items")
      .select("id,type,title,description,description_format,start_date,due_date,project_id,completed_at,archived_at,is_important,is_urgent,created_at")
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
    is_starred: project.isStarred,
    archived_at: project.archivedAt,
    position: project.position ?? 0,
  });
  if (error) throw error;
}

export async function upsertItem(client: SupabaseClient, item: SparkItem, userId: string) {
  const startDate = item.startDate === undefined ? getLegacyStartDate(item.createdAt) : item.startDate;
  if (!isValidDateRange(startDate, item.dueDate)) throw new Error("Ngày đến hạn không thể trước ngày bắt đầu.");
  const content = normalizeContent(item.description, item.descriptionFormat);
  if (contentLength(content.description ?? "") > CONTENT_LIMIT) throw new Error("Nội dung tối đa 4.000 ký tự.");
  const { error } = await client.from("items").upsert({
    id: item.id,
    user_id: userId,
    project_id: item.projectId,
    type: item.type,
    title: item.title,
    description: content.description,
    description_format: content.descriptionFormat,
    start_date: startDate,
    due_date: item.dueDate,
    completed_at: item.completedAt,
    archived_at: item.archivedAt,
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

export async function runCloudMutation(
  client: SupabaseClient,
  mutation: CloudMutation,
  userId: string,
) {
  if (mutation.kind === "delete-project") {
    // The existing FK uses ON DELETE SET NULL: no task/note is deleted.
    const { error } = await client.from("projects").delete().eq("id", mutation.projectId).eq("user_id", userId);
    if (error) throw error;
    return;
  }
  if (mutation.kind === "upsert-project") {
    return upsertProject(client, mutation.project, userId);
  }
  if (mutation.kind === "upsert-item") {
    return upsertItem(client, mutation.item, userId);
  }
  return deleteCloudItem(client, mutation.itemId);
}
