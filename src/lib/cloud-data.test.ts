import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { runCloudMutation, upsertItem, upsertProject } from "@/lib/cloud-data";
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
  dueDate: null,
  projectId: null,
  completedAt: null,
  archivedAt: null,
  isImportant: false,
  isUrgent: false,
  createdAt: "2026-08-27T08:00:00.000Z",
};

describe("shared task and note content", () => {
  it("persists trimmed detailed content for notes", async () => {
    const { client, from, upsert } = mockUpsertClient();
    await upsertItem(client, baseNote, "user-1");
    expect(from).toHaveBeenCalledExactlyOnceWith("items");
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      type: "note",
      title: "Tên ghi chú",
      description: "Nội dung chi tiết của ghi chú",
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
