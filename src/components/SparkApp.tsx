"use client";

import Image from "next/image";
import {
  CSSProperties,
  FormEvent,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Icon } from "@/components/ui/Icon";
import {
  fetchCloudData,
  runCloudMutation,
} from "@/lib/cloud-data";
import {
  appendCloudMutation,
  applyCloudMutations,
  cloudDataKey,
  DEMO_DATA_KEY,
  parseCloudMutations,
  pendingMutationsKey,
  resolveCloudActivationData,
  type CloudMutation,
} from "@/lib/cloud-sync";
import {
  addCalendarDays,
  formatDateRange,
  formatLongDate,
  formatShortDate,
  getLocalDateKey,
} from "@/lib/dates";
import { resolveItemSwipe, shouldOpenMobileSidebar } from "@/lib/mobile-gestures";
import { normalizeDataIds, type SparkData } from "@/lib/data-ids";
import { completedForView, filterItems, groupItemsByTime, type TimeGroup } from "@/lib/task-filters";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { resolveStandaloneShortcut } from "@/lib/keyboard-shortcuts";
import type { ItemType, Project, SparkItem, View } from "@/lib/types";

const LEGACY_STORAGE_KEY = "spark:data:v1";
const SIDEBAR_KEY = "spark:sidebar:v2";
const SIDEBAR_SECTIONS_KEY = "spark:sidebar-sections";
const SPARK_LOGO_SRC = "/brand/spark-logo.svg";
const SPARK_LOGO_NEGATIVE_SRC = "/brand/spark-logo-negative.svg";
const SPARK_MARK_NEGATIVE_SRC = "/spark-mark-negative.svg";

const timeGroupLabels: Record<TimeGroup, string> = {
  overdue: "Quá hạn",
  today: "Hôm nay",
  upcoming: "Sắp tới",
  later: "Sau đó",
  undated: "Chưa có ngày",
};

const projectColors = [
  "#44D4CD",
  "#8951C7",
  "#D9776A",
  "#65458A",
  "#D6A84F",
  "#5C78D6",
  "#6FA889",
  "#C56F8C",
];
type SyncStatus =
  | "demo"
  | "loading"
  | "syncing"
  | "synced"
  | "offline"
  | "reconnecting"
  | "error"
  | "not-configured";
type CloudUser = { id: string; email: string };

function seedData(today: string): SparkData {
  const workProjectId = crypto.randomUUID();
  const personalProjectId = crypto.randomUUID();
  const sparkProjectId = crypto.randomUUID();
  const projects: Project[] = [
    { id: workProjectId, name: "Công việc", color: "#44D4CD", isStarred: false, archivedAt: null },
    { id: personalProjectId, name: "Cá nhân", color: "#8951C7", isStarred: false, archivedAt: null },
    { id: sparkProjectId, name: "Spark", color: "#D6A84F", isStarred: false, archivedAt: null },
  ];
  const createdAt = new Date().toISOString();
  const items: SparkItem[] = [
    {
      id: crypto.randomUUID(),
      type: "task",
      title: "Chốt ba việc quan trọng cho hôm nay",
      dueDate: today,
      projectId: workProjectId,
      completedAt: null,
      isImportant: true,
      isUrgent: false,
      createdAt,
    },
    {
      id: crypto.randomUUID(),
      type: "note",
      title: "Ý tưởng: dành 20 phút cuối ngày để thu gọn danh sách",
      dueDate: today,
      projectId: sparkProjectId,
      completedAt: null,
      isImportant: false,
      isUrgent: false,
      createdAt,
    },
    {
      id: crypto.randomUUID(),
      type: "task",
      title: "Gửi bản cập nhật cho khách hàng",
      dueDate: addCalendarDays(today, -1),
      projectId: workProjectId,
      completedAt: null,
      isImportant: false,
      isUrgent: true,
      createdAt,
    },
    {
      id: crypto.randomUUID(),
      type: "task",
      title: "Đặt lịch khám định kỳ",
      dueDate: addCalendarDays(today, 2),
      projectId: personalProjectId,
      completedAt: null,
      isImportant: true,
      isUrgent: false,
      createdAt,
    },
  ];
  return { items, projects };
}

function readStoredData(key: string): SparkData | null {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? normalizeDataIds(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
}

function readDemoData(today: string): SparkData {
  return (
    readStoredData(DEMO_DATA_KEY) ??
    readStoredData(LEGACY_STORAGE_KEY) ??
    seedData(today)
  );
}

function readPendingMutations(userId: string) {
  try {
    return parseCloudMutations(
      JSON.parse(window.localStorage.getItem(pendingMutationsKey(userId)) ?? "[]"),
    );
  } catch {
    return [];
  }
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
    target.isContentEditable
  );
}

function viewKey(view: View) {
  if (view.type === "calendar") return `calendar:${view.date}`;
  if (view.type === "project") return `project:${view.projectId}`;
  return view.type;
}

function orderProjectsForSidebar(projects: Project[]) {
  return [
    ...projects.filter((project) => project.isStarred),
    ...projects.filter((project) => !project.isStarred),
  ];
}

function isSyncInProgress(status: SyncStatus) {
  return status === "loading" || status === "syncing" || status === "reconnecting";
}

function syncStatusTitle(status: SyncStatus) {
  if (status === "synced") return "Đã đồng bộ an toàn";
  if (status === "offline") return "Đang offline";
  if (status === "error") return "Đồng bộ đang gián đoạn";
  if (isSyncInProgress(status)) return "Đang nối và đối soát…";
  return "Bật đồng bộ dữ liệu";
}

function syncStatusDetail(status: SyncStatus) {
  if (status === "synced") return "Cập nhật trên mọi thiết bị";
  if (status === "offline") return "Thay đổi đang chờ mạng trở lại";
  if (status === "error") return "Đã giữ thay đổi trên thiết bị để thử lại";
  return "Public để xem · riêng tư khi dùng";
}

