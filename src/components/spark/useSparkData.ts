"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type StartupState } from "@/components/StartupScreen";
import { EMPTY_SPARK_DATA, removePristineDemoSeed, withStartupTimeout } from "@/lib/startup";
import { fetchCloudData, runCloudMutation } from "@/lib/cloud-data";
import { appendCloudMutation, applyCloudMutations, resolveCloudActivationData, type CloudMutation } from "@/lib/cloud-sync";
import { areSparkDataEqual, normalizeDataIds, type SparkData } from "@/lib/data-ids";
import { persistOfflineData, persistOfflineMutations, persistOfflineState, readOfflineData, readOfflineMutations } from "@/lib/offline-storage";
import { SingleFlight } from "@/lib/single-flight";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import type { CloudUser, SyncStatus } from "./shared";

async function readLocalData() {
  const cached = await readOfflineData("demo");
  const normalized = normalizeDataIds(removePristineDemoSeed(cached ?? EMPTY_SPARK_DATA));
  if (normalized !== cached) await persistOfflineData("demo", normalized);
  return normalized;
}

export function useSparkData(onResetTransient: () => void) {
  const [data, setData] = useState<SparkData | null>(null);
  const [startupActive, setStartupActive] = useState(true);
  const [startupCanContinue, setStartupCanContinue] = useState(false);
  const [startup, setStartup] = useState<StartupState>({ progress: 0, label: "Đang mở Spark…", status: "loading" });
  const retryStartupRef = useRef<() => void>(() => window.location.reload());
  const [cloudUser, setCloudUser] = useState<CloudUser | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(isSupabaseConfigured() ? "loading" : "not-configured");
  const dataRef = useRef(data);
  const dataScopeRef = useRef<"demo" | string>("demo");
  const cloudUserRef = useRef<CloudUser | null>(null);
  const pendingMutationsRef = useRef<CloudMutation[]>([]);
  const syncRevisionRef = useRef(0);
  const pullRequestRef = useRef(0);
  const pullSingleFlightRef = useRef(new SingleFlight());
  const activationRef = useRef(0);
  const realtimeConnectedRef = useRef(false);
  const flushSingleFlightRef = useRef(new SingleFlight());
  const flushPendingRef = useRef<() => Promise<void>>(async () => undefined);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryDelayRef = useRef(1_000);
  const mutationPersistenceRef = useRef<Promise<void> | null>(null);
  const setHydratedData = useCallback((next: SparkData, scope: "demo" | string) => {
    dataScopeRef.current = scope;
    const normalized = normalizeDataIds(next);
    if (areSparkDataEqual(dataRef.current, normalized)) return false;
    dataRef.current = normalized;
    setData(normalized);
    return true;
  }, []);

  const replaceData = useCallback((next: SparkData, scope: "demo" | string) => {
    const scopeChanged = dataScopeRef.current !== scope;
    dataScopeRef.current = scope;
    const normalized = normalizeDataIds(next);
    const changed = !areSparkDataEqual(dataRef.current, normalized);
    if (changed) {
      dataRef.current = normalized;
      setData(normalized);
    }
    if (changed || scopeChanged) void persistOfflineData(scope, normalized);
    return changed;
  }, []);

  const commitLocalData = useCallback((next: SparkData) => {
    dataRef.current = next;
    setData(next);
    if (!cloudUserRef.current) void persistOfflineData("demo", next);
  }, []);

  const persistPendingMutations = useCallback((userId: string) => {
    return persistOfflineMutations(userId, pendingMutationsRef.current);
  }, []);

  const setIdleSyncStatus = useCallback(() => {
    if (!cloudUserRef.current) {
      setSyncStatus(isSupabaseConfigured() ? "demo" : "not-configured");
    } else if (!navigator.onLine) {
      setSyncStatus("offline");
    } else if (pendingMutationsRef.current.length > 0) {
      setSyncStatus("syncing");
    } else if (!realtimeConnectedRef.current) {
      setSyncStatus("reconnecting");
    } else {
      setSyncStatus("synced");
    }
  }, []);

  const pullCloudData = useCallback((expectedUserId?: string): Promise<void> => {
    const user = cloudUserRef.current;
    if (!user || (expectedUserId && user.id !== expectedUserId)) return Promise.resolve();
    return pullSingleFlightRef.current.run(user.id, async () => {
      const requestId = ++pullRequestRef.current;
      const revision = syncRevisionRef.current;
      try {
        const client = await getSupabaseBrowserClient();
        if (!client) return;
        const remote = await fetchCloudData(client, user.id);
        if (
          requestId !== pullRequestRef.current ||
          revision !== syncRevisionRef.current ||
          cloudUserRef.current?.id !== user.id
        ) {
          return;
        }
        replaceData(
          applyCloudMutations(remote, pendingMutationsRef.current),
          user.id,
        );
        setIdleSyncStatus();
      } catch (error) {
        console.error("Spark cloud refresh failed", error);
        setSyncStatus(navigator.onLine ? "error" : "offline");
      }
    });
  }, [replaceData, setIdleSyncStatus]);

  const schedulePendingRetry = useCallback(() => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    const delay = retryDelayRef.current;
    retryDelayRef.current = Math.min(delay * 2, 30_000);
    retryTimerRef.current = setTimeout(() => {
      retryTimerRef.current = null;
      void flushPendingRef.current();
    }, delay);
  }, []);

  const flushPendingMutations = useCallback((): Promise<void> => {
    const user = cloudUserRef.current;
    if (!user) return Promise.resolve();
    if (!navigator.onLine) {
      setSyncStatus("offline");
      return Promise.resolve();
    }

    return flushSingleFlightRef.current.run(user.id, async () => {
      const client = await getSupabaseBrowserClient();
      if (!client) return;
      while (pendingMutationsRef.current.length > 0) {
        if (cloudUserRef.current?.id !== user.id) return;
        const mutation = pendingMutationsRef.current[0];
        setSyncStatus("syncing");
        try {
          await runCloudMutation(client, mutation, user.id);
        } catch (error) {
          console.error("Spark cloud mutation failed", error);
          setSyncStatus(navigator.onLine ? "error" : "offline");
          schedulePendingRetry();
          return;
        }

        if (pendingMutationsRef.current[0]?.id === mutation.id) {
          pendingMutationsRef.current = pendingMutationsRef.current.slice(1);
          syncRevisionRef.current += 1;
          await persistPendingMutations(user.id);
        }
      }

      retryDelayRef.current = 1_000;
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      await pullCloudData(user.id);
    });
  }, [persistPendingMutations, pullCloudData, schedulePendingRetry]);

  useEffect(() => {
    flushPendingRef.current = flushPendingMutations;
  }, [flushPendingMutations]);

  const enqueueCloudMutations = useCallback((mutations: CloudMutation[]) => {
    const user = cloudUserRef.current;
    if (!user || mutations.length === 0) return;
    pendingMutationsRef.current = mutations.reduce(
      (queue, mutation) => appendCloudMutation(queue, mutation),
      pendingMutationsRef.current,
    );
    syncRevisionRef.current += 1;
    const snapshot = dataRef.current;
    setSyncStatus(navigator.onLine ? "syncing" : "offline");
    const persisted = snapshot
      ? persistOfflineState(user.id, snapshot, pendingMutationsRef.current)
      : persistPendingMutations(user.id);
    mutationPersistenceRef.current = persisted;
    void persisted
      .then(() => {
        if (mutationPersistenceRef.current !== persisted) return;
        mutationPersistenceRef.current = null;
        return flushPendingMutations();
      })
      .catch((error) => {
        if (mutationPersistenceRef.current === persisted) mutationPersistenceRef.current = null;
        console.error("Spark could not persist a cloud mutation", error);
        setSyncStatus("error");
      });
  }, [flushPendingMutations, persistPendingMutations]);

  const enqueueCloudMutation = useCallback((mutation: CloudMutation) => {
    enqueueCloudMutations([mutation]);
  }, [enqueueCloudMutations]);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    let active = true;
    let activationUserId: string | null = null;
    let activationPromise: Promise<void> | null = null;
    let unsubscribeAuth: (() => void) | null = null;
    let localLoad: Promise<void> | null = null;

    const advance = (progress: number, label: string) => {
      if (active) setStartup({ progress, label, status: "loading" });
    };
    const finish = (label: string) => {
      if (active) setStartup({ progress: 100, label, status: "ready" });
    };
    const fail = (label: string) => {
      if (active) {
        setSyncStatus(navigator.onLine ? "error" : "offline");
        setStartup(current => ({ ...current, label, status: "error" }));
      }
    };
    const activateLocal = () => {
      if (localLoad) return localLoad;
      const activationId = activationRef.current;
      advance(35, "Đang tải dữ liệu trên thiết bị…");
      localLoad = withStartupTimeout(readLocalData()).then(localData => {
        if (!active || activationId !== activationRef.current || cloudUserRef.current) return;
        setHydratedData(localData, "demo");
        setStartupCanContinue(true);
        setSyncStatus(isSupabaseConfigured() ? "demo" : "not-configured");
        finish("Đã tải dữ liệu trên thiết bị");
      }).catch(() => {
        if (active && activationId === activationRef.current && !cloudUserRef.current) fail("Chưa đọc được dữ liệu trên thiết bị.");
      }).finally(() => { localLoad = null; });
      return localLoad;
    };

    const initialize = async () => {
      advance(10, "Đang kiểm tra phiên đăng nhập…");
      const client = await withStartupTimeout(getSupabaseBrowserClient());
      if (!active) return;
      if (!client) { await activateLocal(); return; }

      const activateSession = (user: { id: string; email?: string }) => {
        if (!active) return Promise.resolve();
        if (activationUserId === user.id && activationPromise) return activationPromise;
        activationUserId = user.id;
        const activationId = ++activationRef.current;
        activationPromise = (async () => {
          setStartupActive(true);
          if (dataScopeRef.current !== user.id) {
            setData(null);
            dataRef.current = null;
            pendingMutationsRef.current = [];
            mutationPersistenceRef.current = null;
            pullRequestRef.current += 1;
            if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
            setCloudUser(null);
            setStartupCanContinue(false);
            onResetTransient();
          }
          advance(25, "Đang tải dữ liệu đã lưu…");
          const nextUser = { id: user.id, email: user.email ?? "" };
          cloudUserRef.current = nextUser;
          realtimeConnectedRef.current = false;
          setSyncStatus("loading");
          const isCurrent = () => active && activationId === activationRef.current && cloudUserRef.current?.id === user.id;
          try {
            const [pendingMutations, cached] = await withStartupTimeout(Promise.all([
              readOfflineMutations(user.id), readOfflineData(user.id),
            ]));
            if (!isCurrent()) return;
            pendingMutationsRef.current = pendingMutations;
            syncRevisionRef.current += 1;
            setHydratedData(applyCloudMutations(cached ?? EMPTY_SPARK_DATA, pendingMutations), user.id);
            setCloudUser(nextUser);
            setStartupCanContinue(Boolean(cached) || pendingMutations.length > 0);
            advance(45, "Đang đồng bộ dữ liệu…");
            if (!navigator.onLine) {
              if (!cached) throw new Error("No offline snapshot");
              setSyncStatus("offline");
              finish("Đã tải bản lưu trên thiết bị · Ngoại tuyến");
              return;
            }
            const remote = await withStartupTimeout(fetchCloudData(client, user.id));
            if (!isCurrent()) return;
            replaceData(resolveCloudActivationData(remote, pendingMutationsRef.current), user.id);
            setStartupCanContinue(true);
            advance(80, "Đang hoàn tất đồng bộ…");
            if (pendingMutationsRef.current.length > 0) {
              await withStartupTimeout(flushPendingMutations());
              if (!isCurrent()) return;
              if (pendingMutationsRef.current.length > 0) throw new Error("Pending offline changes");
            } else {
              setIdleSyncStatus();
            }
            finish("Dữ liệu đã sẵn sàng");
          } catch (error) {
            console.error("Spark cloud activation failed", error);
            if (isCurrent()) {
              fail(navigator.onLine ? "Chưa đồng bộ được dữ liệu. Bạn có thể thử lại." : "Đang ngoại tuyến. Chưa tải được dữ liệu mới.");
              if (pendingMutationsRef.current.length > 0) schedulePendingRetry();
              // A later focus/auth event may retry this activation.
              activationUserId = null;
              activationPromise = null;
            }
          }
        })();
        return activationPromise;
      };

      unsubscribeAuth?.();
      const { data: authListener } = client.auth.onAuthStateChange((event, session) => {
        if (event === "INITIAL_SESSION") return; // getSession below owns initial resolution.
        queueMicrotask(() => {
          if (!active) return;
          if (session?.user) {
            void activateSession(session.user);
          } else if (event === "SIGNED_OUT") {
            onResetTransient();
            activationUserId = null;
            activationPromise = null;
            activationRef.current += 1;
            pullRequestRef.current += 1;
            cloudUserRef.current = null;
            pendingMutationsRef.current = [];
            mutationPersistenceRef.current = null;
            realtimeConnectedRef.current = false;
            setCloudUser(null);
            setData(null);
            dataRef.current = null;
            setStartupCanContinue(false);
            setStartupActive(true);
            void activateLocal();
          }
        });
      });
      unsubscribeAuth = () => authListener.subscription.unsubscribe();
      const { data: sessionData, error } = await withStartupTimeout(client.auth.getSession());
      if (!active) return;
      if (error) throw error;
      if (sessionData.session?.user) await activateSession(sessionData.session.user);
      else if (!cloudUserRef.current) await activateLocal();
    };

    const retry = () => {
      activationUserId = null;
      activationPromise = null;
      activationRef.current += 1;
      void initialize().catch(error => {
        console.error("Spark startup failed", error);
        fail("Chưa mở được dữ liệu. Vui lòng thử lại.");
      });
    };
    retryStartupRef.current = retry;
    retry();
    return () => {
      active = false;
      activationRef.current += 1;
      unsubscribeAuth?.();
    };
  }, [flushPendingMutations, replaceData, schedulePendingRetry, setHydratedData, setIdleSyncStatus, onResetTransient]);

  useEffect(() => {
    if (!cloudUser) return;
    let active = true;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    let removeChannel: (() => Promise<unknown>) | null = null;
    const refresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        if (flushSingleFlightRef.current.isRunning(cloudUser.id)) return;
        void pullCloudData(cloudUser.id);
      }, 150);
    };
    void getSupabaseBrowserClient().then((client) => {
      if (!client || !active) return;
      const channel = client
        .channel(`spark-sync-${cloudUser.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, refresh)
        .on("postgres_changes", { event: "*", schema: "public", table: "items" }, refresh)
        .subscribe((status, error) => {
          if (!active) return;
          if (status === "SUBSCRIBED") {
            realtimeConnectedRef.current = true;
            if (pendingMutationsRef.current.length > 0) {
              void flushPendingMutations();
            } else {
              void pullCloudData(cloudUser.id);
            }
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            realtimeConnectedRef.current = false;
            console.error("Spark realtime subscription interrupted", status, error);
            setSyncStatus(navigator.onLine ? "reconnecting" : "offline");
          }
        });
      removeChannel = () => client.removeChannel(channel);
    }).catch((error) => {
      console.error("Spark realtime initialization failed", error);
      if (active) setSyncStatus(navigator.onLine ? "reconnecting" : "offline");
    });
    return () => {
      active = false;
      realtimeConnectedRef.current = false;
      if (refreshTimer) clearTimeout(refreshTimer);
      if (removeChannel) void removeChannel();
    };
  }, [cloudUser, flushPendingMutations, pullCloudData]);

  useEffect(() => {
    const recover = () => {
      if (!cloudUserRef.current) return;
      if (!navigator.onLine) {
        setSyncStatus("offline");
        return;
      }
      if (pendingMutationsRef.current.length > 0) {
        void flushPendingMutations();
      } else {
        void pullCloudData(cloudUserRef.current.id);
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") recover();
    };
    const onOffline = () => {
      if (cloudUserRef.current) setSyncStatus("offline");
    };
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") recover();
    }, 60_000);

    window.addEventListener("online", recover);
    window.addEventListener("offline", onOffline);
    window.addEventListener("focus", recover);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("online", recover);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("focus", recover);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [flushPendingMutations, pullCloudData]);

  return {
    data, dataRef, startupActive, setStartupActive, startupCanContinue, startup, setStartup, retryStartupRef,
    cloudUser, syncStatus, commitLocalData, enqueueCloudMutations, enqueueCloudMutation,
  };
}
