import { describe, expect, it } from "vitest";
import {
  appendCloudMutation,
  applyCloudMutations,
  cloudDataKey,
  parseCloudMutations,
  pendingMutationsKey,
  resolveCloudActivationData,
  type CloudMutation,
} from "@/lib/cloud-sync";
import type { Project, SparkItem } from "@/lib/types";

const project: Project = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Spark",
  color: "#44D4CD",
  isStarred: false,
  archivedAt: null,
};

const item: SparkItem = {
  id: "00000000-0000-4000-8000-000000000002",
  type: "task",
  title: "Bản đầu",
  description: null,
  dueDate: null,
  projectId: project.id,
  completedAt: null,
  archivedAt: null,
  isImportant: false,
  isUrgent: false,
  createdAt: "2026-08-20T00:00:00.000Z",
};

describe("cloud mutation queue", () => {
  it("keeps the newest pending change for the same entity", () => {
    const first: CloudMutation = { id: "m1", kind: "upsert-item", item };
    const second: CloudMutation = {
      id: "m2",
      kind: "upsert-item",
      item: { ...item, title: "Bản mới" },
    };

    expect(appendCloudMutation([first], second)).toEqual([second]);
  });

  it("keeps optimistic changes when a stale remote snapshot arrives", () => {
    const pending: CloudMutation[] = [
      {
        id: "m1",
        kind: "upsert-item",
        item: { ...item, title: "Đã sửa khi offline" },
      },
    ];

    const result = applyCloudMutations(
      { projects: [project], items: [item] },
      pending,
    );

    expect(result.items[0].title).toBe("Đã sửa khi offline");
  });

  it("applies a pending delete over remote data", () => {
    const result = applyCloudMutations(
      { projects: [project], items: [item] },
      [{ id: "m1", kind: "delete-item", itemId: item.id }],
    );

    expect(result.items).toEqual([]);
  });

  it("treats an empty remote snapshot as authoritative after a database reset", () => {
    const staleCache = { projects: [project], items: [item] };
    const remote = { projects: [], items: [] };

    expect(staleCache.items).toHaveLength(1);
    expect(resolveCloudActivationData(remote, [])).toEqual(remote);
  });

  it("keeps real pending offline writes over an empty remote snapshot", () => {
    const pending: CloudMutation[] = [
      { id: "m1", kind: "upsert-project", project },
      { id: "m2", kind: "upsert-item", item },
    ];

    expect(resolveCloudActivationData({ projects: [], items: [] }, pending)).toEqual({
      projects: [project],
      items: [item],
    });
  });

  it("ignores malformed persisted queue entries", () => {
    expect(
      parseCloudMutations([
        null,
        { id: "bad", kind: "unknown" },
        { id: "m1", kind: "delete-item", itemId: item.id },
      ]),
    ).toEqual([{ id: "m1", kind: "delete-item", itemId: item.id }]);
  });

  it("separates cloud cache and pending writes by user", () => {
    expect(cloudDataKey("user-a")).not.toBe(cloudDataKey("user-b"));
    expect(pendingMutationsKey("user-a")).not.toBe(pendingMutationsKey("user-b"));
  });
});