export function SparkApp() {
  const today = getLocalDateKey();
  const [data, setData] = useState<SparkData | null>(null);
  const [view, setView] = useState<View>({ type: "today" });
  const [sidebarCompact, setSidebarCompact] = useState(true);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [attentionOpen, setAttentionOpen] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [pendingS, setPendingS] = useState(false);
  const [hideNotes, setHideNotes] = useState(false);
  const [completedOpen, setCompletedOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SparkItem | null>(null);
  const [projectEditor, setProjectEditor] = useState<Project | "new" | null>(null);
  const [deletedItem, setDeletedItem] = useState<SparkItem | null>(null);
  const [openSwipeItemId, setOpenSwipeItemId] = useState<string | null>(null);
  const [cloudUser, setCloudUser] = useState<CloudUser | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(isSupabaseConfigured() ? "loading" : "not-configured");
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef(data);
  const dataScopeRef = useRef<"demo" | string>("demo");
  const cloudUserRef = useRef<CloudUser | null>(null);
  const pendingMutationsRef = useRef<CloudMutation[]>([]);
  const syncRevisionRef = useRef(0);
  const pullRequestRef = useRef(0);
  const activationRef = useRef(0);
  const realtimeConnectedRef = useRef(false);
  const flushPromiseRef = useRef<Promise<void> | null>(null);
  const flushUserIdRef = useRef<string | null>(null);
  const flushPendingRef = useRef<() => Promise<void>>(async () => undefined);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryDelayRef = useRef(1_000);
  const navEdgeGestureRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
  } | null>(null);

  const replaceData = useCallback((next: SparkData, scope?: "demo" | string) => {
    if (scope) dataScopeRef.current = scope;
    dataRef.current = next;
    const key = dataScopeRef.current === "demo"
      ? DEMO_DATA_KEY
      : cloudDataKey(dataScopeRef.current);
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch (error) {
      console.error("Spark local cache write failed", error);
    }
    setData(next);
  }, []);

  const persistPendingMutations = useCallback((userId: string) => {
    window.localStorage.setItem(
      pendingMutationsKey(userId),
      JSON.stringify(pendingMutationsRef.current),
    );
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

  const pullCloudData = useCallback(async (expectedUserId?: string) => {
    const client = getSupabaseBrowserClient();
    const user = cloudUserRef.current;
    if (!client || !user || (expectedUserId && user.id !== expectedUserId)) return;

    const requestId = ++pullRequestRef.current;
    const revision = syncRevisionRef.current;
    try {
      const remote = await fetchCloudData(client);
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

  const flushPendingMutations = useCallback(async () => {
    const user = cloudUserRef.current;
    const client = getSupabaseBrowserClient();
    if (!user || !client) return;
    if (flushPromiseRef.current && flushUserIdRef.current === user.id) {
      return flushPromiseRef.current;
    }
    if (!navigator.onLine) {
      setSyncStatus("offline");
      return;
    }

    const flush = (async () => {
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
          persistPendingMutations(user.id);
        }
      }

      retryDelayRef.current = 1_000;
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      await pullCloudData(user.id);
    })();

    const trackedFlush = flush.finally(() => {
      if (flushPromiseRef.current === trackedFlush) {
        flushPromiseRef.current = null;
        flushUserIdRef.current = null;
      }
    });
    flushPromiseRef.current = trackedFlush;
    flushUserIdRef.current = user.id;
    return trackedFlush;
  }, [persistPendingMutations, pullCloudData, schedulePendingRetry]);

  useEffect(() => {
    flushPendingRef.current = flushPendingMutations;
  }, [flushPendingMutations]);

  const enqueueCloudMutation = useCallback((mutation: CloudMutation) => {
    const user = cloudUserRef.current;
    if (!user) return;
    pendingMutationsRef.current = appendCloudMutation(
      pendingMutationsRef.current,
      mutation,
    );
    syncRevisionRef.current += 1;
    persistPendingMutations(user.id);
    setSyncStatus(navigator.onLine ? "syncing" : "offline");
    void flushPendingMutations();
  }, [flushPendingMutations, persistPendingMutations]);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    queueMicrotask(() => {
      const localData = readDemoData(today);
      replaceData(localData, "demo");
      const sidebarPreference = window.localStorage.getItem(SIDEBAR_KEY);
      setSidebarCompact(sidebarPreference === null || sidebarPreference === "compact");
      try {
        const sections = JSON.parse(window.localStorage.getItem(SIDEBAR_SECTIONS_KEY) ?? "{}");
        setAttentionOpen(sections.attention !== false);
        setProjectsOpen(sections.projects !== false);
      } catch {
        setAttentionOpen(true);
        setProjectsOpen(true);
      }
      setPreferencesLoaded(true);
    });
  }, [replaceData, today]);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    let active = true;
    let activationUserId: string | null = null;
    let activationPromise: Promise<void> | null = null;

    const activateSession = (user: { id: string; email?: string }) => {
      if (!active) return Promise.resolve();
      if (activationUserId === user.id && activationPromise) return activationPromise;

      activationUserId = user.id;
      const activationId = ++activationRef.current;
      activationPromise = (async () => {
        const nextUser = { id: user.id, email: user.email ?? "" };
        cloudUserRef.current = nextUser;
        setCloudUser(nextUser);
        realtimeConnectedRef.current = false;
        pendingMutationsRef.current = readPendingMutations(user.id);
        syncRevisionRef.current += 1;
        setSyncStatus("loading");

        const cached = readStoredData(cloudDataKey(user.id));
        if (cached) {
          replaceData(
            applyCloudMutations(cached, pendingMutationsRef.current),
            user.id,
          );
        }

        try {
          const remote = await fetchCloudData(client);
          if (
            !active ||
            activationId !== activationRef.current ||
            cloudUserRef.current?.id !== user.id
          ) {
            return;
          }

          replaceData(
            resolveCloudActivationData(remote, pendingMutationsRef.current),
            user.id,
          );
          if (pendingMutationsRef.current.length > 0) {
            void flushPendingMutations();
          } else {
            setIdleSyncStatus();
          }
        } catch (error) {
          console.error("Spark cloud activation failed", error);
          if (active && activationId === activationRef.current) {
            setSyncStatus(navigator.onLine ? "error" : "offline");
            if (pendingMutationsRef.current.length > 0) schedulePendingRetry();
          }
        }
      })();
      return activationPromise;
    };

    client.auth.getSession()
      .then(({ data: sessionData, error }) => {
        if (error) throw error;
        if (sessionData.session?.user) {
          void activateSession(sessionData.session.user);
        } else if (active) {
          cloudUserRef.current = null;
          setSyncStatus("demo");
        }
      })
      .catch((error) => {
        console.error("Spark auth session restore failed", error);
        if (active) setSyncStatus(navigator.onLine ? "error" : "offline");
      });

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      queueMicrotask(() => {
        if (session?.user) {
          void activateSession(session.user);
        } else if (active) {
          activationUserId = null;
          activationPromise = null;
          activationRef.current += 1;
          pullRequestRef.current += 1;
          cloudUserRef.current = null;
          pendingMutationsRef.current = [];
          realtimeConnectedRef.current = false;
          setCloudUser(null);
          setSyncStatus("demo");
          replaceData(readDemoData(getLocalDateKey()), "demo");
        }
      });
    });

    return () => {
      active = false;
      activationRef.current += 1;
      authListener.subscription.unsubscribe();
    };
  }, [
    flushPendingMutations,
    persistPendingMutations,
    replaceData,
    schedulePendingRetry,
    setIdleSyncStatus,
  ]);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client || !cloudUser) return;
    let active = true;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    const refresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        void pullCloudData(cloudUser.id);
      }, 150);
    };
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
    return () => {
      active = false;
      realtimeConnectedRef.current = false;
      if (refreshTimer) clearTimeout(refreshTimer);
      void client.removeChannel(channel);
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

  useEffect(() => {
    if (!preferencesLoaded) return;
    window.localStorage.setItem(SIDEBAR_KEY, sidebarCompact ? "compact" : "expanded");
  }, [preferencesLoaded, sidebarCompact]);

  useEffect(() => {
    window.localStorage.setItem(
      SIDEBAR_SECTIONS_KEY,
      JSON.stringify({ attention: attentionOpen, projects: projectsOpen }),
    );
  }, [attentionOpen, projectsOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return;
      const standaloneShortcut = resolveStandaloneShortcut(event.key);
      if (event.key === "Escape") {
        setPendingS(false);
        setHelpOpen(false);
        setMobileNav(false);
        setEditingItem(null);
        setQuickAddOpen(false);
        return;
      }
      if (standaloneShortcut === "toggle-sidebar") {
        event.preventDefault();
        setSidebarCompact((value) => !value);
        return;
      }
      if (standaloneShortcut === "help") {
        event.preventDefault();
        setHelpOpen(true);
        return;
      }
      const key = event.key.toLowerCase();
      if (
        standaloneShortcut === "new-task" &&
        !editingItem &&
        !projectEditor &&
        !helpOpen &&
        !syncDialogOpen &&
        !mobileNav
      ) {
        event.preventDefault();
        setPendingS(false);
        setQuickAddOpen(true);
        return;
      }
      if (pendingS) {
        let handled = true;
        if (key === "t") setView({ type: "today" });
        else if (key === "s") setView({ type: "upcoming" });
        else if (key === "d") setView({ type: "calendar", date: today });
        else if (key === "a") setView({ type: "all" });
        else if (key === "i") setView({ type: "important" });
        else if (key === "u") setView({ type: "urgent" });
        else if (/^[1-9]$/.test(key)) {
          const shortcutProjects = orderProjectsForSidebar(
            (dataRef.current?.projects ?? []).filter((project) => !project.archivedAt),
          );
          const project = shortcutProjects[Number(key) - 1];
          if (project) setView({ type: "project", projectId: project.id });
          else handled = false;
        } else handled = false;
        setPendingS(false);
        if (handled) event.preventDefault();
        return;
      }
      if (key === "s") {
        event.preventDefault();
        setPendingS(true);
        if (pendingTimer.current) clearTimeout(pendingTimer.current);
        pendingTimer.current = setTimeout(() => setPendingS(false), 1000);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editingItem, helpOpen, mobileNav, pendingS, projectEditor, syncDialogOpen, today]);

  const projects = data?.projects.filter((project) => !project.archivedAt) ?? [];
  const openItems = useMemo(
    () => (data ? filterItems(data.items, view, today) : []),
    [data, view, today],
  );
  const completedItems = useMemo(
    () => (data ? completedForView(data.items, view, today) : []),
    [data, view, today],
  );
  const visibleOpenItems = useMemo(
    () => hideNotes ? openItems.filter((item) => item.type === "task") : openItems,
    [hideNotes, openItems],
  );
  const overdue = view.type === "today" ? visibleOpenItems.filter((item) => item.dueDate! < today) : [];
  const current = view.type === "today" ? visibleOpenItems.filter((item) => item.dueDate === today) : view.type === "all" ? [] : visibleOpenItems;
  const allTimeGroups = useMemo(
    () => view.type === "all" ? groupItemsByTime(visibleOpenItems, today) : [],
    [today, view.type, visibleOpenItems],
  );
  const activeProject = view.type === "project" ? projects.find((project) => project.id === view.projectId) : null;
  const taskCount = openItems.filter((item) => item.type === "task").length;
  const noteCount = openItems.filter((item) => item.type === "note").length;
  const overdueCount = visibleOpenItems.filter((item) => item.dueDate && item.dueDate < today).length;

  const navigate = (next: View) => {
    setView(next);
    setMobileNav(false);
    setOpenSwipeItemId(null);
    setCompletedOpen(false);
  };

  const mutateItem = (id: string, update: Partial<SparkItem>) => {
    const currentData = dataRef.current;
    if (!currentData) return;
    const existing = currentData.items.find((item) => item.id === id);
    if (!existing) return;
    const nextItem = { ...existing, ...update };
    replaceData({
      ...currentData,
      items: currentData.items.map((item) => (item.id === id ? nextItem : item)),
    });
    enqueueCloudMutation({
      id: crypto.randomUUID(),
      kind: "upsert-item",
      item: nextItem,
    });
  };

  const addItem = (item: SparkItem) => {
    const currentData = dataRef.current;
    if (!currentData) return;
    replaceData({ ...currentData, items: [...currentData.items, item] });
    enqueueCloudMutation({
      id: crypto.randomUUID(),
      kind: "upsert-item",
      item,
    });
  };

  const saveProject = (project: Project) => {
    const currentData = dataRef.current;
    if (!currentData) return;
    const exists = currentData.projects.some((entry) => entry.id === project.id);
    replaceData({
      ...currentData,
      projects: exists
        ? currentData.projects.map((entry) => entry.id === project.id ? project : entry)
        : [...currentData.projects, project],
    });
    enqueueCloudMutation({
      id: crypto.randomUUID(),
      kind: "upsert-project",
      project,
    });
  };

  const toggleComplete = (item: SparkItem) => {
    if (item.type === "note") return;
    mutateItem(item.id, { completedAt: item.completedAt ? null : new Date().toISOString() });
  };

  const removeItem = (item: SparkItem) => {
    setDeletedItem(item);
    setEditingItem(null);
    setOpenSwipeItemId(null);
    const currentData = dataRef.current;
    if (currentData) {
      replaceData({
        ...currentData,
        items: currentData.items.filter((entry) => entry.id !== item.id),
      });
    }
    enqueueCloudMutation({
      id: crypto.randomUUID(),
      kind: "delete-item",
      itemId: item.id,
    });
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setDeletedItem(null), 6000);
  };

  const undoDelete = () => {
    if (!deletedItem) return;
    const currentData = dataRef.current;
    if (currentData) {
      replaceData({ ...currentData, items: [...currentData.items, deletedItem] });
    }
    enqueueCloudMutation({
      id: crypto.randomUUID(),
      kind: "upsert-item",
      item: deletedItem,
    });
    setDeletedItem(null);
  };

  const title =
    view.type === "today"
      ? "Hôm nay"
      : view.type === "upcoming"
        ? "Sắp tới"
        : view.type === "calendar"
          ? "Theo ngày"
          : view.type === "all"
            ? "Tất cả"
          : view.type === "important"
            ? "Quan Trọng"
            : view.type === "urgent"
              ? "Ưu tiên"
              : activeProject?.name ?? "Dự án";

  const headerContext =
    view.type === "today"
      ? formatLongDate(today)
      : view.type === "upcoming"
        ? formatDateRange(addCalendarDays(today, 1), addCalendarDays(today, 3))
        : view.type === "calendar"
          ? formatLongDate(view.date)
          : null;

  const startNavEdgeGesture = (event: ReactPointerEvent<HTMLElement>) => {
    if (
      mobileNav ||
      !event.isPrimary ||
      event.button !== 0 ||
      event.clientX > 24 ||
      !window.matchMedia("(max-width: 699px)").matches
    ) {
      navEdgeGestureRef.current = null;
      return;
    }
    navEdgeGestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
  };

  const moveNavEdgeGesture = (event: ReactPointerEvent<HTMLElement>) => {
    const gesture = navEdgeGestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    if (deltaX < -8 || Math.abs(deltaY) > Math.abs(deltaX) * 1.4) {
      navEdgeGestureRef.current = null;
      return;
    }
    if (shouldOpenMobileSidebar(deltaX, deltaY)) {
      event.preventDefault();
      navEdgeGestureRef.current = null;
      setOpenSwipeItemId(null);
      setMobileNav(true);
    }
  };

  const endNavEdgeGesture = (event: ReactPointerEvent<HTMLElement>) => {
    if (navEdgeGestureRef.current?.pointerId === event.pointerId) {
      navEdgeGestureRef.current = null;
    }
  };

  if (!data) return <LoadingShell />;

  return (
    <div className={`app-shell ${sidebarCompact ? "sidebar-compact" : ""}`}>
      <Sidebar
        compact={sidebarCompact}
        currentView={view}
        attentionOpen={attentionOpen}
        items={data.items}
        onCloseMobile={() => setMobileNav(false)}
        onEditProject={setProjectEditor}
        onHelp={() => setHelpOpen(true)}
        onNavigate={navigate}
        onToggleAttention={() => setAttentionOpen((value) => !value)}
        onToggleProjects={() => setProjectsOpen((value) => !value)}
        onToggleProjectStar={(project) => saveProject({ ...project, isStarred: !project.isStarred })}
        onSync={() => setSyncDialogOpen(true)}
        onToggle={() => setSidebarCompact((value) => !value)}
        projects={projects}
        projectsOpen={projectsOpen}
        syncStatus={syncStatus}
        today={today}
      />

      {mobileNav && (
        <div className="mobile-nav-backdrop" onClick={() => setMobileNav(false)}>
          <div className="mobile-nav-panel" onClick={(event) => event.stopPropagation()}>
            <Sidebar
              compact={false}
              currentView={view}
              attentionOpen={attentionOpen}
              items={data.items}
              mobile
              onCloseMobile={() => setMobileNav(false)}
              onEditProject={setProjectEditor}
              onHelp={() => setHelpOpen(true)}
              onNavigate={navigate}
              onToggleAttention={() => setAttentionOpen((value) => !value)}
              onToggleProjects={() => setProjectsOpen((value) => !value)}
              onToggleProjectStar={(project) => saveProject({ ...project, isStarred: !project.isStarred })}
              onSync={() => setSyncDialogOpen(true)}
              onToggle={() => setMobileNav(false)}
              projects={projects}
              projectsOpen={projectsOpen}
              syncStatus={syncStatus}
              today={today}
            />
          </div>
        </div>
      )}

      <main
        className="content"
        onPointerDownCapture={startNavEdgeGesture}
        onPointerMoveCapture={moveNavEdgeGesture}
        onPointerUpCapture={endNavEdgeGesture}
        onPointerCancelCapture={endNavEdgeGesture}
      >
        <header className="mobile-header">
          <button className="icon-button" onClick={() => setMobileNav(true)} aria-label="Mở điều hướng">
            <Icon name="menu" />
          </button>
          <Image className="mobile-logo" src={SPARK_LOGO_SRC} width={120} height={45} alt="Spark" priority unoptimized />
          <button
            className={`icon-button mobile-note-toggle note-visibility-button ${hideNotes ? "notes-hidden" : ""}`}
            type="button"
            aria-label={hideNotes ? "Hiện ghi chú" : "Ẩn ghi chú"}
            aria-pressed={hideNotes}
            title={hideNotes ? "Hiện ghi chú" : "Ẩn ghi chú"}
            onClick={() => setHideNotes((value) => !value)}
          >
            <Icon name="note" />
          </button>
        </header>

        <section className="canvas" aria-labelledby="view-title">
          <div className="view-header">
            <div>
              {(headerContext || (view.type === "project" && activeProject)) && <div className="eyebrow">
                {view.type === "project" && activeProject && (
                  <span className="project-dot header-dot" style={{ background: activeProject.color }} />
                )}
                {headerContext}
              </div>}
              <div className="view-title-row">
                <h1 id="view-title">{title}</h1>
                {view.type === "project" && activeProject && (
                  <button
                    className="project-edit-button"
                    onClick={() => setProjectEditor(activeProject)}
                    aria-label={`Chỉnh sửa dự án ${activeProject.name}`}
                    title="Chỉnh sửa dự án"
                  >
                    <Icon name="edit" size={18} />
                  </button>
                )}
              </div>
              <p>{taskCount} việc cần xử lý <span aria-hidden="true">|</span> {overdueCount} quá hạn <span aria-hidden="true">|</span> {noteCount} ghi chú{hideNotes ? " đang ẩn" : ""}</p>
            </div>
            <div className="view-actions">
              <button
                className={`icon-button note-visibility-button ${hideNotes ? "notes-hidden" : ""}`}
                type="button"
                aria-label={hideNotes ? "Hiện ghi chú" : "Ẩn ghi chú"}
                aria-pressed={hideNotes}
                title={hideNotes ? "Hiện ghi chú" : "Ẩn ghi chú"}
                onClick={() => setHideNotes((value) => !value)}
              >
                <Icon name="note" />
              </button>
              <button className="icon-button help-action" onClick={() => setHelpOpen(true)} aria-label="Phím tắt">
                <Icon name="help" />
              </button>
            </div>
          </div>

          {view.type === "calendar" && (
            <DateStrip selected={view.date} today={today} onSelect={(date) => setView({ type: "calendar", date })} />
          )}

          <div className="list-area">
            {overdue.length > 0 && (
              <ItemGroup
                label="Quá hạn"
                items={overdue}
                projects={projects}
                today={today}
                hideTodayDue={view.type === "today"}
                onComplete={toggleComplete}
                onDelete={removeItem}
                onEdit={setEditingItem}
                onFlag={mutateItem}
                openSwipeItemId={openSwipeItemId}
                onSwipeOpenChange={setOpenSwipeItemId}
              />
            )}
            {current.length > 0 && (
              <ItemGroup
                label={view.type === "today" ? "Hôm nay" : undefined}
                items={current}
                projects={projects}
                today={today}
                hideTodayDue={view.type === "today"}
                onComplete={toggleComplete}
                onDelete={removeItem}
                onEdit={setEditingItem}
                onFlag={mutateItem}
                openSwipeItemId={openSwipeItemId}
                onSwipeOpenChange={setOpenSwipeItemId}
              />
            )}
            {view.type === "all" && allTimeGroups.map((group) => (
              <ItemGroup
                key={group.key}
                label={timeGroupLabels[group.key]}
                items={group.items}
                projects={projects}
                today={today}
                hideTodayDue={group.key === "today"}
                onComplete={toggleComplete}
                onDelete={removeItem}
                onEdit={setEditingItem}
                onFlag={mutateItem}
                openSwipeItemId={openSwipeItemId}
                onSwipeOpenChange={setOpenSwipeItemId}
              />
            ))}
            {visibleOpenItems.length === 0 && <EmptyState view={view} />}

            <QuickAdd
              key={viewKey(view)}
              expanded={quickAddOpen}
              projects={projects}
              today={today}
              view={view}
              onAdd={addItem}
              onExpandedChange={setQuickAddOpen}
            />

            {completedItems.length > 0 && (
              <div className="completed-section">
                <button className="completed-toggle" onClick={() => setCompletedOpen((value) => !value)}>
                  <Icon name="chevron" className={completedOpen ? "rotate-down" : ""} size={17} />
                  Đã hoàn thành <span>{completedItems.length}</span>
                </button>
                {completedOpen && (
                  <ItemGroup
                    items={completedItems}
                    projects={projects}
                    today={today}
                    hideTodayDue={view.type === "today"}
                    onComplete={toggleComplete}
                    onDelete={removeItem}
                    onEdit={setEditingItem}
                    onFlag={mutateItem}
                    openSwipeItemId={openSwipeItemId}
                    onSwipeOpenChange={setOpenSwipeItemId}
                  />
                )}
              </div>
            )}
          </div>
        </section>
        <p className={`storage-note ${syncStatus}`}><span /> {
          syncStatus === "synced"
            ? "Đã đồng bộ trên mọi thiết bị"
            : syncStatus === "offline"
              ? "Đang offline · thay đổi sẽ tự đồng bộ khi có mạng"
              : isSyncInProgress(syncStatus)
                ? "Đang nối và đối soát dữ liệu…"
              : syncStatus === "error"
                ? "Đồng bộ bị gián đoạn · thay đổi đã được giữ để thử lại"
                : "Chỉ lưu trên thiết bị này · chưa đồng bộ"
        }</p>
      </main>

      {editingItem && (
        <ItemEditor
          item={editingItem}
          projects={projects}
          onClose={() => setEditingItem(null)}
          onDelete={() => removeItem(editingItem)}
          onSave={(update) => {
            mutateItem(editingItem.id, update);
            setEditingItem(null);
          }}
        />
      )}
      {projectEditor && (
        <ProjectEditor
          project={projectEditor === "new" ? null : projectEditor}
          onClose={() => setProjectEditor(null)}
          onSave={(project) => {
            saveProject(project);
            setProjectEditor(null);
          }}
        />
      )}
      {helpOpen && <ShortcutHelp projects={orderProjectsForSidebar(projects).slice(0, 9)} onClose={() => setHelpOpen(false)} />}
      {syncDialogOpen && (
        <SyncDialog
          configured={isSupabaseConfigured()}
          status={syncStatus}
          user={cloudUser}
          onClose={() => setSyncDialogOpen(false)}
          onSignedOut={() => {
            const client = getSupabaseBrowserClient();
            if (client) void client.auth.signOut();
          }}
        />
      )}
      {pendingS && <div className="key-hint"><kbd>S</kbd><span>Tiếp theo:</span><kbd>T</kbd> Hôm nay <kbd>S</kbd> Sắp tới <kbd>D</kbd> Theo ngày <kbd>A</kbd> Tất cả <kbd>I</kbd> Quan Trọng <kbd>U</kbd> Ưu tiên <kbd>1–9</kbd> Dự án</div>}
      {deletedItem && (
        <div className="toast" role="status"><span>Đã xóa “{deletedItem.title}”</span><button onClick={undoDelete}>Hoàn tác</button></div>
      )}
    </div>
  );
}

