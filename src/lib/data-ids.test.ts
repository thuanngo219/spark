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
    projects: [{ id: "work", name: "Công việc", color: "#32C8C7", isStarred: false, archivedAt: null, position: 0 }],
    items: [
      {
        id: "welcome-1",
        type: "task",
        title: "Việc cũ",
        description: null,
        dueDate: "2026-08-19",
        projectId: "work",
        completedAt: null,
        archivedAt: null,
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
    let index = 0;

    const normalized = normalizeDataIds(data, () => ids[index++]);

    expect(normalized.items[0].projectId).toBeNull();
  });

  it("defaults legacy projects to an unstarred state", () => {
    const data = legacyData();
    delete (data.projects[0] as Partial<(typeof data.projects)[number]>).isStarred;
    let index = 0;

    const normalized = normalizeDataIds(data, () => ids[index++]);

    expect(normalized.projects[0].isStarred).toBe(false);
  });

  it("defaults legacy items to an unarchived state", () => {
    const data = legacyData();
    delete (data.items[0] as Partial<(typeof data.items)[number]>).archivedAt;
    let index = 0;

    const normalized = normalizeDataIds(data, () => ids[index++]);

    expect(normalized.items[0].archivedAt).toBeNull();
  });

  it("defaults missing descriptions and preserves note content", () => {
    const data = legacyData();
    delete (data.items[0] as Partial<(typeof data.items)[number]>).description;
    data.items.push({
      ...data.items[0],
      id: "legacy-note",
      type: "note",
      description: "  Nội dung chi tiết của note  ",
    });
    let index = 0;

    const normalized = normalizeDataIds(data, () => ids[index++]);

    expect(normalized.items[0].description).toBeNull();
    expect(normalized.items[1].description).toBe("Nội dung chi tiết của note");
  });

  it("trims task descriptions without changing existing titles", () => {
    const data = legacyData();
    data.items[0].description = "  Chi tiết cần giữ  ";
    data.items[0].title = "Một title cũ dài vẫn được bảo toàn khi đọc cache";
    let index = 0;

    const normalized = normalizeDataIds(data, () => ids[index++]);

    expect(normalized.items[0].description).toBe("Chi tiết cần giữ");
    expect(normalized.items[0].title).toBe(data.items[0].title);
  });
});
