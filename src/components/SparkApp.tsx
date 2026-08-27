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
  removeProjectFromData,
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
import { createItemClickGuard, resolveItemContentTap, resolveItemSwipe, shouldOpenMobileSidebar } from "@/lib/mobile-gestures";
import { normalizeDataIds, type SparkData } from "@/lib/data-ids";
import { createUuid } from "@/lib/ids";
import { linkifyText } from "@/lib/linkify";
import { reorderProjectsForDrop, type ProjectDropPlacement } from "@/lib/project-order";
import {
  filterItems,
  filterItemsByDisplayMode,
  groupItemsByTime,
  inactiveForView,
  type ItemDisplayMode,
  type TimeGroup,
} from "@/lib/task-filters";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { resolveProjectShortcut, resolveStandaloneShortcut } from "@/lib/keyboard-shortcuts";
import type { ItemType, Project, SparkItem, View } from "@/lib/types";

const LEGACY_STORAGE_KEY = "spark:data:v1";
const SIDEBAR_KEY = "spark:sidebar:v2";
const SIDEBAR_SECTIONS_KEY = "spark:sidebar-sections";
const SPARK_LOGO_NEGATIVE_SRC = "/brand/spark-logo-negative.svg";
const SPARK_MARK_NEGATIVE_SRC = "/spark-mark-negative.svg";

const timeGroupLabels: Record<TimeGroup, string> = {
  overdue: "Quá hạn",
  today: "Hôm nay",
  upcoming: "Sắp tới",
  later: "Sau đó",
  undated: "Chưa có ngày",
};