function Sidebar({
  attentionOpen,
  compact,
  currentView,
  items,
  mobile = false,
  onCloseMobile,
  onEditProject,
  onHelp,
  onNavigate,
  onSync,
  onToggleAttention,
  onToggleProjects,
  onToggleProjectStar,
  onToggle,
  projects,
  projectsOpen,
  syncStatus,
  today,
}: {
  attentionOpen: boolean;
  compact: boolean;
  currentView: View;
  items: SparkItem[];
  mobile?: boolean;
  onCloseMobile: () => void;
  onEditProject: (project: Project | "new") => void;
  onHelp: () => void;
  onNavigate: (view: View) => void;
  onSync: () => void;
  onToggleAttention: () => void;
  onToggleProjects: () => void;
  onToggleProjectStar: (project: Project) => void;
  onToggle: () => void;
  projects: Project[];
  projectsOpen: boolean;
  syncStatus: SyncStatus;
  today: string;
}) {
  const navItems = [
    { view: { type: "today" } as View, label: "Hôm nay", icon: "sun" as const, count: filterItems(items, { type: "today" }, today).length },
    { view: { type: "upcoming" } as View, label: "Sắp tới", icon: "clock" as const, count: filterItems(items, { type: "upcoming" }, today).length },
    { view: { type: "calendar", date: today } as View, label: "Theo ngày", icon: "calendar" as const },
    { view: { type: "all" } as View, label: "Tất cả", icon: "list" as const, count: filterItems(items, { type: "all" }, today).length },
  ];
  const smartItems = [
    { view: { type: "important" } as View, label: "Quan Trọng", icon: "star" as const, className: "important" },
    { view: { type: "urgent" } as View, label: "Ưu tiên", icon: "zap" as const, className: "urgent" },
  ];
  const starredProjects = projects.filter((project) => project.isStarred);
  const regularProjects = projects.filter((project) => !project.isStarred);
  const orderedProjects = orderProjectsForSidebar(projects);
  const isActive = (candidate: View) => candidate.type === currentView.type;
  const renderProject = (project: Project) => {
    const shortcutNumber = orderedProjects.indexOf(project) + 1;
    const tooltip = shortcutNumber >= 1 && shortcutNumber <= 9 ? `S ${shortcutNumber} · ${project.name}` : project.name;
    return (
      <div className="project-nav-row" key={project.id}>
        <button className={`nav-item ${currentView.type === "project" && currentView.projectId === project.id ? "active" : ""}`} onClick={() => onNavigate({ type: "project", projectId: project.id })} aria-label={project.name} title={compact ? undefined : project.name} data-tooltip={compact ? tooltip : undefined}>
          <span className="project-dot" style={{ background: project.color }} /><span className="nav-text">{project.name}</span>
        </button>
        {!compact && <div className="project-actions">
          <button className={`project-star ${project.isStarred ? "selected" : ""}`} onClick={() => onToggleProjectStar(project)} aria-label={project.isStarred ? `Bỏ ${project.name} khỏi Cần lưu ý` : `Đưa ${project.name} vào Cần lưu ý`} title={project.isStarred ? "Bỏ gắn sao" : "Gắn sao"}><Icon name="star" size={15} /></button>
          <button className="project-more" onClick={() => onEditProject(project)} aria-label={`Sửa ${project.name}`}><Icon name="more" size={17} /></button>
        </div>}
      </div>
    );
  };

  return (
    <aside className={`sidebar ${mobile ? "sidebar-mobile" : ""}`}>
      <div className="sidebar-brand">
        <span className="brand-full-wrap"><Image className="brand-full" src={SPARK_LOGO_NEGATIVE_SRC} width={151} height={57} alt="Spark" priority unoptimized /></span>
        <span className="brand-mark"><Image className="brand-mark-art" src={SPARK_MARK_NEGATIVE_SRC} width={36} height={36} alt="" priority unoptimized /></span>
        {mobile && <button className="icon-button sidebar-close" onClick={onCloseMobile} aria-label="Đóng điều hướng"><Icon name="close" /></button>}
      </div>
      <nav aria-label="Điều hướng chính">
        <div className="nav-section">
          {navItems.map((entry) => (
            <button key={entry.label} className={`nav-item ${isActive(entry.view) ? "active" : ""}`} onClick={() => onNavigate(entry.view)} aria-label={entry.label} title={compact ? undefined : entry.label} data-tooltip={compact ? entry.label : undefined}>
              <Icon name={entry.icon} /><span className="nav-text">{entry.label}</span>{entry.count !== undefined && <span className="nav-count">{entry.count}</span>}
            </button>
          ))}
        </div>
        <div className="nav-section attention-nav">
          {!compact && <button className="section-toggle" onClick={onToggleAttention} aria-expanded={attentionOpen}><Icon name="chevron" size={13} className={attentionOpen ? "section-open" : ""} /><span className="nav-label">Cần lưu ý</span></button>}
          {(compact || attentionOpen) && smartItems.map((entry) => (
            <button key={entry.label} className={`nav-item ${entry.className} ${isActive(entry.view) ? "active" : ""}`} onClick={() => onNavigate(entry.view)} aria-label={entry.label} title={compact ? undefined : entry.label} data-tooltip={compact ? entry.label : undefined}>
              <Icon name={entry.icon} /><span className="nav-text">{entry.label}</span>
            </button>
          ))}
          {(compact || attentionOpen) && starredProjects.map(renderProject)}
        </div>
        <div className="nav-section projects-nav">
          <div className="nav-heading">
            {!compact && <button className="section-toggle" onClick={onToggleProjects} aria-expanded={projectsOpen}><Icon name="chevron" size={13} className={projectsOpen ? "section-open" : ""} /><span className="nav-label">Dự án</span></button>}
            {!compact && <button className="mini-button" onClick={() => onEditProject("new")} aria-label="Tạo dự án"><Icon name="plus" size={16} /></button>}
          </div>
          {(compact || projectsOpen) && regularProjects.map(renderProject)}
        </div>
      </nav>
      <div className="sidebar-footer">
        {!mobile && <button className="sidebar-toggle" onClick={onToggle} aria-label={compact ? "Mở rộng sidebar" : "Thu gọn sidebar"} title={compact ? undefined : "Thu gọn sidebar"} data-tooltip={compact ? "Mở rộng sidebar" : undefined}><Icon name="panel" size={20} /></button>}
        <button className="nav-item" onClick={onHelp} aria-label="Phím tắt" data-tooltip={compact ? "Phím tắt" : undefined}><Icon name="help" /><span className="nav-text">Phím tắt</span><kbd className="nav-kbd">?</kbd></button>
        <button className="local-mode-card" onClick={onSync} aria-label={syncStatusTitle(syncStatus)} data-tooltip={compact ? syncStatusTitle(syncStatus) : undefined}>
          <span className={`local-mode-icon ${syncStatus}`}><Icon name={syncStatus === "error" || syncStatus === "offline" ? "zap" : "check"} size={15} /></span>
          <span>
            <strong>{syncStatusTitle(syncStatus)}</strong>
            <small>{syncStatusDetail(syncStatus)}</small>
          </span>
        </button>
      </div>
    </aside>
  );
}

