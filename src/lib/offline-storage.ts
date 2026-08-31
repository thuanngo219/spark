import {
  cloudDataKey,
  DEMO_DATA_KEY,
  parseCloudMutations,
  pendingMutationsKey,
  type CloudMutation,
} from "@/lib/cloud-sync";
import type { SparkData } from "@/lib/data-ids";

const DATABASE_NAME = "spark-offline";
const DATABASE_VERSION = 1;
const SNAPSHOT_STORE = "snapshots";
const MUTATION_STORE = "mutation-queues";
const LEGACY_DEMO_DATA_KEY = "spark:data:v1";

export type OfflineScope = "demo" | string;

type SnapshotRecord = {
  scope: OfflineScope;
  data: SparkData;
  updatedAt: string;
};

type MutationQueueRecord = {
  userId: string;
  mutations: CloudMutation[];
  updatedAt: string;
};

let databasePromise: Promise<IDBDatabase> | null = null;
let writeChain: Promise<void> = Promise.resolve();

function localStorageOrNull() {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function snapshotLegacyKeys(scope: OfflineScope) {
  return scope === "demo"
    ? [DEMO_DATA_KEY, LEGACY_DEMO_DATA_KEY]
    : [cloudDataKey(scope)];
}

function openDatabase() {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is unavailable"));
  }
  if (databasePromise) return databasePromise;

  databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(SNAPSHOT_STORE)) {
        database.createObjectStore(SNAPSHOT_STORE, { keyPath: "scope" });
      }
      if (!database.objectStoreNames.contains(MUTATION_STORE)) {
        database.createObjectStore(MUTATION_STORE, { keyPath: "userId" });
      }
    };
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => {
        database.close();
        databasePromise = null;
      };
      resolve(database);
    };
    request.onerror = () => {
      databasePromise = null;
      reject(request.error ?? new Error("Could not open Spark offline storage"));
    };
    request.onblocked = () => {
      databasePromise = null;
      reject(new Error("Spark offline storage upgrade is blocked"));
    };
  });

  return databasePromise;
}

function requestResult<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function transactionComplete(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed"));
  });
}

async function waitForWrites() {
  await writeChain.catch(() => undefined);
}

function queueWrite(operation: () => Promise<void>) {
  const queued = writeChain.catch(() => undefined).then(operation);
  writeChain = queued.catch(() => undefined);
  return queued;
}

function readLegacySnapshot(scope: OfflineScope) {
  const storage = localStorageOrNull();
  if (!storage) return null;
  for (const key of snapshotLegacyKeys(scope)) {
    try {
      const value = storage.getItem(key);
      if (!value) continue;
      const parsed = JSON.parse(value) as Partial<SparkData>;
      if (Array.isArray(parsed.items) && Array.isArray(parsed.projects)) {
        return parsed as SparkData;
      }
    } catch {
      // Ignore malformed legacy data and try the next compatible key.
    }
  }
  return null;
}

function readLegacyMutations(userId: string) {
  const storage = localStorageOrNull();
  if (!storage) return [];
  try {
    return parseCloudMutations(JSON.parse(storage.getItem(pendingMutationsKey(userId)) ?? "[]"));
  } catch {
    return [];
  }
}

function removeLegacySnapshot(scope: OfflineScope) {
  const storage = localStorageOrNull();
  if (!storage) return;
  try {
    for (const key of snapshotLegacyKeys(scope)) storage.removeItem(key);
  } catch {
    // A successful IndexedDB write is sufficient even if legacy cleanup is blocked.
  }
}

function writeLegacySnapshot(scope: OfflineScope, data: SparkData) {
  const storage = localStorageOrNull();
  if (!storage) return;
  try {
    storage.setItem(scope === "demo" ? DEMO_DATA_KEY : cloudDataKey(scope), JSON.stringify(data));
  } catch {
    // The caller already reports the IndexedDB failure; avoid an unhandled fallback error.
  }
}