function LinkifiedText({ value }: { value: string }) {
  return linkifyText(value).map((segment, index) =>
    segment.type === "link" ? (
      <a
        key={`${segment.href}-${index}`}
        href={segment.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {segment.value}
      </a>
    ) : (
      <span key={`text-${index}`}>{segment.value}</span>
    ),
  );
}

const projectColors = [
  "#44D4CD",
  "#8951C7",
  "#D9776A",
  "#65458A",
  "#D6A84F",
  "#5C78D6",
  "#6FA889",
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
  const workProjectId = createUuid();
  const personalProjectId = createUuid();
  const sparkProjectId = createUuid();
  const projects: Project[] = [
    { id: workProjectId, name: "Công việc", color: "#44D4CD", isStarred: false, archivedAt: null },
    { id: personalProjectId, name: "Cá nhân", color: "#8951C7", isStarred: false, archivedAt: null },
    { id: sparkProjectId, name: "Spark", color: "#D6A84F", isStarred: false, archivedAt: null },
  ];
  const createdAt = new Date().toISOString();
  const items: SparkItem[] = [
    {
      id: createUuid(),
      type: "task",
      title: "Chốt ba việc quan trọng cho hôm nay",
      description: "Chọn đúng ba việc tạo tác động lớn nhất và chốt thứ tự xử lý trước 9 giờ.",
      dueDate: today,
      projectId: workProjectId,
      completedAt: null,
      archivedAt: null,
      isImportant: true,
      isUrgent: false,
      createdAt,
    },
    {
      id: createUuid(),
      type: "note",
      title: "Ý tưởng: dành 20 phút cuối ngày để thu gọn danh sách",
      description: null,
      dueDate: today,
      projectId: sparkProjectId,
      completedAt: null,
      archivedAt: null,
      isImportant: false,
      isUrgent: false,
      createdAt,
    },
    {
      id: createUuid(),
      type: "task",
      title: "Gửi bản cập nhật cho khách hàng",
      description: null,
      dueDate: addCalendarDays(today, -1),
      projectId: workProjectId,
      completedAt: null,
      archivedAt: null,
      isImportant: false,
      isUrgent: true,
      createdAt,
    },
    {
      id: createUuid(),
      type: "task",
      title: "Đặt lịch khám định kỳ",
      description: null,
      dueDate: addCalendarDays(today, 2),
      projectId: personalProjectId,
      completedAt: null,
      archivedAt: null,
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
  const positioned = [...projects].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  return [
    ...positioned.filter((project) => project.isStarred),
    ...positioned.filter((project) => !project.isStarred),
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

function syncStatusShortLabel(status: SyncStatus) {
  if (status === "synced") return "Đã sync";
  if (status === "offline") return "Ngoại tuyến";
  if (status === "error") return "Lỗi sync";
  if (status === "reconnecting") return "Kết nối lại";
  if (status === "loading" || status === "syncing") return "Đang sync";
  return "Local";
}

export function SparkApp() {
  const today = getLocalDateKey();
  const [data, setData] = useState<SparkData | null>(null);
  const [selectedView, setView] = useState<View>({ type: "today" });
  const view = useMemo<View>(() => selectedView.type === "project" && data && !data.projects.some((project) => project.id === selectedView.projectId)
    ? { type: "today" } : selectedView, [data, selectedView]);
  const [sidebarCompact, setSidebarCompact] = useState(true);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [attentionOpen, setAttentionOpen] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [itemDisplayMode, setItemDisplayMode] = useState<ItemDisplayMode>("all");
  const [mobileHeaderCompact, setMobileHeaderCompact] = useState(false);
  const [completedOpen, setCompletedOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SparkItem | null>(null);
  const [projectEditor, setProjectEditor] = useState<Project | "new" | null>(null);
  const [projectArchiveOpen, setProjectArchiveOpen] = useState(false);
  const [deletedItem, setDeletedItem] = useState<SparkItem | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<SparkItem | null>(null);
  const [openSwipeItemId, setOpenSwipeItemId] = useState<string | null>(null);
  const [cloudUser, setCloudUser] = useState<CloudUser | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(isSupabaseConfigured() ? "loading" : "not-configured");
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
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

  useEffect(() => {
    let frame = 0;
    const updateHeader = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const mobile = window.matchMedia("(max-width: 699px)").matches;
        setMobileHeaderCompact(mobile && window.scrollY > 28);
      });
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    window.addEventListener("resize", updateHeader);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateHeader);
      window.removeEventListener("resize", updateHeader);
    };
  }, []);

  const replaceData = useCallback((next: SparkData, scope?: "demo" | string) => {
    if (scope) dataScopeRef.current = scope;
    const normalized = normalizeDataIds(next);
    dataRef.current = normalized;
    const key = dataScopeRef.current === "demo"
      ? DEMO_DATA_KEY
      : cloudDataKey(dataScopeRef.current);
    try {
      window.localStorage.setItem(key, JSON.stringify(normalized));
    } catch (error) {
      console.error("Spark local cache write failed", error);
    }
    setData(normalized);
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
      if (projectEditor || projectArchiveOpen) return;
      if (isTypingTarget(event.target)) return;
      const standaloneShortcut = resolveStandaloneShortcut(event.key);
      if (event.key === "Escape") {
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
      if (
        standaloneShortcut === "new-task" &&
        !editingItem &&
        !projectEditor &&
        !helpOpen &&
        !syncDialogOpen &&
        !mobileNav
      ) {
        event.preventDefault();
        setQuickAddOpen(true);
        return;
      }
      const shortcutDisplayModes: Partial<Record<NonNullable<typeof standaloneShortcut>, ItemDisplayMode>> = {
        "display-notes": "note",
        "display-tasks": "task",
        "display-all": "all",
      };
      const shortcutDisplayMode = standaloneShortcut
        ? shortcutDisplayModes[standaloneShortcut]
        : undefined;
      if (shortcutDisplayMode) {
        event.preventDefault();
        setItemDisplayMode(shortcutDisplayMode);
        return;
      }
      const shortcutViews: Partial<Record<NonNullable<typeof standaloneShortcut>, View>> = {
        today: { type: "today" },
        upcoming: { type: "upcoming" },
        calendar: { type: "calendar", date: today },
        all: { type: "all" },
        important: { type: "important" },
        urgent: { type: "urgent" },
      };
      const shortcutView = standaloneShortcut ? shortcutViews[standaloneShortcut] : undefined;
      if (shortcutView) {
        event.preventDefault();
        setView(shortcutView);
        return;
      }
      const projectIndex = resolveProjectShortcut(event.key);
      if (projectIndex !== null) {
        const shortcutProjects = orderProjectsForSidebar(
          (dataRef.current?.projects ?? []).filter((project) => !project.archivedAt),
        );
        const project = shortcutProjects[projectIndex];
        if (!project) return;
        event.preventDefault();
        setView({ type: "project", projectId: project.id });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editingItem, helpOpen, mobileNav, projectEditor, projectArchiveOpen, syncDialogOpen, today]);

  const allProjects = data?.projects ?? [];
  const projects = data?.projects.filter((project) => !project.archivedAt) ?? [];
  const archivedProjects = allProjects.filter((project) => project.archivedAt);
  const openItems = useMemo(
    () => (data ? filterItems(data.items, view, today, data.projects) : []),
    [data, view, today],
  );
  const inactiveItems = useMemo(
    () => (data ? inactiveForView(data.items, view, today, data.projects) : []),
    [data, view, today],
  );
  const visibleOpenItems = useMemo(
    () => filterItemsByDisplayMode(openItems, itemDisplayMode),
    [itemDisplayMode, openItems],
  );
  const visibleInactiveItems = useMemo(
    () => filterItemsByDisplayMode(inactiveItems, itemDisplayMode),
    [inactiveItems, itemDisplayMode],
  );
  const overdue = view.type === "today" ? visibleOpenItems.filter((item) => item.dueDate! < today) : [];
  const current = view.type === "today"
    ? visibleOpenItems.filter((item) => item.dueDate === today || (item.type === "note" && !item.dueDate))
    : view.type === "all" ? [] : visibleOpenItems;
  const allTimeGroups = useMemo(
    () => view.type === "all" ? groupItemsByTime(visibleOpenItems, today) : [],
    [today, view.type, visibleOpenItems],
  );
  const activeProject = view.type === "project" ? allProjects.find((project) => project.id === view.projectId) : null;
  const taskCount = visibleOpenItems.filter((item) => item.type === "task").length;
  const noteCount = visibleOpenItems.filter((item) => item.type === "note").length;
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
    if (nextItem.projectId && !currentData.projects.some((project) => project.id === nextItem.projectId)) nextItem.projectId = null;
    replaceData({
      ...currentData,
      items: currentData.items.map((item) => (item.id === id ? nextItem : item)),
    });
    enqueueCloudMutation({
      id: createUuid(),
      kind: "upsert-item",
      item: nextItem,
    });
  };

  const addItem = (item: SparkItem) => {
    const currentData = dataRef.current;
    if (!currentData) return;
    const nextItem = { ...item, projectId: currentData.projects.some((project) => project.id === item.projectId && !project.archivedAt) ? item.projectId : null };
    replaceData({ ...currentData, items: [...currentData.items, nextItem] });
    enqueueCloudMutation({
      id: createUuid(),
      kind: "upsert-item",
      item: nextItem,
    });
  };

  const saveProject = (project: Project) => {
    const currentData = dataRef.current;
    if (!currentData) return;
    const exists = currentData.projects.some((entry) => entry.id === project.id);
    const nextProject = exists ? project : {
      ...project,
      position: Math.max(-1, ...currentData.projects.map((entry) => entry.position ?? 0)) + 1,
    };
    replaceData({
      ...currentData,
      projects: exists
        ? currentData.projects.map((entry) => entry.id === project.id ? nextProject : entry)
        : [...currentData.projects, nextProject],
    });
    enqueueCloudMutation({
      id: createUuid(),
      kind: "upsert-project",
      project: nextProject,
    });
  };

  const reorderProjects = (sourceId: string, targetId: string, placement: ProjectDropPlacement) => {
    const currentData = dataRef.current;
    if (!currentData) return;
    const nextProjects = reorderProjectsForDrop(currentData.projects, sourceId, targetId, placement);
    if (!nextProjects) return;
    replaceData({ ...currentData, projects: nextProjects });
    nextProjects.forEach((project) => enqueueCloudMutation({ id: createUuid(), kind: "upsert-project", project }));
  };

  const toggleProjectArchive = (project: Project) => {
    const latest = dataRef.current?.projects.find((entry) => entry.id === project.id);
    if (!latest) return;
    saveProject({ ...latest, archivedAt: latest.archivedAt ? null : new Date().toISOString() });
    setProjectEditor(null);
    setMobileNav(false);
    if (!latest.archivedAt && view.type === "project" && view.projectId === project.id) navigate({ type: "today" });
  };

  const removeProject = (project: Project) => {
    const currentData = dataRef.current;
    if (!currentData || !currentData.projects.some((entry) => entry.id === project.id)) return;
    replaceData(removeProjectFromData(currentData, project.id));
    // Undoing a previously deleted item must not resurrect a removed project link.
    setDeletedItem((item) => item?.projectId === project.id ? { ...item, projectId: null } : item);
    setEditingItem((item) => item?.projectId === project.id ? { ...item, projectId: null } : item);
    enqueueCloudMutation({ id: createUuid(), kind: "delete-project", projectId: project.id });
    setProjectEditor(null);
    setMobileNav(false);
    if (view.type === "project" && view.projectId === project.id) navigate({ type: "today" });
  };

  const openProjectArchive = () => {
    setMobileNav(false);
    setProjectArchiveOpen(true);
  };

  const toggleComplete = (item: SparkItem) => {
    if (item.type === "note") return;
    mutateItem(item.id, { completedAt: item.completedAt ? null : new Date().toISOString() });
  };

  const toggleNoteArchive = (item: SparkItem) => {
    if (item.type !== "note") return;
    mutateItem(item.id, { archivedAt: item.archivedAt ? null : new Date().toISOString() });
    setEditingItem(null);
    setOpenSwipeItemId(null);
  };

  const requestItemDelete = (item: SparkItem) => {
    setOpenSwipeItemId(null);
    setDeleteConfirmation(item);
  };

  const removeItem = (item: SparkItem) => {
    setDeleteConfirmation(null);
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
      id: createUuid(),
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
      id: createUuid(),
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
        onReorderProjects={reorderProjects}
        onSync={() => setSyncDialogOpen(true)}
        onToggle={() => setSidebarCompact((value) => !value)}
        projects={projects}
        archivedProjects={archivedProjects}
        onOpenProjectArchive={openProjectArchive}
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
              onReorderProjects={reorderProjects}
              onSync={() => setSyncDialogOpen(true)}
              onToggle={() => setMobileNav(false)}
              projects={projects}
              archivedProjects={archivedProjects}
              onOpenProjectArchive={openProjectArchive}
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
        <section className="canvas" aria-labelledby="view-title">
          <div className={`view-header ${mobileHeaderCompact ? "mobile-compact" : ""}`}>
            <span
              className="view-project-band"
              style={{ background: activeProject?.color ?? "var(--turquoise)" }}
              aria-hidden="true"
            />
            <div>
              {(headerContext || (view.type === "project" && activeProject)) && <div className={`eyebrow ${view.type === "project" ? "project-eyebrow" : ""}`}>
                {view.type === "project" && activeProject ? (activeProject.archivedAt ? "Dự án đã lưu trữ" : "Dự án") : headerContext}
              </div>}
              <div className="view-title-row">
                <button
                  className="mobile-header-drawer"
                  type="button"
                  onClick={() => setMobileNav(true)}
                  aria-label="Mở sidebar"
                >
                  <Icon name="sidebar-open" size={28} />
                </button>
                <h1 id="view-title" tabIndex={-1}>{title}</h1>
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
              <p>{taskCount} việc cần xử lý <span aria-hidden="true">|</span> {overdueCount} quá hạn <span aria-hidden="true">|</span> {noteCount} ghi chú</p>
            </div>
            <div className="view-actions">
              <button
                className={`sync-header-status ${syncStatus}`}
                type="button"
                onClick={() => setSyncDialogOpen(true)}
                aria-label={`${syncStatusShortLabel(syncStatus)}. ${syncStatusDetail(syncStatus)}`}
              >
                <span aria-hidden="true" />
                {syncStatusShortLabel(syncStatus)}
              </button>
              <ItemDisplaySwitcher
                mode={itemDisplayMode}
                onChange={setItemDisplayMode}
              />
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
                projects={allProjects}
                today={today}
                hideTodayDue={view.type === "today"}
                onArchive={toggleNoteArchive}
                onComplete={toggleComplete}
                onDelete={requestItemDelete}
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
                projects={allProjects}
                today={today}
                hideTodayDue={view.type === "today"}
                onArchive={toggleNoteArchive}
                onComplete={toggleComplete}
                onDelete={requestItemDelete}
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
                projects={allProjects}
                today={today}
                hideTodayDue={group.key === "today"}
                onArchive={toggleNoteArchive}
                onComplete={toggleComplete}
                onDelete={requestItemDelete}
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

            {visibleInactiveItems.length > 0 && (
              <div className="completed-section">
                <button className="completed-toggle" onClick={() => setCompletedOpen((value) => !value)}>
                  <Icon name="chevron" className={completedOpen ? "rotate-down" : ""} size={17} />
                  {visibleInactiveItems.some((item) => item.type === "task") && visibleInactiveItems.some((item) => item.type === "note")
                    ? "Đã hoàn thành & lưu trữ"
                    : visibleInactiveItems[0]?.type === "note" ? "Đã lưu trữ" : "Đã hoàn thành"}
                  <span>{visibleInactiveItems.length}</span>
                </button>
                {completedOpen && (
                  <ItemGroup
                    items={visibleInactiveItems}
                    projects={allProjects}
                    today={today}
                    hideTodayDue={view.type === "today"}
                    onArchive={toggleNoteArchive}
                    onComplete={toggleComplete}
                    onDelete={requestItemDelete}
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
      </main>

      <div className="mobile-floating-controls">
        <ItemDisplaySwitcher
          mode={itemDisplayMode}
          onChange={setItemDisplayMode}
          mobile
        />
        <button
          className={`mobile-sync-status ${syncStatus}`}
          type="button"
          onClick={() => setSyncDialogOpen(true)}
          aria-label={`${syncStatusShortLabel(syncStatus)}. ${syncStatusDetail(syncStatus)}`}
        >
          <span aria-hidden="true" />
          {syncStatusShortLabel(syncStatus)}
        </button>
      </div>

      <MobileDock
        currentView={view}
        onAdd={() => setQuickAddOpen(true)}
        onNavigate={navigate}
        today={today}
      />

      {editingItem && (
        <ItemEditor
          item={editingItem}
          projects={allProjects}
          onArchive={() => toggleNoteArchive(editingItem)}
          onClose={() => setEditingItem(null)}
          onDelete={() => requestItemDelete(editingItem)}
          onSave={(update) => {
            mutateItem(editingItem.id, update);
            setEditingItem((current) => current?.id === editingItem.id ? { ...current, ...update } : current);
          }}
        />
      )}
      {projectEditor && (
        <ProjectEditor
          key={projectEditor === "new" ? "new" : projectEditor.id}
          project={projectEditor === "new" ? null : projectEditor}
          itemCount={projectEditor === "new" ? 0 : data.items.filter((item) => item.projectId === projectEditor.id).length}
          onArchive={() => { if (projectEditor !== "new") toggleProjectArchive(projectEditor); }}
          onDelete={() => { if (projectEditor !== "new") removeProject(projectEditor); }}
          onClose={() => setProjectEditor(null)}
          onSave={(project) => {
            const latest = dataRef.current?.projects.find((entry) => entry.id === project.id);
            if (projectEditor === "new") saveProject(project);
            else if (latest) saveProject({ ...latest, name: project.name, color: project.color, isStarred: project.isStarred });
            setProjectEditor(null);
          }}
        />
      )}
      {deleteConfirmation && (
        <div className="dialog-backdrop confirm-delete-backdrop" onClick={() => setDeleteConfirmation(null)}>
          <section className="editor-sheet confirm-delete-sheet" role="alertdialog" aria-modal="true" aria-labelledby="confirm-item-delete-title" onClick={(event) => event.stopPropagation()}>
            <div className="editor-header"><div><span>Xác nhận</span><h2 id="confirm-item-delete-title">Xóa mục này?</h2></div><button type="button" className="icon-button" onClick={() => setDeleteConfirmation(null)} aria-label="Đóng"><Icon name="close" /></button></div>
            <p>“{deleteConfirmation.title}” sẽ bị xóa. Bạn vẫn có thể Hoàn tác ngay sau đó.</p>
            <div className="editor-actions"><button type="button" className="text-button" onClick={() => setDeleteConfirmation(null)}>Giữ lại</button><button type="button" className="delete-button" onClick={() => removeItem(deleteConfirmation)}><Icon name="trash" size={17} /> Xóa</button></div>
          </section>
        </div>
      )}
      {projectArchiveOpen && (
        <ArchivedProjects
          projects={archivedProjects}
          onClose={() => setProjectArchiveOpen(false)}
          onView={(project) => { setProjectArchiveOpen(false); navigate({ type: "project", projectId: project.id }); }}
          onEdit={(project) => { setProjectArchiveOpen(false); setProjectEditor(project); }}
        />
      )}
      {helpOpen && <ShortcutHelp onClose={() => setHelpOpen(false)} />}
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
      {deletedItem && (
        <div className="toast" role="status"><span>Đã xóa “{deletedItem.title}”</span><button onClick={undoDelete}>Hoàn tác</button></div>
      )}
    </div>
  );
}

function ItemDisplaySwitcher({
  mode,
  mobile = false,
  onChange,
}: {
  mode: ItemDisplayMode;
  mobile?: boolean;
  onChange: (mode: ItemDisplayMode) => void;
}) {
  const entries = [
    { mode: "all" as const, label: "Hiển thị tất cả", shortcut: "\\", icon: "layers" as const },
    { mode: "note" as const, label: "Chỉ hiển thị note", shortcut: "-", icon: "note" as const },
    { mode: "task" as const, label: "Chỉ hiển thị task", shortcut: "=", icon: "task" as const },
  ];

  return (
    <div
      className={`item-display-switcher ${mobile ? "mobile" : ""}`}
      role="group"
      aria-label="Lọc loại nội dung"
    >
      {entries.map((entry) => (
        <button
          type="button"
          className={mode === entry.mode ? "selected" : ""}
          onClick={() => onChange(entry.mode)}
          aria-label={entry.label}
          aria-pressed={mode === entry.mode}
          title={`${entry.label} (${entry.shortcut})`}
          key={entry.mode}
        >
          <Icon name={entry.icon} size={18} />
        </button>
      ))}
    </div>
  );
}

function MobileDock({
  currentView,
  onAdd,
  onNavigate,
  today,
}: {
  currentView: View;
  onAdd: () => void;
  onNavigate: (view: View) => void;
  today: string;
}) {
  const entries = [
    { label: "Hôm nay", icon: "sun" as const, view: { type: "today" } as View },
    { label: "Sắp tới", icon: "clock" as const, view: { type: "upcoming" } as View },
    { label: "Theo ngày", icon: "calendar" as const, view: { type: "calendar", date: today } as View },
    { label: "Tất cả", icon: "list" as const, view: { type: "all" } as View },
  ];
  const isActive = (candidate: View) => candidate.type === currentView.type;

  return (
    <nav className="mobile-dock" aria-label="Điều hướng mobile">
      {entries.slice(0, 2).map((entry) => (
        <button
          type="button"
          className={isActive(entry.view) ? "active" : ""}
          onClick={() => onNavigate(entry.view)}
          aria-label={entry.label}
          aria-current={isActive(entry.view) ? "page" : undefined}
          key={entry.label}
        >
          <Icon name={entry.icon} size={27} />
        </button>
      ))}
      <button className="mobile-dock-add" type="button" onClick={onAdd} aria-label="Thêm công việc">
        <span><Icon name="plus" size={31} /></span>
      </button>
      {entries.slice(2).map((entry) => (
        <button
          type="button"
          className={isActive(entry.view) ? "active" : ""}
          onClick={() => onNavigate(entry.view)}
          aria-label={entry.label}
          aria-current={isActive(entry.view) ? "page" : undefined}
          key={entry.label}
        >
          <Icon name={entry.icon} size={27} />
        </button>
      ))}
    </nav>
  );
}

function Sidebar({
  archivedProjects,
  onOpenProjectArchive,
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
  onReorderProjects,
  onToggle,
  projects,
  projectsOpen,
  syncStatus,
  today,
}: {
  archivedProjects: Project[];
  onOpenProjectArchive: () => void;
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
  onReorderProjects: (sourceId: string, targetId: string, placement: ProjectDropPlacement) => void;
  onToggle: () => void;
  projects: Project[];
  projectsOpen: boolean;
  syncStatus: SyncStatus;
  today: string;
}) {
  const [draggingProjectId, setDraggingProjectId] = useState<string | null>(null);
  const [projectDropTarget, setProjectDropTarget] = useState<{ id: string; placement: ProjectDropPlacement } | null>(null);
  const navItems = [
    { view: { type: "today" } as View, label: "Hôm nay", icon: "sun" as const, count: filterItems(items, { type: "today" }, today, archivedProjects).length },
    { view: { type: "upcoming" } as View, label: "Sắp tới", icon: "clock" as const, count: filterItems(items, { type: "upcoming" }, today, archivedProjects).length },
    { view: { type: "calendar", date: today } as View, label: "Theo ngày", icon: "calendar" as const },
    { view: { type: "all" } as View, label: "Tất cả", icon: "list" as const, count: filterItems(items, { type: "all" }, today, archivedProjects).length },
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
    const tooltip = shortcutNumber >= 1 && shortcutNumber <= 9 ? `${shortcutNumber} · ${project.name}` : project.name;
    return (
      <div
        className={`project-nav-row ${!mobile && !compact ? "is-draggable" : ""} ${draggingProjectId === project.id ? "is-dragging" : ""} ${projectDropTarget?.id === project.id ? `drop-${projectDropTarget.placement}` : ""}`}
        draggable={!mobile && !compact}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/x-spark-project", project.id);
          setDraggingProjectId(project.id);
          setProjectDropTarget(null);
        }}
        onDragOver={(event) => {
          if (mobile || compact || !event.dataTransfer.types.includes("text/x-spark-project")) return;
          const sourceProject = projects.find((entry) => entry.id === draggingProjectId);
          if (!sourceProject || sourceProject.id === project.id || sourceProject.isStarred !== project.isStarred) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          const bounds = event.currentTarget.getBoundingClientRect();
          const placement = event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";
          setProjectDropTarget((current) => current?.id === project.id && current.placement === placement ? current : { id: project.id, placement });
        }}
        onDragLeave={(event) => {
          const nextTarget = event.relatedTarget;
          if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;
          setProjectDropTarget((current) => current?.id === project.id ? null : current);
        }}
        onDrop={(event) => {
          event.preventDefault();
          const sourceId = event.dataTransfer.getData("text/x-spark-project");
          const placement = projectDropTarget?.id === project.id ? projectDropTarget.placement : "before";
          setDraggingProjectId(null);
          setProjectDropTarget(null);
          if (sourceId) onReorderProjects(sourceId, project.id, placement);
        }}
        onDragEnd={() => {
          setDraggingProjectId(null);
          setProjectDropTarget(null);
        }}
        key={project.id}
      >
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
        {!mobile && <div className="nav-section">
          {navItems.map((entry) => (
            <button key={entry.label} className={`nav-item ${isActive(entry.view) ? "active" : ""}`} onClick={() => onNavigate(entry.view)} aria-label={entry.label} title={compact ? undefined : entry.label} data-tooltip={compact ? entry.label : undefined}>
              <Icon name={entry.icon} /><span className="nav-text">{entry.label}</span>{entry.count !== undefined && <span className="nav-count">{entry.count}</span>}
            </button>
          ))}
        </div>}
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
          <button className="nav-item archived-projects-nav" onClick={onOpenProjectArchive} aria-label="Dự án đã lưu trữ" data-tooltip={compact ? "Dự án đã lưu trữ" : undefined}>
            <Icon name="archive" /><span className="nav-text">Đã lưu trữ</span>{archivedProjects.length > 0 && <span className="nav-count">{archivedProjects.length}</span>}
          </button>
        </div>
      </nav>
      <div className="sidebar-footer">
        {!mobile && <button className="sidebar-toggle" onClick={onToggle} aria-label={compact ? "Mở rộng sidebar" : "Thu gọn sidebar"} title={compact ? undefined : "Thu gọn sidebar"} data-tooltip={compact ? "Mở rộng sidebar" : undefined}><Icon name={compact ? "sidebar-open" : "sidebar-collapse"} size={20} /></button>}
        <button className="nav-item" onClick={onHelp} aria-label="Phím tắt" data-tooltip={compact ? "Phím tắt" : undefined}><Icon name="help" /><span className="nav-text">Phím tắt</span><kbd className="nav-kbd">?</kbd></button>
        {!mobile && <button className="local-mode-card" onClick={onSync} aria-label={syncStatusTitle(syncStatus)} data-tooltip={compact ? syncStatusTitle(syncStatus) : undefined}>
          <span className={`local-mode-icon ${syncStatus}`}><Icon name={syncStatus === "error" || syncStatus === "offline" ? "zap" : "check"} size={15} /></span>
          <span>
            <strong>{syncStatusTitle(syncStatus)}</strong>
            <small>{syncStatusDetail(syncStatus)}</small>
          </span>
        </button>}
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
  onArchive,
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
  onArchive: (item: SparkItem) => void;
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
              openSwipeItemId={openSwipeItemId}
              key={item.id}
              onArchive={onArchive}
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

const SWIPE_ACTIONS_WIDTH = 144;

function SwipeableItemRow({
  item,
  project,
  overdue,
  hideDue,
  openSwipeItemId,
  onArchive,
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
  openSwipeItemId: string | null;
  onArchive: (item: SparkItem) => void;
  onComplete: (item: SparkItem) => void;
  onDelete: (item: SparkItem) => void;
  onEdit: (item: SparkItem) => void;
  onFlag: (id: string, update: Partial<SparkItem>) => void;
  onSwipeOpenChange: (id: string | null) => void;
  today: string;
}) {
  const isSwipeOpen = openSwipeItemId === item.id;
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const gestureRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    wasOpen: boolean;
    axis: "pending" | "horizontal" | "vertical";
  } | null>(null);
  const clickGuardRef = useRef(createItemClickGuard());
  const offset = dragOffset ?? (isSwipeOpen ? -SWIPE_ACTIONS_WIDTH : 0);

  const closeActions = () => onSwipeOpenChange(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    clickGuardRef.current.beginPointer();
    if (
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
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;

    if (gesture.axis === "pending" && Math.max(Math.abs(deltaX), Math.abs(deltaY)) >= 8) {
      gesture.axis = Math.abs(deltaX) > Math.abs(deltaY) * 1.15 ? "horizontal" : "vertical";
      clickGuardRef.current.blockPointerClick();
      if (gesture.axis === "horizontal") {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }
    if (gesture.axis !== "horizontal") return;

    event.preventDefault();
    const base = gesture.wasOpen ? -SWIPE_ACTIONS_WIDTH : 0;
    const minimum = -SWIPE_ACTIONS_WIDTH - 12;
    const maximum = 0;
    setDragOffset(Math.max(minimum, Math.min(maximum, base + deltaX)));
  };

  const finishPointerGesture = (event: ReactPointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    gestureRef.current = null;
    setDragOffset(null);
    // A tap must retain the global tray state until onClick decides whether
    // to dismiss it, including when the tap lands on a different item.
    if (gesture.axis !== "horizontal") return;
    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    const result = resolveItemSwipe(deltaX, deltaY, gesture.wasOpen);
    if (result === "open-actions") onSwipeOpenChange(item.id);
    else onSwipeOpenChange(null);
  };

  const cancelPointerGesture = (event: ReactPointerEvent<HTMLElement>) => {
    if (gestureRef.current?.pointerId !== event.pointerId) return;
    gestureRef.current = null;
    clickGuardRef.current.blockPointerClick();
    setDragOffset(null);
  };

  return (
    <div className={`swipe-row ${isSwipeOpen ? "is-open" : ""} ${dragOffset !== null ? "is-dragging" : ""}`}>
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
          className={`swipe-action ${item.type === "note" ? "archive" : "delete"}`}
          type="button"
          tabIndex={isSwipeOpen ? 0 : -1}
          onClick={() => item.type === "note" ? onArchive(item) : onDelete(item)}
          aria-label={item.type === "note"
            ? `${item.archivedAt ? "Khôi phục" : "Lưu trữ"} ${item.title}`
            : `Xóa ${item.title}`}
        >
          <Icon name={item.type === "note" ? "archive" : "trash"} size={19} />
        </button>
      </div>

      <article
        className={`item-row ${item.completedAt ? "is-complete" : ""} ${item.archivedAt ? "is-archived" : ""}`}
        style={{ "--swipe-offset": `${offset}px` } as CSSProperties}
        onClickCapture={(event) => {
          if (!clickGuardRef.current.shouldSuppressClick(event.detail)) return;
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
        ) : (
          <button
            className="note-bullet"
            type="button"
            onClick={() => onArchive(item)}
            aria-label={`${item.archivedAt ? "Khôi phục" : "Lưu trữ"}: ${item.title}`}
            title={item.archivedAt ? "Khôi phục ghi chú" : "Lưu trữ ghi chú"}
          >
            {item.archivedAt
              ? <Icon name="archive" size={15} />
              : <span className="note-mark" aria-hidden="true" />}
          </button>
        )}
        {project ? <span className="project-dot item-project-dot" style={{ background: project.color }} title={project.name} /> : <span className="project-dot-spacer" />}
        <button className="item-main" onClick={() => {
          const action = resolveItemContentTap(
            openSwipeItemId,
            window.matchMedia("(max-width: 699px)").matches,
          );
          closeActions();
          if (action === "open-details") onEdit(item);
        }}>
          <span className="item-title-wrap">
            <span className="item-title">{item.title}</span>
            {item.description && (
              <span className="item-description-indicator" aria-label="Có nội dung" title="Có nội dung">
                <Icon name="description" size={15} />
              </span>
            )}
          </span>
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
  const [description, setDescription] = useState("");
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [date, setDate] = useState(view.type === "today" ? today : view.type === "calendar" ? view.date : "");
  const [projectId, setProjectId] = useState(view.type === "project" && projects.some((project) => project.id === view.projectId) ? view.projectId : "");
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    onExpandedChange(false);
    setTitle("");
    setDescription("");
    setDescriptionOpen(false);
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
      id: createUuid(),
      type,
      title: title.trim(),
      description: description.trim() || null,
      dueDate: date || null,
      projectId: projectId || null,
      completedAt: null,
      archivedAt: null,
      isImportant: false,
      isUrgent: false,
      createdAt: new Date().toISOString(),
    });
    setTitle("");
    setDescription("");
    setDescriptionOpen(false);
    setType("task");
    inputRef.current?.focus();
  };

  if (!expanded) {
    return (
      <button
        ref={triggerRef}
        className="quick-add-trigger"
        onClick={() => { setType("task"); setDescriptionOpen(false); onExpandedChange(true); }}
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
            <span id="quick-add-title">{type === "task" ? "Tên công việc" : "Tên ghi chú"}</span>
            <input ref={inputRef} autoFocus maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={type === "task" ? "Bạn muốn hoàn thành điều gì?" : "Đặt tên ghi chú…"} aria-label="Tên mục" />
          </label>
          <div className="quick-add-entry-actions">
            <label className="note-toggle"><input type="checkbox" checked={type === "note"} onChange={(event) => {
              const nextType = event.target.checked ? "note" : "task";
              setType(nextType);
            }} />Ghi chú</label>
            <button
              className="quick-description-toggle"
              type="button"
              aria-expanded={descriptionOpen}
              onClick={() => setDescriptionOpen((value) => !value)}
            >
              <Icon name="description" size={16} />
              {descriptionOpen ? "Ẩn Nội dung" : "Thêm Nội dung"}
            </button>
          </div>
        </div>
        {descriptionOpen && (
          <label className="quick-description-field">
            <span>Nội dung (nếu cần)</span>
            <textarea
              maxLength={2000}
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Bổ sung nội dung chi tiết…"
            />
          </label>
        )}
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

function ItemEditor({ item, projects, onArchive, onClose, onDelete, onSave }: { item: SparkItem; projects: Project[]; onArchive: () => void; onClose: () => void; onDelete: () => void; onSave: (update: Partial<SparkItem>) => void }) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [dueDate, setDueDate] = useState(item.dueDate ?? "");
  const [projectId, setProjectId] = useState(item.projectId ?? "");
  const [important, setImportant] = useState(item.isImportant);
  const [urgent, setUrgent] = useState(item.isUrgent);
  const [editingField, setEditingField] = useState<"title" | "content" | null>(null);
  const project = projects.find((entry) => entry.id === projectId);

  const saveTitle = () => {
    const value = title.trim();
    if (!value) return;
    setTitle(value);
    onSave({ title: value });
    setEditingField(null);
  };

  const saveContent = () => {
    const value = description.trim();
    setDescription(value);
    onSave({ description: value || null });
    setEditingField(null);
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <section className="editor-sheet item-detail-sheet" role="dialog" aria-modal="true" aria-labelledby="item-detail-title" onClick={(event) => event.stopPropagation()}>
        <div className="editor-header"><div><span>{item.type === "task" ? "Task" : "Ghi chú"}</span><h2 id="item-detail-title">{item.type === "task" ? "Chi tiết task" : "Chi tiết ghi chú"}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Đóng"><Icon name="close" /></button></div>

        <div className="detail-content">
          <section className={`detail-text-block ${editingField === "title" ? "editing" : ""}`}>
            <span className="detail-label">Tên</span>
            {editingField === "title" ? (
              <div className="detail-inline-editor">
                <input autoFocus maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => {
                  if (event.key === "Enter") { event.preventDefault(); saveTitle(); }
                  if (event.key === "Escape") { setTitle(item.title); setEditingField(null); }
                }} aria-label={item.type === "task" ? "Tên task" : "Tên ghi chú"} />
                <button type="button" className="detail-icon-action save" onClick={saveTitle} aria-label="Lưu"><Icon name="check" size={18} /></button>
                <button type="button" className="detail-icon-action" onClick={() => { setTitle(item.title); setEditingField(null); }} aria-label="Hủy"><Icon name="close" size={18} /></button>
              </div>
            ) : (
              <div className="detail-read-row">
                <p>{title}</p>
                <button type="button" className="detail-icon-action edit" onClick={() => setEditingField("title")} aria-label="Sửa tên"><Icon name="edit" size={17} /></button>
              </div>
            )}
          </section>

          <section className={`detail-text-block detail-description ${editingField === "content" ? "editing" : ""}`}>
              <span className="detail-label">Nội dung</span>
              {editingField === "content" ? (
                <div className="detail-inline-editor align-start">
                  <textarea autoFocus maxLength={2000} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} onKeyDown={(event) => {
                    if (event.key === "Escape") { setDescription(item.description ?? ""); setEditingField(null); }
                  }} placeholder="Nội dung chi tiết (nếu cần)" aria-label={item.type === "task" ? "Nội dung task" : "Nội dung ghi chú"} />
                  <button type="button" className="detail-icon-action save" onClick={saveContent} aria-label="Lưu Nội dung"><Icon name="check" size={18} /></button>
                  <button type="button" className="detail-icon-action" onClick={() => { setDescription(item.description ?? ""); setEditingField(null); }} aria-label="Hủy"><Icon name="close" size={18} /></button>
                </div>
              ) : (
                <div className="detail-read-row align-start">
                  <p className={description ? "" : "empty"}>{description ? <LinkifiedText value={description} /> : "Chưa có nội dung"}</p>
                  <button type="button" className="detail-icon-action edit" onClick={() => setEditingField("content")} aria-label="Sửa Nội dung"><Icon name="edit" size={17} /></button>
                </div>
              )}
          </section>
        </div>

        <div className="detail-metadata" aria-label="Thông tin mục">
          <button type="button" className={`detail-meta-button icon-only important ${important ? "selected" : ""}`} title="Quan Trọng" aria-label="Quan Trọng" aria-pressed={important} onClick={() => { const value = !important; setImportant(value); onSave({ isImportant: value }); }}><Icon name="star" size={17} /></button>
          <button type="button" className={`detail-meta-button icon-only urgent ${urgent ? "selected" : ""}`} title="Ưu tiên" aria-label="Ưu tiên" aria-pressed={urgent} onClick={() => { const value = !urgent; setUrgent(value); onSave({ isUrgent: value }); }}><Icon name="zap" size={17} /></button>
          <label className="detail-meta-control" title="Ngày">
            <Icon name="calendar" size={16} />
            <input type="date" value={dueDate} aria-label="Ngày" onChange={(event) => { const value = event.target.value; setDueDate(value); onSave({ dueDate: value || null }); }} />
          </label>
          <label className="detail-meta-control project" title="Dự án">
            <span className={`project-dot ${project ? "" : "empty"}`} style={project ? { background: project.color } : undefined} />
            <select value={project?.id ?? ""} aria-label="Dự án" onChange={(event) => { const value = event.target.value; setProjectId(value); onSave({ projectId: value || null }); }}><option value="">Không có dự án</option>{projects.filter((entry) => !entry.archivedAt || entry.id === projectId).map((entry) => <option key={entry.id} value={entry.id} disabled={Boolean(entry.archivedAt)}>{entry.name}{entry.archivedAt ? " (đã lưu trữ)" : ""}</option>)}</select>
          </label>
          <div className="detail-item-actions">
            {item.type === "note" && <button type="button" className="detail-meta-button archive" onClick={onArchive} aria-label={item.archivedAt ? "Khôi phục ghi chú" : "Lưu trữ ghi chú"} title={item.archivedAt ? "Khôi phục" : "Lưu trữ"}><Icon name="archive" size={18} /><span className="detail-meta-label">{item.archivedAt ? "Khôi phục" : "Lưu trữ"}</span></button>}
            <span className="detail-meta-danger-separator" aria-hidden="true" />
            <button type="button" className="detail-meta-button delete" onClick={onDelete} aria-label="Xóa mục" title="Xóa"><Icon name="trash" size={18} /><span className="detail-meta-label">Xóa</span></button>
          </div>
        </div>
      </section>
    </div>
  );
}

function useProjectDialog(onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const [previous] = useState(() => typeof document !== "undefined" && document.activeElement instanceof HTMLElement ? document.activeElement : null);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const dialog = dialogRef.current;
    const controls = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), [tabindex="0"]') ?? []);
    if (!dialog?.contains(document.activeElement)) (dialog?.querySelector<HTMLInputElement>('input:not([disabled])') ?? controls()[0])?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeRef.current();
      } else if (event.key === "Tab") {
        const focusable = controls();
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", handleKey, true);
    return () => {
      window.removeEventListener("keydown", handleKey, true);
      if (previous?.isConnected) previous.focus();
      else document.getElementById("view-title")?.focus();
    };
  }, [previous]);
  return dialogRef;
}

function ArchivedProjects({ projects, onClose, onView, onEdit }: {
  projects: Project[];
  onClose: () => void;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
}) {
  const dialogRef = useProjectDialog(onClose);
  return (
    <div ref={dialogRef} className="dialog-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="project-archive-title">
      <section className="editor-sheet compact-editor project-archive-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="editor-header"><div><span>Dự án</span><h2 id="project-archive-title">Đã lưu trữ</h2></div><button className="icon-button" onClick={onClose} aria-label="Đóng"><Icon name="close" /></button></div>
        <p className="project-lifecycle-hint">Task và note vẫn được giữ nguyên. Mở dự án để xem, hoặc chỉnh sửa để khôi phục.</p>
        {projects.length === 0 ? <p className="project-archive-empty">Chưa có dự án được lưu trữ.</p> : (
          <div className="project-archive-list">
            {projects.map((project) => <div className="project-archive-row" key={project.id}>
              <button className="project-archive-name" onClick={() => onView(project)} aria-label={`Xem dự án ${project.name}`}><span className="project-dot" style={{ background: project.color }} /><span>{project.name}</span></button>
              <button className="detail-icon-action" onClick={() => onEdit(project)} aria-label={`Chỉnh sửa dự án ${project.name}`}><Icon name="edit" size={18} /></button>
            </div>)}
          </div>
        )}
      </section>
    </div>
  );
}

function ProjectEditor({ project, itemCount, onArchive, onDelete, onClose, onSave }: {
  project: Project | null;
  itemCount: number;
  onArchive: () => void;
  onDelete: () => void;
  onClose: () => void;
  onSave: (project: Project) => void;
}) {
  const [name, setName] = useState(project?.name ?? "");
  const [color, setColor] = useState(project?.color ?? projectColors[0]);
  const [isStarred, setIsStarred] = useState(project?.isStarred ?? false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const usesCustomColor = !projectColors.some((entry) => entry.toLowerCase() === color.toLowerCase());
  const customPickerValue = /^#[0-9a-f]{6}$/i.test(color) ? color : projectColors[0];
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useProjectDialog(onClose);
  useEffect(() => {
    if (project || confirmDelete || !window.matchMedia("(max-width: 699px)").matches) return;
    const input = nameInputRef.current;
    const backdrop = dialogRef.current;
    const visualViewport = window.visualViewport;
    if (!input || !backdrop) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const revealNameInput = () => {
      input.focus({ preventScroll: true });
      window.requestAnimationFrame(() => input.scrollIntoView({ block: "center", inline: "nearest" }));
    };
    const fitToKeyboard = () => {
      if (!visualViewport) return;
      backdrop.style.top = `${visualViewport.offsetTop}px`;
      backdrop.style.bottom = "auto";
      backdrop.style.height = `${visualViewport.height}px`;
      window.requestAnimationFrame(() => input.scrollIntoView({ block: "center", inline: "nearest" }));
    };

    const focusFrame = window.requestAnimationFrame(revealNameInput);
    const keyboardTimer = window.setTimeout(() => {
      fitToKeyboard();
      revealNameInput();
    }, 280);
    visualViewport?.addEventListener("resize", fitToKeyboard);
    visualViewport?.addEventListener("scroll", fitToKeyboard);
    return () => {
      document.body.style.overflow = previousOverflow;
      backdrop.style.top = "";
      backdrop.style.bottom = "";
      backdrop.style.height = "";
      window.cancelAnimationFrame(focusFrame);
      window.clearTimeout(keyboardTimer);
      visualViewport?.removeEventListener("resize", fitToKeyboard);
      visualViewport?.removeEventListener("scroll", fitToKeyboard);
    };
  }, [confirmDelete, dialogRef, project]);
  return (
    <div ref={dialogRef} className="dialog-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="project-editor-title">
      {confirmDelete && project ? (
        <section className="editor-sheet compact-editor" onClick={(event) => event.stopPropagation()}>
          <div className="editor-header"><div><span>Dự án</span><h2 id="project-editor-title">Xóa dự án này?</h2></div><button className="icon-button" onClick={onClose} aria-label="Đóng"><Icon name="close" /></button></div>
          <p className="project-delete-description">“{project.name}” sẽ bị xóa và không thể hoàn tác.</p>
          <p className="project-lifecycle-hint">{itemCount > 0 ? `${itemCount} task/note bên trong (kể cả mục đã hoàn thành hoặc lưu trữ) vẫn được giữ nguyên và chuyển sang Không có dự án.` : "Không có task/note nào trong dự án này."}</p>
          <div className="editor-actions"><button autoFocus className="text-button" onClick={() => setConfirmDelete(false)}>Giữ lại</button><button className="delete-button" onClick={onDelete}><Icon name="trash" size={17} /> Xóa dự án</button></div>
        </section>
      ) : (
      <form className="editor-sheet compact-editor" onClick={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); if (name.trim()) onSave(project ? { ...project, name: name.trim(), color, isStarred } : { id: createUuid(), name: name.trim(), color, isStarred, archivedAt: null }); }}>
        <div className="editor-header"><div><span>{project?.archivedAt ? "Đã lưu trữ" : "Dự án"}</span><h2 id="project-editor-title">{project ? "Chỉnh sửa dự án" : "Tạo dự án mới"}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Đóng"><Icon name="close" /></button></div>
        <label className="field"><span>Tên dự án</span><input ref={nameInputRef} autoFocus maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Ra mắt website" /></label>
        <fieldset className="color-picker">
          <legend>Màu nhận diện</legend>
          <div className="color-picker-options">
            <button
              type="button"
              className={`project-star-option ${isStarred ? "selected" : ""}`}
              onClick={() => setIsStarred((value) => !value)}
              aria-label={isStarred ? "Bỏ khỏi Cần lưu ý" : "Đưa vào Cần lưu ý"}
              title={isStarred ? "Bỏ khỏi Cần lưu ý" : "Đưa vào Cần lưu ý"}
            >
              <Icon name="star" size={17} />
            </button>
            {projectColors.map((entry) => <button type="button" aria-label={`Chọn màu ${entry}`} className={color.toLowerCase() === entry.toLowerCase() ? "selected" : ""} style={{ background: entry }} key={entry} onClick={() => setColor(entry)} />)}
            <label className={`custom-color-option ${usesCustomColor ? "selected" : ""}`} style={{ "--custom-project-color": customPickerValue } as CSSProperties} title="Chọn màu tùy ý">
              <input type="color" value={customPickerValue} onChange={(event) => setColor(event.target.value)} aria-label="Chọn màu tùy ý" />
              <span aria-hidden="true" />
            </label>
          </div>
        </fieldset>
        {project && <div className="project-lifecycle">
          <p className="project-lifecycle-hint">{project.archivedAt ? "Khôi phục để đưa dự án trở lại sidebar và bộ chọn dự án." : "Lưu trữ để thu gọn sidebar. Task và note vẫn được giữ nguyên."}</p>
          <div className="project-lifecycle-actions">
            <button type="button" className="archive-button" onClick={onArchive}><Icon name="archive" size={17} />{project.archivedAt ? "Khôi phục dự án" : "Lưu trữ dự án"}</button>
            <button type="button" className="delete-button" onClick={() => setConfirmDelete(true)}><Icon name="trash" size={17} />Xóa dự án</button>
          </div>
        </div>}
        <div className="editor-actions"><button type="button" className="text-button" onClick={onClose}>Hủy</button><button className="primary-button" disabled={!name.trim()}>{project ? "Lưu thay đổi" : "Tạo dự án"}</button></div>
      </form>
      )}
    </div>
  );
}

function ShortcutHelp({ onClose }: { onClose: () => void }) {
  const navigation = [["T", "Hôm nay"], ["S", "Sắp tới"], ["D", "Theo ngày"], ["A", "Tất cả"]];
  const focus = [["I", "Quan Trọng"], ["U", "Ưu tiên"]];
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="shortcut-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcut-title" onClick={(event) => event.stopPropagation()}>
        <div className="editor-header">
          <div><span>Đi nhanh hơn</span><h2 id="shortcut-title">Phím tắt</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Đóng bảng phím tắt"><Icon name="close" /></button>
        </div>
        <div className="shortcut-columns">
          <section className="shortcut-group" aria-labelledby="shortcut-navigation">
            <h3 id="shortcut-navigation">Điều hướng</h3>
            {navigation.map(([key, label]) => <div key={key}><kbd>{key}</kbd><span>{label}</span></div>)}
          </section>
          <section className="shortcut-group" aria-labelledby="shortcut-focus">
            <h3 id="shortcut-focus">Tập trung</h3>
            {focus.map(([key, label]) => <div key={key}><kbd>{key}</kbd><span>{label}</span></div>)}
            <div><kbd>1–9</kbd><span>Dự án theo thứ tự</span></div>
          </section>
        </div>
        <div className="shortcut-footer">
          <span><kbd>-</kbd> Chỉ note</span>
          <span><kbd>=</kbd> Chỉ task</span>
          <span><kbd>\</kbd> Tất cả nội dung</span>
          <span><kbd>N</kbd> Thêm task</span>
          <span><kbd>[</kbd> Sidebar</span>
          <span><kbd>?</kbd> Trợ giúp</span>
          <span><kbd>Esc</kbd> Đóng</span>
        </div>
        <p>Phím tắt sẽ tạm dừng khi bạn đang nhập nội dung.</p>
      </div>
    </div>
  );
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