function ItemGroup({
  label,
  items,
  projects,
  today,
  hideTodayDue = false,
  onComplete,
  onDelete,
  onEdit,
  onFlag,
  openSwipeItemId,
  onSwipeOpenChange,
}: {
  label?: string;
  items: SparkItem[];
  projects: Project[];
  today: string;
  hideTodayDue?: boolean;
  onComplete: (item: SparkItem) => void;
  onDelete: (item: SparkItem) => void;
  onEdit: (item: SparkItem) => void;
  onFlag: (id: string, update: Partial<SparkItem>) => void;
  openSwipeItemId: string | null;
  onSwipeOpenChange: (id: string | null) => void;
}) {
  return (
    <section className="item-group">
      {label && <h2>{label}<span>{items.length}</span></h2>}
      <div className="item-list">
        {items.map((item) => {
          const project = projects.find((entry) => entry.id === item.projectId);
          const overdue = item.dueDate && item.dueDate < today && !item.completedAt;
          return (
            <SwipeableItemRow
              item={item}
              project={project}
              overdue={Boolean(overdue)}
              hideDue={Boolean(item.dueDate && hideTodayDue && item.dueDate === today)}
              isSwipeOpen={openSwipeItemId === item.id}
              key={item.id}
              onComplete={onComplete}
              onDelete={onDelete}
              onEdit={onEdit}
              onFlag={onFlag}
              onSwipeOpenChange={onSwipeOpenChange}
              today={today}
            />
          );
        })}
      </div>
    </section>
  );
}

