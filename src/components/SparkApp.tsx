"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { StartupScreen } from "@/components/StartupScreen";
import { useSidebarChrome } from "@/components/ThemePreference";
import { ItemDisplaySwitcher, MobileDock } from "@/components/SparkNavigation";
import { Icon } from "@/components/ui/Icon";
import { normalizeProjectColor } from "@/lib/project-colors";
import { pageScrollY } from "@/lib/detail-scroll-lock";
import { removeProjectFromData } from "@/lib/cloud-sync";
import { addCalendarDays, formatDateRange, formatLongDate, getLocalDateKey, isValidDateRange } from "@/lib/dates";
import { shouldOpenMobileSidebar } from "@/lib/mobile-gestures";
import { createUuid } from "@/lib/ids";
import { reorderProjectsForDrop, type ProjectDropPlacement } from "@/lib/project-order";
import { filterItems, filterItemsByDisplayMode, getSidebarCounts, groupItemsByTime, inactiveForView, type ItemDisplayMode, type ItemSortField, type ItemSortPreference, type TimeGroup } from "@/lib/task-filters";
import { resolveProjectShortcut, resolveStandaloneShortcut } from "@/lib/keyboard-shortcuts";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import type { Project, SparkItem, View } from "@/lib/types";
import { Sidebar } from "@/components/spark/SparkSidebar";
import { EmptyState, ItemGroup } from "@/components/spark/SparkItemList";
import { DateStrip, QuickAdd } from "@/components/spark/SparkQuickAdd";
import { ItemEditor } from "@/components/spark/SparkItemEditor";
import { ArchivedProjects, ProjectEditor, ShortcutHelp, SyncDialog } from "@/components/spark/SparkDialogs";
import { orderProjectsForSidebar, projectPillWidth, syncStatusDetail, syncStatusShortLabel } from "@/components/spark/shared";
import { useSparkData } from "@/components/spark/useSparkData";

const SIDEBAR_KEY = "spark:sidebar:v2";
const SIDEBAR_SECTIONS_KEY = "spark:sidebar-sections";
const PROJECT_LABELS_KEY = "spark:project-labels:v1";
const PROJECT_LABELS_EXPANDED_KEY = "spark:project-labels-expanded:v1";
const SORT_SETTINGS_KEY = "spark:sort-settings:v1";

const timeGroupLabels: Record<TimeGroup, string> = {
  overdue: "Quá hạn",
  today: "Hôm nay",
  ongoing: "Đang thực hiện",
  upcoming: "Sắp tới",
  later: "Sau đó",
  undated: "Chưa có ngày",
};

function defaultSortPreference(section: string): ItemSortPreference {
  if (section === "overdue") return { field: "dueDate", direction: "asc" };
  if (section === "undated") return { field: "title", direction: "asc" };
  if (section === "upcoming" || section === "later") return { field: "dueDate", direction: "asc" };
  if (section === "inactive") return { field: "statusDate", direction: "desc" };
  return { field: "attention", direction: "asc" };
}

