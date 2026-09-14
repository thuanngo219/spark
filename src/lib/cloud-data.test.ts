import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchCloudData, runCloudMutation, upsertItem, upsertProject } from "@/lib/cloud-data";
import type { Project, SparkItem } from "@/lib/types";

function mockUpsertClient() {
  const upsert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn().mockReturnValue({ upsert });
  return { client: { from } as unknown as SupabaseClient, from, upsert };
}

const baseNote: SparkItem = {
  id: "note-1",
  type: "note",
  title: "Tên ghi chú",
  description: "  Nội dung chi tiết của ghi chú  ",
  startDate: "2026-08-27",
  dueDate: null,
  projectId: null,
  completedAt: null,
  archivedAt: null,
  isImportant: false,
  isUrgent: false,
  createdAt: "2026-08-27T08:00:00.000Z",
};

describe("shared task and note content", () => {
  it("writes all 4000 characters and formatting, but refuses 4001", async () => {
    const { client, upsert } = mockUpsertClient();
    const description = "🙂".repeat(4000);
    const descriptionFormat = [{ text: description, bold: true as const, italic: true as const, underline: true as const }];
    await upsertItem(client, { ...baseNote, description, descriptionFormat, startDate: null }, "user-1");
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ description, description_format: descriptionFormat, start_date: null }));
    await expect(upsertItem(client, { ...baseNote, description: description + "x" }, "user-1")).rejects.toThrow("4.000");
    expect(upsert).toHaveBeenCalledTimes(1);
  });
  it("reads formatting with the same content from cloud", async () => {
    const descriptionFormat = [{ text: "Nội dung", underline: true }];
    const select = vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [{ id: "note-1", description: "Nội dung", description_format: descriptionFormat, start_date: null }], error: null }) });
    const client = { from: vi.fn().mockReturnValue({ select }) } as unknown as SupabaseClient;
    const result = await fetchCloudData(client);
    expect(result.items[0]).toMatchObject({ description: "Nội dung", descriptionFormat, startDate: null });
    expect(select).toHaveBeenCalledWith(expect.stringContaining("description_format"));
  });
  it("persists trimmed detailed content for notes", async () => {
    const { client, from, upsert } = mockUpsertClient();
    await upsertItem(client, baseNote, "user-1");
    expect(from).toHaveBeenCalledExactlyOnceWith("items");
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      type: "note",
      title: "Tên ghi chú",
      description: "Nội dung chi tiết của ghi chú",
      start_date: "2026-08-27",
    }));
  });
});

describe("project display order", () => {
  it("persists the normalized sidebar position", async () => {
    const project: Project = {
      id: "project-1",
      name: "Spark",
      color: "#44d4cd",
      isStarred: false,
      archivedAt: null,
      position: 3,
    };
    const { client, from, upsert } = mockUpsertClient();
    await upsertProject(client, project, "user-1");
    expect(from).toHaveBeenCalledExactlyOnceWith("projects");
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ position: 3 }));
  });
});

describe("project deletion request", () => {
  function mockClient(error: unknown = null) {
    const eqUser = vi.fn().mockResolvedValue({ error });
    const eqId = vi.fn().mockReturnValue({ eq: eqUser });
    const remove = vi.fn().mockReturnValue({ eq: eqId });
    const from = vi.fn().mockReturnValue({ delete: remove });
    return { client: { from } as unknown as SupabaseClient, from, eqId, eqUser };
  }

  it("deletes exactly one owned project, never the items table", async () => {
    const { client, from, eqId, eqUser } = mockClient();
    await runCloudMutation(client, { id: "m1", kind: "delete-project", projectId: "project-1" }, "user-1");
    expect(from).toHaveBeenCalledExactlyOnceWith("projects");
    expect(eqId).toHaveBeenCalledExactlyOnceWith("id", "project-1");
    expect(eqUser).toHaveBeenCalledExactlyOnceWith("user_id", "user-1");
  });

  it("propagates server errors so the durable queue can retry", async () => {
    const error = { message: "Network unavailable" };
    const { client } = mockClient(error);
    await expect(runCloudMutation(client, { id: "m1", kind: "delete-project", projectId: "project-1" }, "user-1")).rejects.toEqual(error);
  });
});