const SWIPE_ACTIONS_WIDTH = 152;

function SwipeableItemRow({
  item,
  project,
  overdue,
  hideDue,
  isSwipeOpen,
  onComplete,
  onDelete,
  onEdit,
  onFlag,
  onSwipeOpenChange,
  today,
}: {
  item: SparkItem;
  project?: Project;
  overdue: boolean;
  hideDue: boolean;
  isSwipeOpen: boolean;
  onComplete: (item: SparkItem) => void;
  onDelete: (item: SparkItem) => void;
  onEdit: (item: SparkItem) => void;
  onFlag: (id: string, update: Partial<SparkItem>) => void;
  onSwipeOpenChange: (id: string | null) => void;
  today: string;
}) {
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const gestureRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    wasOpen: boolean;
    axis: "pending" | "horizontal" | "vertical";
  } | null>(null);
  const suppressClickRef = useRef(false);
  const offset = dragOffset ?? (isSwipeOpen ? -SWIPE_ACTIONS_WIDTH : 0);

  const closeActions = () => onSwipeOpenChange(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (
      !event.isPrimary ||
      event.button !== 0 ||
      event.clientX <= 24 ||
      !window.matchMedia("(max-width: 699px)").matches
    ) return;

    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      wasOpen: isSwipeOpen,
      axis: "pending",
    };
    setDragOffset(isSwipeOpen ? -SWIPE_ACTIONS_WIDTH : 0);
    if (!isSwipeOpen) onSwipeOpenChange(null);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;

    if (gesture.axis === "pending" && Math.max(Math.abs(deltaX), Math.abs(deltaY)) >= 8) {
      gesture.axis = Math.abs(deltaX) > Math.abs(deltaY) * 1.15 ? "horizontal" : "vertical";
      if (gesture.axis === "horizontal") {
        event.currentTarget.setPointerCapture(event.pointerId);
        suppressClickRef.current = true;
      }
    }
    if (gesture.axis !== "horizontal") return;

    event.preventDefault();
    const base = gesture.wasOpen ? -SWIPE_ACTIONS_WIDTH : 0;
    const minimum = -SWIPE_ACTIONS_WIDTH - 12;
    const maximum = gesture.wasOpen ? 0 : 88;
    setDragOffset(Math.max(minimum, Math.min(maximum, base + deltaX)));
  };

  const finishPointerGesture = (event: ReactPointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    const result = gesture.axis === "horizontal"
      ? resolveItemSwipe(deltaX, deltaY, gesture.wasOpen)
      : gesture.wasOpen ? "open-actions" : "closed";

    gestureRef.current = null;
    setDragOffset(null);
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
    if (result === "open-actions") onSwipeOpenChange(item.id);
    else {
      onSwipeOpenChange(null);
      if (result === "toggle-important") {
        onFlag(item.id, { isImportant: !item.isImportant });
      }
    }
  };

  const cancelPointerGesture = (event: ReactPointerEvent<HTMLElement>) => {
    if (gestureRef.current?.pointerId !== event.pointerId) return;
    gestureRef.current = null;
    suppressClickRef.current = false;
    setDragOffset(null);
  };

  return (
    <div className={`swipe-row ${dragOffset !== null ? "is-dragging" : ""}`}>
      <div className="swipe-leading-feedback" aria-hidden="true">
        <Icon name="star" size={20} />
        <span>{item.isImportant ? "Bỏ Quan Trọng" : "Quan Trọng"}</span>
      </div>
      <div className="swipe-actions" aria-hidden={!isSwipeOpen}>
        <button
          className={`swipe-action important ${item.isImportant ? "selected" : ""}`}
          type="button"
          tabIndex={isSwipeOpen ? 0 : -1}
          onClick={() => {
            onFlag(item.id, { isImportant: !item.isImportant });
            closeActions();
          }}
          aria-label={item.isImportant ? "Bỏ Quan Trọng" : "Đánh dấu Quan Trọng"}
        >
          <Icon name="star" size={19} />
        </button>
        <button
          className={`swipe-action urgent ${item.isUrgent ? "selected" : ""}`}
          type="button"
          tabIndex={isSwipeOpen ? 0 : -1}
          onClick={() => {
            onFlag(item.id, { isUrgent: !item.isUrgent });
            closeActions();
          }}
          aria-label={item.isUrgent ? "Bỏ Ưu tiên" : "Đánh dấu Ưu tiên"}
        >
          <Icon name="zap" size={19} />
        </button>
        <button
          className="swipe-action delete"
          type="button"
          tabIndex={isSwipeOpen ? 0 : -1}
          onClick={() => onDelete(item)}
          aria-label={`Xóa ${item.title}`}
        >
          <Icon name="trash" size={19} />
        </button>
      </div>

      <article
        className={`item-row ${item.completedAt ? "is-complete" : ""}`}
        style={{ "--swipe-offset": `${offset}px` } as CSSProperties}
        onClickCapture={(event) => {
          if (!suppressClickRef.current) return;
          suppressClickRef.current = false;
          event.preventDefault();
          event.stopPropagation();
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishPointerGesture}
        onPointerCancel={cancelPointerGesture}
      >
        {item.type === "task" ? (
          <button className={`checkbox ${item.completedAt ? "checked" : ""}`} onClick={() => onComplete(item)} aria-label={item.completedAt ? `Đánh dấu chưa xong: ${item.title}` : `Hoàn thành: ${item.title}`}>
            {item.completedAt && <Icon name="check" size={15} />}
          </button>
        ) : <span className="note-bullet" aria-label="Ghi chú"><span className="note-mark" aria-hidden="true" /></span>}
        {project ? <span className="project-dot item-project-dot" style={{ background: project.color }} title={project.name} /> : <span className="project-dot-spacer" />}
        <button className="item-main" onClick={() => isSwipeOpen ? closeActions() : onEdit(item)}>
          <span className="item-title">{item.title}</span>
          <span className="item-meta">
            {item.dueDate && !hideDue && <span className={overdue ? "due-overdue" : ""}>{formatShortDate(item.dueDate, today)}</span>}
            <span className="item-state-icons" aria-label={[item.isImportant ? "Quan Trọng" : "", item.isUrgent ? "Ưu tiên" : ""].filter(Boolean).join(", ")}>
              {item.isImportant && <Icon className="item-state-important" name="star" size={14} />}
              {item.isUrgent && <Icon className="item-state-urgent" name="zap" size={14} />}
            </span>
          </span>
        </button>
        <div className="item-flags">
          <button className={`flag-button important ${item.isImportant ? "selected" : ""}`} onClick={() => onFlag(item.id, { isImportant: !item.isImportant })} aria-label="Quan Trọng"><Icon name="star" size={18} /></button>
          <button className={`flag-button urgent ${item.isUrgent ? "selected" : ""}`} onClick={() => onFlag(item.id, { isUrgent: !item.isUrgent })} aria-label="Ưu tiên"><Icon name="zap" size={18} /></button>
        </div>
      </article>
    </div>
  );
}