function parseSortSettings(value: string | null): Record<string, ItemSortPreference> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as Record<string, Partial<ItemSortPreference>>;
    const validFields: ItemSortField[] = ["attention", "title", "startDate", "dueDate", "statusDate"];
    return Object.fromEntries(Object.entries(parsed).filter(([, preference]) =>
      Boolean(
        preference &&
        validFields.includes(preference.field as ItemSortField) &&
        (preference.direction === "asc" || preference.direction === "desc"),
      ),
    )) as Record<string, ItemSortPreference>;
  } catch {
    return {};
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

function sortStorageKey(view: View, section: string) {
  const scope = view.type === "calendar" ? "calendar" : viewKey(view);
  return `${scope}:${section}`;
}

export function SparkApp() {
  const today = getLocalDateKey();
  const [selectedView, setView] = useState<View>({ type: "today" });
  const [sidebarCompact, setSidebarCompact] = useState(true);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [projectLabelsEnabled, setProjectLabelsEnabled] = useState(true);
  const [projectLabelsExpanded, setProjectLabelsExpanded] = useState(false);
  const [attentionOpen, setAttentionOpen] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [itemDisplayMode, setItemDisplayMode] = useState<ItemDisplayMode>("all");
  const [headerCompact, setHeaderCompact] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const expandedHeaderHeight = useRef(0);
  const headerMotionUntil = useRef(0);
  const [completedOpen, setCompletedOpen] = useState(false);
  const [todayOverdueOpen, setTodayOverdueOpen] = useState(true);
  const [todayCurrentOpen, setTodayCurrentOpen] = useState(true);
  const [todayOngoingOpen, setTodayOngoingOpen] = useState(true);
  const [todayUndatedOpen, setTodayUndatedOpen] = useState(true);
  const [allGroupsOpen, setAllGroupsOpen] = useState<Partial<Record<TimeGroup, boolean>>>({});
  const [sortSettings, setSortSettings] = useState<Record<string, ItemSortPreference>>({});
  const [editingItem, setEditingItem] = useState<SparkItem | null>(null);
  const [projectEditor, setProjectEditor] = useState<Project | "new" | null>(null);
  const [projectArchiveOpen, setProjectArchiveOpen] = useState(false);
  const [deletedItem, setDeletedItem] = useState<SparkItem | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<SparkItem | null>(null);
  const [openSwipeItemId, setOpenSwipeItemId] = useState<string | null>(null);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  useSidebarChrome(mobileNav && !helpOpen && !syncDialogOpen);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTransientState = useCallback(() => {
    setEditingItem(null);
    setProjectEditor(null);
    setQuickAddOpen(false);
    setProjectArchiveOpen(false);
    setDeleteConfirmation(null);
    setDeletedItem(null);
    setSyncDialogOpen(false);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  }, []);
  const {
    data, dataRef, startupActive, setStartupActive, startupCanContinue, startup, setStartup, retryStartupRef,
    cloudUser, syncStatus, commitLocalData, enqueueCloudMutations, enqueueCloudMutation,
  } = useSparkData(resetTransientState);
  const view = useMemo<View>(() => selectedView.type === "project" && data && !data.projects.some((project) => project.id === selectedView.projectId)
    ? { type: "today" } : selectedView, [data, selectedView]);
  const navEdgeGestureRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
  } | null>(null);

  const updateProjectLabelsEnabled = (enabled: boolean) => {
    setProjectLabelsEnabled(enabled);
    if (!enabled) setProjectLabelsExpanded(false);
  };

  useEffect(() => {
    let frame = 0;
    const updateHeader = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const compact = pageScrollY() > 28;
        const header = headerRef.current;
        if (header && compact !== header.classList.contains("is-compact")) {
          headerMotionUntil.current = performance.now() + 260;
        }
        setHeaderCompact(compact);
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

  const headerReady = data !== null;
  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const preserveHeaderSpace = () => {
      const height = header.getBoundingClientRect().height;
      const animating = performance.now() < headerMotionUntil.current;
      if (!headerCompact && !animating) expandedHeaderHeight.current = height;
      const space = Math.max(0, expandedHeaderHeight.current - height);
      header.parentElement?.style.setProperty("--header-collapse-space", `${space}px`);
    };
    preserveHeaderSpace();
    const observer = new ResizeObserver(preserveHeaderSpace);
    observer.observe(header);
    const settle = window.setTimeout(preserveHeaderSpace, Math.max(0, headerMotionUntil.current - performance.now()) + 20);
    return () => { observer.disconnect(); window.clearTimeout(settle); };
  }, [headerCompact, headerReady]);

  useEffect(() => {
    queueMicrotask(() => {
      const sidebarPreference = window.localStorage.getItem(SIDEBAR_KEY);
      setSidebarCompact(sidebarPreference === null || sidebarPreference === "compact");
      setProjectLabelsEnabled(window.localStorage.getItem(PROJECT_LABELS_KEY) !== "off");
      setProjectLabelsExpanded(window.localStorage.getItem(PROJECT_LABELS_EXPANDED_KEY) === "open");
      setSortSettings(parseSortSettings(window.localStorage.getItem(SORT_SETTINGS_KEY)));
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
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;
    window.localStorage.setItem(SIDEBAR_KEY, sidebarCompact ? "compact" : "expanded");
  }, [preferencesLoaded, sidebarCompact]);

  useEffect(() => {
    if (!preferencesLoaded) return;
    window.localStorage.setItem(PROJECT_LABELS_KEY, projectLabelsEnabled ? "on" : "off");
  }, [preferencesLoaded, projectLabelsEnabled]);

  useEffect(() => {
    if (!preferencesLoaded) return;
    window.localStorage.setItem(PROJECT_LABELS_EXPANDED_KEY, projectLabelsExpanded ? "open" : "closed");
  }, [preferencesLoaded, projectLabelsExpanded]);

  useEffect(() => {
    if (!preferencesLoaded) return;
    window.localStorage.setItem(SORT_SETTINGS_KEY, JSON.stringify(sortSettings));
  }, [preferencesLoaded, sortSettings]);

  useEffect(() => {
    window.localStorage.setItem(
      SIDEBAR_SECTIONS_KEY,
      JSON.stringify({ attention: attentionOpen, projects: projectsOpen }),
    );
  }, [attentionOpen, projectsOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (startupActive || event.isComposing || isTypingTarget(event.target)) return;
      const standaloneShortcut = resolveStandaloneShortcut(event.key, {
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
      });
      const themeShortcuts = { "theme-light": "light", "theme-dark": "dark", "theme-system": "system" } as const;
      if (standaloneShortcut && standaloneShortcut in themeShortcuts) {
        event.preventDefault();
        if (!event.repeat) window.dispatchEvent(new CustomEvent("spark:theme-select", {
          detail: themeShortcuts[standaloneShortcut as keyof typeof themeShortcuts],
        }));
        return;
      }
      if (projectEditor || projectArchiveOpen || helpOpen || syncDialogOpen) return;
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
  }, [startupActive, editingItem, helpOpen, mobileNav, projectEditor, projectArchiveOpen, syncDialogOpen, today, dataRef]);

  const allProjects = useMemo(() => data?.projects ?? [], [data]);
  const projects = useMemo(
    () => allProjects.filter((project) => !project.archivedAt),
    [allProjects],
  );
  const archivedProjects = useMemo(
    () => allProjects.filter((project) => project.archivedAt),
    [allProjects],
  );
  const projectById = useMemo(
    () => new Map(allProjects.map((project) => [project.id, project])),
    [allProjects],
  );
  const sidebarCounts = useMemo(
    () => getSidebarCounts(data?.items ?? [], today, allProjects),
    [allProjects, data?.items, today],
  );
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
  const projectChipWidth = useMemo(() => {
    const renderedItems = completedOpen
      ? [...visibleOpenItems, ...visibleInactiveItems]
      : visibleOpenItems;
    return renderedItems.reduce((widest, item) => {
      if (!item.projectId) return widest;
      const project = projectById.get(item.projectId);
      return project ? Math.max(widest, projectPillWidth(project.name)) : widest;
    }, 0);
  }, [completedOpen, projectById, visibleInactiveItems, visibleOpenItems]);
  const [measuredProjectChipWidth, setMeasuredProjectChipWidth] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    const measure = () => {
      const label = document.querySelector<HTMLElement>(".item-project-chip-label");
      if (!label || !active) return;
      const style = getComputedStyle(label);
      const context = document.createElement("canvas").getContext("2d");
      if (!context) return;
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const names = Array.from(document.querySelectorAll<HTMLElement>(".item-project-chip-label"), el => el.textContent ?? "");
      const spacing = parseFloat(style.letterSpacing) || 0;
      setMeasuredProjectChipWidth(Math.ceil(Math.max(0, ...names.map(name => context.measureText(name.toUpperCase()).width + Array.from(name.toUpperCase()).length * spacing))) + 30);
    };
    measure();
    void document.fonts.ready.then(measure);
    return () => { active = false; };
  }, [projectChipWidth, visibleOpenItems, visibleInactiveItems, completedOpen, projectById]);
  const { overdue, current, todayItems, ongoing, undated, taskCount, noteCount, overdueCount } = useMemo(() => {
    const overdueItems: SparkItem[] = [];
    const dueTodayItems: SparkItem[] = [];
    const ongoingItems: SparkItem[] = [];
    const undatedItems: SparkItem[] = [];
    let tasks = 0;
    let notes = 0;
    let overdueTotal = 0;

    for (const item of visibleOpenItems) {
      if (item.type === "task") tasks += 1;
      else notes += 1;
      if (item.dueDate && item.dueDate < today) overdueTotal += 1;
      if (view.type === "today") {
        if (item.dueDate && item.dueDate < today) overdueItems.push(item);
        else if (!item.startDate && !item.dueDate && item.type === "task") undatedItems.push(item);
        else if (item.startDate === today || item.dueDate === today) dueTodayItems.push(item);
        else ongoingItems.push(item);
      }
    }

    return {
      overdue: overdueItems,
      current: view.type === "today" || view.type === "all" ? [] : visibleOpenItems,
      todayItems: dueTodayItems,
      ongoing: ongoingItems,
      undated: undatedItems,
      taskCount: tasks,
      noteCount: notes,
      overdueCount: overdueTotal,
    };
  }, [today, view.type, visibleOpenItems]);
  const allTimeGroups = useMemo(
    () => view.type === "all" ? groupItemsByTime(visibleOpenItems, today) : [],
    [today, view.type, visibleOpenItems],
  );
  const activeProject = view.type === "project" ? projectById.get(view.projectId) ?? null : null;

  const sortPreferenceFor = useCallback((section: string) => {
    return sortSettings[sortStorageKey(view, section)] ?? defaultSortPreference(section);
  }, [sortSettings, view]);

  const updateSortPreference = useCallback((section: string, preference: ItemSortPreference) => {
    const key = sortStorageKey(view, section);
    setSortSettings((currentSettings) => ({ ...currentSettings, [key]: preference }));
  }, [view]);

  const navigate = useCallback((next: View) => {
    setView(next);
    setMobileNav(false);
    setOpenSwipeItemId(null);
    setCompletedOpen(false);
  }, []);

  const mutateItem = useCallback((id: string, update: Partial<SparkItem>) => {
    const currentData = dataRef.current;
    if (!currentData) return;
    const existing = currentData.items.find((item) => item.id === id);
    if (!existing) return;
    const nextItem = { ...existing, ...update };
    if (!isValidDateRange(nextItem.startDate, nextItem.dueDate)) return;
    if (nextItem.projectId && !currentData.projects.some((project) => project.id === nextItem.projectId)) nextItem.projectId = null;
    commitLocalData({
      ...currentData,
      items: currentData.items.map((item) => (item.id === id ? nextItem : item)),
    });
    enqueueCloudMutation({
      id: createUuid(),
      kind: "upsert-item",
      item: nextItem,
    });
  }, [commitLocalData, enqueueCloudMutation, dataRef]);

  const addItem = useCallback((item: SparkItem) => {
    const currentData = dataRef.current;
    if (!currentData) return false;
    const nextItem = { ...item, projectId: currentData.projects.some((project) => project.id === item.projectId && !project.archivedAt) ? item.projectId : null };
    commitLocalData({ ...currentData, items: [...currentData.items, nextItem] });
    enqueueCloudMutation({
      id: createUuid(),
      kind: "upsert-item",
      item: nextItem,
    });
    return true;
  }, [commitLocalData, enqueueCloudMutation, dataRef]);

  const saveProject = (input: Project) => {
    const project = { ...input, color: normalizeProjectColor(input.color) };
    const currentData = dataRef.current;
    if (!currentData) return;
    const exists = currentData.projects.some((entry) => entry.id === project.id);
    const nextProject = exists ? project : {
      ...project,
      position: Math.max(-1, ...currentData.projects.map((entry) => entry.position ?? 0)) + 1,
    };
    commitLocalData({
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
    commitLocalData({ ...currentData, projects: nextProjects });
    enqueueCloudMutations(nextProjects.map((project) => ({
      id: createUuid(),
      kind: "upsert-project" as const,
      project,
    })));
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
    commitLocalData(removeProjectFromData(currentData, project.id));
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

  const toggleComplete = useCallback((item: SparkItem) => {
    if (item.type === "note") return;
    mutateItem(item.id, { completedAt: item.completedAt ? null : new Date().toISOString() });
  }, [mutateItem]);

  const toggleNoteArchive = useCallback((item: SparkItem) => {
    if (item.type !== "note") return;
    mutateItem(item.id, { archivedAt: item.archivedAt ? null : new Date().toISOString() });
    setEditingItem(null);
    setOpenSwipeItemId(null);
  }, [mutateItem]);

  const requestItemDelete = useCallback((item: SparkItem) => {
    setOpenSwipeItemId(null);
    setDeleteConfirmation(item);
  }, []);

  const removeItem = (item: SparkItem) => {
    setDeleteConfirmation(null);
    setDeletedItem(item);
    setEditingItem(null);
    setOpenSwipeItemId(null);
    const currentData = dataRef.current;
    if (currentData) {
      commitLocalData({
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
      commitLocalData({ ...currentData, items: [...currentData.items, deletedItem] });
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
          : view.type === "all"
            ? "Mọi ngày. Mọi việc."
            : null;

  const startNavEdgeGesture = (event: ReactPointerEvent<HTMLElement>) => {
    if (
      mobileNav ||
      quickAddOpen ||
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

  const startupScreen = startupActive && <StartupScreen key="startup" state={startup} canContinue={startupCanContinue}
    onRetry={() => retryStartupRef.current()}
    onContinue={() => setStartup({ progress: 100, label: "Đã tải bản lưu trên thiết bị", status: "ready" })}
    onComplete={() => setStartupActive(false)} />;
  if (!data) return <>{startupScreen}</>;

  return (
    <>
    {startupScreen}
    <div inert={startupActive} aria-hidden={startupActive || undefined} className={`app-shell ${sidebarCompact ? "sidebar-compact" : ""}`}>
      <Sidebar
        compact={sidebarCompact}
        counts={sidebarCounts}
        currentView={view}
        attentionOpen={attentionOpen}
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
              counts={sidebarCounts}
              currentView={view}
              attentionOpen={attentionOpen}
              mobile
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
          <div ref={headerRef} className={`view-header ${headerCompact ? "is-compact" : ""}`}>
            <div>
              {(headerContext || (view.type === "project" && activeProject)) && <div className="eyebrow">
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
            <span
              className="view-project-band"
              style={{ background: activeProject?.color ?? "var(--turquoise)" }}
              aria-hidden="true"
            />
          </div>

          {view.type === "calendar" && (
            <DateStrip selected={view.date} today={today} onSelect={(date) => setView({ type: "calendar", date })} />
          )}

          <div
            className="list-area"
            style={{ "--project-chip-width": `${measuredProjectChipWidth ?? projectChipWidth}px` } as CSSProperties}
          >
            {overdue.length > 0 && (
              <ItemGroup
                label="Quá hạn"
                items={overdue}
                projectById={projectById}
                today={today}
                collapsible={view.type === "today"}
                open={todayOverdueOpen}
                onToggle={() => setTodayOverdueOpen((value) => !value)}
                sortPreference={sortPreferenceFor("overdue")}
                onSortPreferenceChange={(preference) => updateSortPreference("overdue", preference)}
                onArchive={toggleNoteArchive}
                onComplete={toggleComplete}
                onDelete={requestItemDelete}
                onEdit={setEditingItem}
                onFlag={mutateItem}
                projectLabelsExpanded={projectLabelsExpanded}
                onProjectLabelsExpandedChange={setProjectLabelsExpanded}
                openSwipeItemId={openSwipeItemId}
                onSwipeOpenChange={setOpenSwipeItemId}
                projectLabelsEnabled={projectLabelsEnabled}
              />
            )}
            {current.length > 0 && (
              <ItemGroup
                label={view.type === "upcoming"
                    ? "Sắp tới"
                    : view.type === "calendar"
                      ? "Ngày đã chọn"
                      : "Danh sách"}
                items={current}
                projectById={projectById}
                today={today}
                sortPreference={sortPreferenceFor("main")}
                onSortPreferenceChange={(preference) => updateSortPreference("main", preference)}
                showEmptyDates={view.type === "project"}
                onArchive={toggleNoteArchive}
                onComplete={toggleComplete}
                onDelete={requestItemDelete}
                onEdit={setEditingItem}
                onFlag={mutateItem}
                projectLabelsExpanded={projectLabelsExpanded}
                onProjectLabelsExpandedChange={setProjectLabelsExpanded}
                openSwipeItemId={openSwipeItemId}
                onSwipeOpenChange={setOpenSwipeItemId}
                projectLabelsEnabled={projectLabelsEnabled}
              />
            )}
            {view.type === "today" && todayItems.length > 0 && (
              <ItemGroup
                label="Hôm nay"
                items={todayItems}
                projectById={projectById}
                today={today}
                collapsible
                open={todayCurrentOpen}
                onToggle={() => setTodayCurrentOpen((value) => !value)}
                sortPreference={sortPreferenceFor("today")}
                onSortPreferenceChange={(preference) => updateSortPreference("today", preference)}
                onArchive={toggleNoteArchive}
                onComplete={toggleComplete}
                onDelete={requestItemDelete}
                onEdit={setEditingItem}
                onFlag={mutateItem}
                projectLabelsExpanded={projectLabelsExpanded}
                onProjectLabelsExpandedChange={setProjectLabelsExpanded}
                openSwipeItemId={openSwipeItemId}
                onSwipeOpenChange={setOpenSwipeItemId}
                projectLabelsEnabled={projectLabelsEnabled}
              />
            )}
            {view.type === "today" && ongoing.length > 0 && (
              <ItemGroup
                label="Đang thực hiện"
                items={ongoing}
                projectById={projectById}
                today={today}
                collapsible
                open={todayOngoingOpen}
                onToggle={() => setTodayOngoingOpen((value) => !value)}
                sortPreference={sortPreferenceFor("ongoing")}
                onSortPreferenceChange={(preference) => updateSortPreference("ongoing", preference)}
                onArchive={toggleNoteArchive}
                onComplete={toggleComplete}
                onDelete={requestItemDelete}
                onEdit={setEditingItem}
                onFlag={mutateItem}
                projectLabelsExpanded={projectLabelsExpanded}
                onProjectLabelsExpandedChange={setProjectLabelsExpanded}
                openSwipeItemId={openSwipeItemId}
                onSwipeOpenChange={setOpenSwipeItemId}
                projectLabelsEnabled={projectLabelsEnabled}
              />
            )}
            {view.type === "today" && undated.length > 0 && (
              <ItemGroup
                label="Chưa có ngày"
                items={undated}
                projectById={projectById}
                today={today}
                collapsible
                open={todayUndatedOpen}
                onToggle={() => setTodayUndatedOpen((value) => !value)}
                sortPreference={sortPreferenceFor("undated")}
                onSortPreferenceChange={(preference) => updateSortPreference("undated", preference)}
                disabledSortFields={["startDate", "dueDate"]}
                onArchive={toggleNoteArchive}
                onComplete={toggleComplete}
                onDelete={requestItemDelete}
                onEdit={setEditingItem}
                onFlag={mutateItem}
                projectLabelsExpanded={projectLabelsExpanded}
                onProjectLabelsExpandedChange={setProjectLabelsExpanded}
                openSwipeItemId={openSwipeItemId}
                onSwipeOpenChange={setOpenSwipeItemId}
                projectLabelsEnabled={projectLabelsEnabled}
              />
            )}
            {view.type === "all" && allTimeGroups.map((group) => (
              <ItemGroup
                key={group.key}
                label={timeGroupLabels[group.key]}
                items={group.items}
                projectById={projectById}
                today={today}
                collapsible
                open={allGroupsOpen[group.key] ?? true}
                onToggle={() => setAllGroupsOpen((previous) => ({
                  ...previous,
                  [group.key]: !(previous[group.key] ?? true),
                }))}
                sortPreference={sortPreferenceFor(group.key)}
                onSortPreferenceChange={(preference) => updateSortPreference(group.key, preference)}
                disabledSortFields={group.key === "undated" ? ["startDate", "dueDate"] : undefined}
                onArchive={toggleNoteArchive}
                onComplete={toggleComplete}
                onDelete={requestItemDelete}
                onEdit={setEditingItem}
                onFlag={mutateItem}
                projectLabelsExpanded={projectLabelsExpanded}
                onProjectLabelsExpandedChange={setProjectLabelsExpanded}
                openSwipeItemId={openSwipeItemId}
                onSwipeOpenChange={setOpenSwipeItemId}
                projectLabelsEnabled={projectLabelsEnabled}
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
              <ItemGroup
                label={visibleInactiveItems.some((item) => item.type === "task") && visibleInactiveItems.some((item) => item.type === "note")
                  ? "Đã hoàn thành & lưu trữ"
                  : visibleInactiveItems[0]?.type === "note" ? "Đã lưu trữ" : "Đã hoàn thành"}
                items={visibleInactiveItems}
                projectById={projectById}
                today={today}
                collapsible
                open={completedOpen}
                onToggle={() => setCompletedOpen((value) => !value)}
                sortPreference={sortPreferenceFor("inactive")}
                onSortPreferenceChange={(preference) => updateSortPreference("inactive", preference)}
                includeStatusSort
                showEmptyDates={view.type === "project"}
                onArchive={toggleNoteArchive}
                onComplete={toggleComplete}
                onDelete={requestItemDelete}
                onEdit={setEditingItem}
                onFlag={mutateItem}
                projectLabelsExpanded={projectLabelsExpanded}
                onProjectLabelsExpandedChange={setProjectLabelsExpanded}
                openSwipeItemId={openSwipeItemId}
                onSwipeOpenChange={setOpenSwipeItemId}
                projectLabelsEnabled={projectLabelsEnabled}
              />
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
      {helpOpen && (
        <ShortcutHelp
          onClose={() => setHelpOpen(false)}
          projectLabelsEnabled={projectLabelsEnabled}
          onProjectLabelsEnabledChange={updateProjectLabelsEnabled}
        />
      )}
      {syncDialogOpen && (
        <SyncDialog
          configured={isSupabaseConfigured()}
          status={syncStatus}
          user={cloudUser}
          onClose={() => setSyncDialogOpen(false)}
          onSignedOut={() => {
            void getSupabaseBrowserClient()
              .then((client) => client?.auth.signOut())
              .catch((error) => console.error("Spark sign out failed", error));
          }}
        />
      )}
      {deletedItem && (
        <div className="toast" role="status"><span>Đã xóa “{deletedItem.title}”</span><button onClick={undoDelete}>Hoàn tác</button></div>
      )}
    </div>
    </>
  );
}
