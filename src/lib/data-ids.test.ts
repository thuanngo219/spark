import { describe, expect, it } from "vitest";
import { isUuid, normalizeDataIds } from "@/lib/data-ids";
import type { SparkData } from "@/lib/data-ids";

const ids = [
  "10000000-0000-4000-8000-000000000001",
  "10000000-0000-4000-8000-000000000002",
  "10000000-0000-4000-8000-000000000003",
];

function legacyData(): SparkData {
  return {
    projects: [{ id: "work", name: "Công việc", color: "#32C8C7", archivedAt: null }],
    items: [
      {
        id: "welcome-1",
        type: "task",
        title: "Việc cũ",
        dueDate: "2026-08-19",
        projectId: "work",
        completedAt: null,
        isImportant: false,
        isUrgent: false,
        createdAt: "2026-08-19T00:00:00.000Z",
      },
    ],
  };
}

describe("normalizeDataIds", () => {
  it("migrates legacy ids to UUIDs and preserves project references", () => {
    let index = 0;
    const normalized = normalizeDataIds(legacyData(), () => ids[index++]);

    expect(normalized.projects[0].id).toBe(ids[0]);
    expect(normalized.items[0].id).toBe(ids[1]);
    expect(normalized.items[0].projectId).toBe(ids[0]);
    expect(normalized.items[0].title).toBe("Việc cũ");
  });

  it("keeps valid UUIDs stable", () => {
    const data = legacyData();
    data.projects[0].id = ids[0];
    data.items[0].id = ids[1];
    data.items[0].projectId = ids[0];

    const normalized = normalizeDataIds(data, () => ids[2]);

    expect(normalized).toEqual(data);
    expect(isUuid(normalized.items[0].id)).toBe(true);
  });

  it("removes references to missing projects before upload", () => {
    const data = legacyData();
    data.items[0].projectId = "missing";

    const normalized = normalizeDataIds(data, () => ids.shift()!);

    expect(normalized.items[0].projectId).toBeNull();
  });
});