function QuickAdd({ expanded, projects, today, view, onAdd, onExpandedChange }: {
  expanded: boolean;
  projects: Project[];
  today: string;
  view: View;
  onAdd: (item: SparkItem) => void;
  onExpandedChange: (expanded: boolean) => void;
}) {
  const [type, setType] = useState<ItemType>("task");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(view.type === "today" ? today : view.type === "calendar" ? view.date : "");
  const [projectId, setProjectId] = useState(view.type === "project" ? view.projectId : "");
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    onExpandedChange(false);
    setTitle("");
    setType("task");
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, [onExpandedChange]);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const visualViewport = window.visualViewport;

    const revealInput = () => {
      inputRef.current?.focus({ preventScroll: true });
      window.requestAnimationFrame(() => {
        inputRef.current?.scrollIntoView({ block: "center", inline: "nearest" });
      });
    };

    const fitOverlayToMobileViewport = () => {
      const backdrop = backdropRef.current;
      if (!backdrop || !visualViewport || !window.matchMedia("(max-width: 699px)").matches) return;
      backdrop.style.top = `${visualViewport.offsetTop}px`;
      backdrop.style.bottom = "auto";
      backdrop.style.height = `${visualViewport.height}px`;
      window.requestAnimationFrame(() => {
        inputRef.current?.scrollIntoView({ block: "center", inline: "nearest" });
      });
    };

    const focusFrame = window.requestAnimationFrame(revealInput);
    const keyboardTimer = window.setTimeout(() => {
      fitOverlayToMobileViewport();
      revealInput();
    }, 280);
    visualViewport?.addEventListener("resize", fitOverlayToMobileViewport);
    visualViewport?.addEventListener("scroll", fitOverlayToMobileViewport);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.cancelAnimationFrame(focusFrame);
      window.clearTimeout(keyboardTimer);
      visualViewport?.removeEventListener("resize", fitOverlayToMobileViewport);
      visualViewport?.removeEventListener("scroll", fitOverlayToMobileViewport);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [close, expanded]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || (view.type === "upcoming" && !date)) return;
    onAdd({
      id: crypto.randomUUID(),
      type,
      title: title.trim(),
      dueDate: date || null,
      projectId: projectId || null,
      completedAt: null,
      isImportant: false,
      isUrgent: false,
      createdAt: new Date().toISOString(),
    });
    setTitle("");
    setType("task");
    inputRef.current?.focus();
  };

  if (!expanded) {
    return (
      <button
        ref={triggerRef}
        className="quick-add-trigger"
        onClick={() => { setType("task"); onExpandedChange(true); }}
        aria-label="Thêm công việc"
        title="Thêm công việc"
      >
        <Icon name="plus" size={32} />
      </button>
    );
  }

  return (
    <div ref={backdropRef} className="dialog-backdrop quick-add-backdrop" onClick={close}>
      <form
        className="quick-add quick-add-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-add-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={submit}
      >
        <div className="quick-add-entry">
          <label className="quick-title-field">
            <span id="quick-add-title">{type === "task" ? "Tên công việc" : "Nội dung ghi chú"}</span>
            <input ref={inputRef} autoFocus maxLength={type === "task" ? 200 : 500} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={type === "task" ? "Bạn muốn hoàn thành điều gì?" : "Ghi lại một điều cần nhớ…"} aria-label="Tên mục" />
          </label>
          <label className="note-toggle"><input type="checkbox" checked={type === "note"} onChange={(event) => setType(event.target.checked ? "note" : "task")} />Ghi chú</label>
        </div>
        <div className="quick-add-controls">
          <label className="quick-add-field"><span>Ngày</span><span className="quick-add-control"><Icon name="calendar" size={16} /><input type="date" min={view.type === "upcoming" ? addCalendarDays(today, 1) : undefined} max={view.type === "upcoming" ? addCalendarDays(today, 3) : undefined} value={date} onChange={(event) => setDate(event.target.value)} required={view.type === "upcoming"} /></span></label>
          <label className="quick-add-field"><span>Dự án</span><span className="quick-add-control"><span className="project-dot empty" /><select value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">Không có dự án</option>{projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select></span></label>
          <div className="quick-add-actions"><button type="button" className="text-button" onClick={close}>Hủy</button><button className="primary-button" disabled={!title.trim()}>Thêm</button></div>
        </div>
      </form>
    </div>
  );
}

