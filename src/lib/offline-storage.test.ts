import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cloudDataKey, DEMO_DATA_KEY, pendingMutationsKey, type CloudMutation } from "@/lib/cloud-sync";
import {
  persistOfflineData,
  persistOfflineState,
  readOfflineData,
  readOfflineMutations,
} from "@/lib/offline-storage";
import type { SparkData } from "@/lib/data-ids";

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => { values.delete(key); },
    setItem: (key, value) => { values.set(key, value); },
  };
}

const data: SparkData = {
  projects: [{
    id: "00000000-0000-4000-8000-000000000001",
    name: "Spark",
    color: "#44D4CD",
    isStarred: false,
    archivedAt: null,
  }],
  items: [],
};

describe("offline storage fallback and migration", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = memoryStorage();
    vi.stubGlobal("window", { localStorage: storage });
    vi.stubGlobal("indexedDB", undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("keeps snapshots available when IndexedDB is unavailable", async () => {
    await persistOfflineData("user-a", data);
    expect(JSON.parse(storage.getItem(cloudDataKey("user-a")) ?? "null")).toEqual(data);
    await expect(readOfflineData("user-a")).resolves.toEqual(data);
  });

  it("reads the previous demo cache during migration", async () => {
    storage.setItem(DEMO_DATA_KEY, JSON.stringify(data));
    await expect(readOfflineData("demo")).resolves.toEqual(data);
  });

  it("persists the snapshot and queue together before cloud sync", async () => {
    const mutations: CloudMutation[] = [{
      id: "mutation-1",
      kind: "upsert-project",
      project: data.projects[0],
    }];
    await persistOfflineState("user-a", data, mutations);

    expect(JSON.parse(storage.getItem(cloudDataKey("user-a")) ?? "null")).toEqual(data);
    expect(JSON.parse(storage.getItem(pendingMutationsKey("user-a")) ?? "null")).toEqual(mutations);
    await expect(readOfflineMutations("user-a")).resolves.toEqual(mutations);
  });
});