function writeLegacyMutations(userId: string, mutations: CloudMutation[]) {
  try {
    localStorageOrNull()?.setItem(pendingMutationsKey(userId), JSON.stringify(mutations));
  } catch {
    // The caller already reports the IndexedDB failure; avoid an unhandled fallback error.
  }
}

async function writeIndexedDbState(
  scope: OfflineScope,
  data: SparkData,
  mutations?: CloudMutation[],
) {
  const database = await openDatabase();
  const stores = mutations ? [SNAPSHOT_STORE, MUTATION_STORE] : [SNAPSHOT_STORE];
  const transaction = database.transaction(stores, "readwrite");
  const updatedAt = new Date().toISOString();
  transaction.objectStore(SNAPSHOT_STORE).put({ scope, data, updatedAt } satisfies SnapshotRecord);
  if (mutations && scope !== "demo") {
    transaction.objectStore(MUTATION_STORE).put({
      userId: scope,
      mutations,
      updatedAt,
    } satisfies MutationQueueRecord);
  }
  await transactionComplete(transaction);
}

export async function readOfflineData(scope: OfflineScope) {
  await waitForWrites();
  try {
    const database = await openDatabase();
    const transaction = database.transaction(SNAPSHOT_STORE, "readonly");
    const record = await requestResult(
      transaction.objectStore(SNAPSHOT_STORE).get(scope) as IDBRequest<SnapshotRecord | undefined>,
    );
    if (record?.data) return record.data;
  } catch {
    // Fall through to the legacy store when IndexedDB is unavailable or blocked.
  }

  const legacy = readLegacySnapshot(scope);
  if (legacy) await persistOfflineData(scope, legacy);
  return legacy;
}

export async function readOfflineMutations(userId: string) {
  await waitForWrites();
  try {
    const database = await openDatabase();
    const transaction = database.transaction(MUTATION_STORE, "readonly");
    const record = await requestResult(
      transaction.objectStore(MUTATION_STORE).get(userId) as IDBRequest<MutationQueueRecord | undefined>,
    );
    if (record) return parseCloudMutations(record.mutations);
  } catch {
    // Fall through to the legacy store when IndexedDB is unavailable or blocked.
  }

  const legacy = readLegacyMutations(userId);
  if (legacy.length > 0) await persistOfflineMutations(userId, legacy);
  return legacy;
}

export function persistOfflineData(scope: OfflineScope, data: SparkData) {
  return queueWrite(async () => {
    try {
      await writeIndexedDbState(scope, data);
      removeLegacySnapshot(scope);
    } catch (error) {
      writeLegacySnapshot(scope, data);
      console.error("Spark IndexedDB snapshot write failed; using localStorage fallback", error);
    }
  });
}

export function persistOfflineMutations(userId: string, mutations: CloudMutation[]) {
  return queueWrite(async () => {
    try {
      const database = await openDatabase();
      const transaction = database.transaction(MUTATION_STORE, "readwrite");
      transaction.objectStore(MUTATION_STORE).put({
        userId,
        mutations,
        updatedAt: new Date().toISOString(),
      } satisfies MutationQueueRecord);
      await transactionComplete(transaction);
      try {
        localStorageOrNull()?.removeItem(pendingMutationsKey(userId));
      } catch {
        // The IndexedDB queue is authoritative after a successful transaction.
      }
    } catch (error) {
      writeLegacyMutations(userId, mutations);
      console.error("Spark IndexedDB mutation write failed; using localStorage fallback", error);
    }
  });
}

export function persistOfflineState(
  scope: OfflineScope,
  data: SparkData,
  mutations: CloudMutation[],
) {
  return queueWrite(async () => {
    try {
      await writeIndexedDbState(scope, data, mutations);
      removeLegacySnapshot(scope);
      if (scope !== "demo") {
        try {
          localStorageOrNull()?.removeItem(pendingMutationsKey(scope));
        } catch {
          // The atomic IndexedDB transaction is authoritative.
        }
      }
    } catch (error) {
      writeLegacySnapshot(scope, data);
      if (scope !== "demo") writeLegacyMutations(scope, mutations);
      console.error("Spark IndexedDB atomic write failed; using localStorage fallback", error);
    }
  });
}