function DateStrip({ selected, today, onSelect }: { selected: string; today: string; onSelect: (date: string) => void }) {
  const dates = Array.from({ length: 7 }, (_, index) => addCalendarDays(selected, index - 3));
  return (
    <div className="date-strip-wrap">
      <div className="date-strip">
        {dates.map((date) => {
          const object = new Date(`${date}T12:00:00Z`);
          return <button key={date} className={date === selected ? "selected" : ""} onClick={() => onSelect(date)}><small>{new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(object)}</small><strong>{object.getUTCDate()}</strong></button>;
        })}
      </div>
      {selected !== today && <button className="today-button" onClick={() => onSelect(today)}>Về hôm nay</button>}
    </div>
  );
}

function ItemEditor({ item, projects, onClose, onDelete, onSave }: { item: SparkItem; projects: Project[]; onClose: () => void; onDelete: () => void; onSave: (update: Partial<SparkItem>) => void }) {
  const [title, setTitle] = useState(item.title);
  const [dueDate, setDueDate] = useState(item.dueDate ?? "");
  const [projectId, setProjectId] = useState(item.projectId ?? "");
  const [important, setImportant] = useState(item.isImportant);
  const [urgent, setUrgent] = useState(item.isUrgent);
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <form className="editor-sheet" onClick={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); if (title.trim()) onSave({ title: title.trim(), dueDate: dueDate || null, projectId: projectId || null, isImportant: important, isUrgent: urgent }); }}>
        <div className="editor-header"><div><span>{item.type === "task" ? "Task" : "Ghi chú"}</span><h2>Chỉnh sửa mục</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Đóng"><Icon name="close" /></button></div>
        <label className="field"><span>Tên</span><textarea autoFocus maxLength={item.type === "task" ? 200 : 500} rows={3} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <div className="field-grid"><label className="field"><span>Ngày</span><input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label><label className="field"><span>Dự án</span><select value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">Không có dự án</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label></div>
        <div className="flag-options"><button type="button" className={`flag-option important ${important ? "selected" : ""}`} onClick={() => setImportant((value) => !value)}><Icon name="star" />Quan Trọng</button><button type="button" className={`flag-option urgent ${urgent ? "selected" : ""}`} onClick={() => setUrgent((value) => !value)}><Icon name="zap" />Ưu tiên</button></div>
        <div className="editor-actions"><button type="button" className="delete-button" onClick={onDelete}><Icon name="trash" size={17} /> Xóa</button><button className="primary-button" disabled={!title.trim()}>Lưu thay đổi</button></div>
      </form>
    </div>
  );
}

function ProjectEditor({ project, onClose, onSave }: { project: Project | null; onClose: () => void; onSave: (project: Project) => void }) {
  const [name, setName] = useState(project?.name ?? "");
  const [color, setColor] = useState(project?.color ?? projectColors[0]);
  const [isStarred, setIsStarred] = useState(project?.isStarred ?? false);
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <form className="editor-sheet compact-editor" onClick={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); if (name.trim()) onSave(project ? { ...project, name: name.trim(), color, isStarred } : { id: crypto.randomUUID(), name: name.trim(), color, isStarred, archivedAt: null }); }}>
        <div className="editor-header"><div><span>Dự án</span><h2>{project ? "Chỉnh sửa dự án" : "Tạo dự án mới"}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Đóng"><Icon name="close" /></button></div>
        <label className="field"><span>Tên dự án</span><input autoFocus maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Ra mắt website" /></label>
        <fieldset className="color-picker">
          <legend>Màu nhận diện</legend>
          <button
            type="button"
            className={`project-star-option ${isStarred ? "selected" : ""}`}
            onClick={() => setIsStarred((value) => !value)}
            aria-label={isStarred ? "Bỏ khỏi Cần lưu ý" : "Đưa vào Cần lưu ý"}
            title={isStarred ? "Bỏ khỏi Cần lưu ý" : "Đưa vào Cần lưu ý"}
          >
            <Icon name="star" size={17} />
          </button>
          {projectColors.map((entry) => <button type="button" aria-label={`Chọn màu ${entry}`} className={color === entry ? "selected" : ""} style={{ background: entry }} key={entry} onClick={() => setColor(entry)} />)}
        </fieldset>
        <div className="editor-actions"><button type="button" className="text-button" onClick={onClose}>Hủy</button><button className="primary-button" disabled={!name.trim()}>{project ? "Lưu thay đổi" : "Tạo dự án"}</button></div>
      </form>
    </div>
  );
}

function ShortcutHelp({ projects, onClose }: { projects: Project[]; onClose: () => void }) {
  const shortcuts = [["N", "Thêm task mới"], ["S T", "Mở Hôm nay"], ["S S", "Mở Sắp tới"], ["S D", "Mở Theo ngày"], ["S A", "Mở Tất cả"], ["S I", "Mở Quan Trọng"], ["S U", "Mở Ưu tiên"], ...projects.map((project, index) => [`S ${index + 1}`, `Mở ${project.name}`]), ["[", "Thu gọn / mở sidebar"], ["?", "Mở bảng trợ giúp"], ["Esc", "Đóng hoặc hủy"]];
  return <div className="dialog-backdrop" onClick={onClose}><div className="shortcut-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcut-title" onClick={(event) => event.stopPropagation()}><div className="editor-header"><div><span>Đi nhanh hơn</span><h2 id="shortcut-title">Phím tắt</h2></div><button className="icon-button" onClick={onClose} aria-label="Đóng"><Icon name="close" /></button></div><div className="shortcut-list">{shortcuts.map(([keys, label]) => <div key={keys}><span>{label}</span><span>{keys.split(" ").map((key, index) => <kbd key={`${key}-${index}`}>{key}</kbd>)}</span></div>)}</div><p>Phím tắt sẽ tạm dừng khi bạn đang nhập nội dung.</p></div></div>;
}

function SyncDialog({ configured, status, user, onClose, onSignedOut }: {
  configured: boolean;
  status: SyncStatus;
  user: CloudUser | null;
  onClose: () => void;
  onSignedOut: () => void;
}) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client || !email.trim()) return;
    setSending(true);
    setError("");
    const result = await client.auth.signInWithOtp({
      email: email.trim(),
    });
    setSending(false);
    if (result.error) {
      setError(
        result.error.message.toLowerCase().includes("rate")
          ? "Bạn vừa yêu cầu mã. Hãy đợi một phút rồi thử lại."
          : "Chưa gửi được mã. Hãy kiểm tra email và thử lại.",
      );
    }
    else setSent(true);
  };

  const verify = async (event: FormEvent) => {
    event.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client || token.trim().length < 6) return;
    setVerifying(true);
    setError("");
    const result = await client.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: "email",
    });
    setVerifying(false);
    if (result.error) {
      setError("Mã không đúng hoặc đã hết hạn. Hãy dùng mã mới nhất trong email.");
    }
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="sync-dialog" role="dialog" aria-modal="true" aria-labelledby="sync-title" onClick={(event) => event.stopPropagation()}>
        <div className="editor-header">
          <div><span>Cloud sync</span><h2 id="sync-title">Dữ liệu luôn bên bạn</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Đóng"><Icon name="close" /></button>
        </div>
        {!configured ? (
          <div className="sync-message warning"><Icon name="zap" /><div><strong>Chưa kết nối Supabase</strong><p>Thêm hai biến môi trường trong <code>.env.local</code> và chạy migration để bật đồng bộ.</p></div></div>
        ) : user ? (
          <>
            <div className="sync-hero"><span><Icon name={status === "error" || status === "offline" ? "zap" : "check"} size={27} /></span><h3>{syncStatusTitle(status)}</h3><p>{status === "offline" || status === "error" ? "Mọi thay đổi vẫn được giữ trên thiết bị và sẽ tự thử lại; bạn không cần nhập lại." : "Task, note và dự án của bạn sẽ xuất hiện trên mọi browser sau khi đăng nhập bằng cùng email."}</p></div>
            <div className="signed-in-row"><div><small>Đang dùng</small><strong>{user.email}</strong></div><button className="text-button" onClick={onSignedOut}>Ngắt kết nối</button></div>
          </>
        ) : sent ? (
          <div className="sync-hero otp-step">
            <span><Icon name="check" size={27} /></span>
            <h3>Nhập mã trong email</h3>
            <p>Mình đã gửi mã đăng nhập tới <strong>{email}</strong>. Nhập mã mới nhất ngay tại đây; không cần mở liên kết.</p>
            <form className="sync-form" onSubmit={verify}>
              <label className="field"><span>Mã đăng nhập</span><input className="otp-input" autoFocus autoComplete="one-time-code" inputMode="numeric" maxLength={8} value={token} onChange={(event) => setToken(event.target.value.replace(/\D/g, ""))} placeholder="000000" /></label>
              {error && <p className="form-error">{error}</p>}
              <button className="primary-button" disabled={verifying || token.trim().length < 6}>{verifying ? "Đang xác nhận…" : "Xác nhận và đồng bộ"}</button>
            </form>
            <button className="text-button" onClick={() => { setSent(false); setToken(""); setError(""); }}>Gửi lại hoặc dùng email khác</button>
          </div>
        ) : (
          <>
            <div className="sync-benefits"><div><span>01</span><p><strong>Website vẫn mở public</strong>Ai cũng xem được giao diện, không có màn hình login chặn lối vào.</p></div><div><span>02</span><p><strong>Dữ liệu của bạn vẫn riêng tư</strong>Mã email nhận diện bạn; RLS ngăn người khác đọc hoặc sửa danh sách.</p></div></div>
            <form className="sync-form" onSubmit={submit}><label className="field"><span>Email nhận mã đăng nhập</span><input type="email" required autoComplete="email" placeholder="ban@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /></label>{error && <p className="form-error">{error}</p>}<button className="primary-button" disabled={sending || !email.trim()}>{sending ? "Đang gửi…" : "Gửi mã và bật đồng bộ"}</button></form>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ view }: { view: View }) {
  return <div className="empty-state"><span><Icon name={view.type === "calendar" ? "calendar" : "check"} size={28} /></span><h2>Khoảng trống thật dễ chịu.</h2><p>Không có mục nào ở đây. Thêm một việc nhỏ để bắt đầu, hoặc tận hưởng cảm giác đã xong.</p></div>;
}

function LoadingShell() {
  return <div className="loading-shell"><div className="loading-sidebar" /><main><div className="skeleton wide" /><div className="skeleton short" /><div className="skeleton row" /><div className="skeleton row" /><div className="skeleton row" /></main></div>;
}
