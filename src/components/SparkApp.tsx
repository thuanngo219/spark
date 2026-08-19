"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  deleteCloudItem,
  fetchCloudData,
  seedCloudData,
  upsertItem,
  upsertProject,
} from "@/lib/cloud-data";
import {
  addCalendarDays,
  formatDateRange,
  formatLongDate,
  formatShortDate,
  getLocalDateKey,
} from "@/lib/dates";
import { normalizeDataIds, type SparkData } from "@/lib/data-ids";
import { completedForView, filterItems, groupItemsByTime, type TimeGroup } from "@/lib/task-filters";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import type { ItemType, Project, SparkItem, View } from "@/lib/types";

const STORAGE_KEY = "spark:data:v1";
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
type SyncStatus = "demo" | "loading" | "syncing" | "synced" | "error" | "not-configured";
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

function readLocalData(today: string): SparkData {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return normalizeDataIds(stored ? JSON.parse(stored) : seedData(today));
  } catch {
    return seedData(today);
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
  const [pendingS, setPendingS] = useState(false);
  const [hideNotes, setHideNotes] = useState(false);
  const [completedOpen, setCompletedOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SparkItem | null>(null);
  const [projectEditor, setProjectEditor] = useState<Project | "new" | null>(null);
  const [deletedItem, setDeletedItem] = useState<SparkItem | null>(null);
  const [cloudUser, setCloudUser] = useState<CloudUser | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(isSupabaseConfigured() ? "loading" : "not-configured");
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    queueMicrotask(() => {
      const localData = readLocalData(today);
      dataRef.current = localData;
      setData(localData);
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
  }, [today]);

  useEffect(() => {
    if (!data) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

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
      activationPromise = (async () => {
        setCloudUser({ id: user.id, email: user.email ?? "" });
        setSyncStatus("loading");
        try {
          const remote = await fetchCloudData(client);
          if (!active) return;
          if (remote.items.length === 0 && remote.projects.length === 0) {
            const localData = normalizeDataIds(
              dataRef.current ?? readLocalData(getLocalDateKey()),
            );
            dataRef.current = localData;
            await seedCloudData(client, localData, user.id);
            if (!active) return;
            setData(localData);
          } else {
            dataRef.current = remote;
            setData(remote);
          }
          setSyncStatus("synced");
        } catch (error) {
          console.error("Spark cloud activation failed", error);
          if (active) setSyncStatus("error");
        }
      })();
      return activationPromise;
    };

    client.auth.getSession().then(({ data: sessionData }) => {
      if (sessionData.session?.user) {
        void activateSession(sessionData.session.user);
      } else if (active) {
        setSyncStatus("demo");
      }
    });

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      queueMicrotask(() => {
        if (session?.user) {
          void activateSession(session.user);
        } else if (active) {
          activationUserId = null;
          activationPromise = null;
          setCloudUser(null);
          setSyncStatus("demo");
        }
      });
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client || !cloudUser) return;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    const refresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        fetchCloudData(client)
          .then((remote) => {
            setData(remote);
            setSyncStatus("synced");
          })
          .catch(() => setSyncStatus("error"));
      }, 120);
    };
    const channel = client
      .channel(`spark-sync-${cloudUser.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "items" }, refresh)
      .subscribe();
    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      void client.removeChannel(channel);
    };
  }, [cloudUser]);

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
      if (event.key === "Escape") {
        setPendingS(false);
        setHelpOpen(false);
        setMobileNav(false);
        setEditingItem(null);
        return;
      }
      if (event.key === "[") {
        event.preventDefault();
        setSidebarCompact((value) => !value);
        return;
      }
      if (event.key === "?") {
        event.preventDefault();
        setHelpOpen(true);
        return;
      }
      const key = event.key.toLowerCase();
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
  }, [pendingS, today]);

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
    setCompletedOpen(false);
  };

  const writeCloud = (operation: () => Promise<void>) => {
    if (!cloudUser) return;
    setSyncStatus("syncing");
    operation()
      .then(() => setSyncStatus("synced"))
      .catch(() => setSyncStatus("error"));
  };

  const mutateItem = (id: string, update: Partial<SparkItem>) => {
    if (!data) return;
    const existing = data.items.find((item) => item.id === id);
    if (!existing) return;
    const nextItem = { ...existing, ...update };
    setData({ ...data, items: data.items.map((item) => (item.id === id ? nextItem : item)) });
    const client = getSupabaseBrowserClient();
    if (client && cloudUser) writeCloud(() => upsertItem(client, nextItem, cloudUser.id));
  };

  const addItem = (item: SparkItem) => {
    setData((value) => value ? { ...value, items: [...value.items, item] } : value);
    const client = getSupabaseBrowserClient();
    if (client && cloudUser) writeCloud(() => upsertItem(client, item, cloudUser.id));
  };

  const saveProject = (project: Project) => {
    setData((value) => {
      if (!value) return value;
      const exists = value.projects.some((entry) => entry.id === project.id);
      return {
        ...value,
        projects: exists
          ? value.projects.map((entry) => entry.id === project.id ? project : entry)
          : [...value.projects, project],
      };
    });
    const client = getSupabaseBrowserClient();
    if (client && cloudUser) writeCloud(() => upsertProject(client, project, cloudUser.id));
  };

  const toggleComplete = (item: SparkItem) => {
    if (item.type === "note") return;
    mutateItem(item.id, { completedAt: item.completedAt ? null : new Date().toISOString() });
  };

  const removeItem = (item: SparkItem) => {
    setDeletedItem(item);
    setEditingItem(null);
    setData((currentData) =>
      currentData ? { ...currentData, items: currentData.items.filter((entry) => entry.id !== item.id) } : null,
    );
    const client = getSupabaseBrowserClient();
    if (client && cloudUser) writeCloud(() => deleteCloudItem(client, item.id));
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setDeletedItem(null), 6000);
  };

  const undoDelete = () => {
    if (!deletedItem) return;
    setData((currentData) =>
      currentData ? { ...currentData, items: [...currentData.items, deletedItem] } : currentData,
    );
    const client = getSupabaseBrowserClient();
    if (client && cloudUser) writeCloud(() => upsertItem(client, deletedItem, cloudUser.id));
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

      <main className="content">
        <header className="mobile-header">
          <button className="icon-button" onClick={() => setMobileNav(true)} aria-label="Mở điều hướng">
            <Icon name="menu" />
          </button>
          <Image className="mobile-logo" src={SPARK_LOGO_SRC} width={120} height={45} alt="Spark" priority unoptimized />
          <button className={`public-badge ${syncStatus}`} onClick={() => setSyncDialogOpen(true)}>{cloudUser ? "Đã sync" : "Public"}</button>
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
              <p>{taskCount} việc cần xử lý <span aria-hidden="true">—</span> {overdueCount} quá hạn <span aria-hidden="true">—</span> {noteCount} ghi chú{hideNotes ? " đang ẩn" : ""}</p>
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
              <button className="icon-button search-action" aria-label="Tìm kiếm" title="Tìm kiếm sẽ có trong bản tiếp theo">
                <Icon name="search" />
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
                onEdit={setEditingItem}
                onFlag={mutateItem}
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
                onEdit={setEditingItem}
                onFlag={mutateItem}
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
                onEdit={setEditingItem}
                onFlag={mutateItem}
              />
            ))}
            {visibleOpenItems.length === 0 && <EmptyState view={view} />}

            <QuickAdd
              key={viewKey(view)}
              projects={projects}
              today={today}
              view={view}
              onAdd={addItem}
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
                    onEdit={setEditingItem}
                    onFlag={mutateItem}
                  />
                )}
              </div>
            )}
          </div>
        </section>
        <p className={`storage-note ${syncStatus}`}><span /> {
          syncStatus === "synced"
            ? "Đã đồng bộ trên mọi thiết bị"
            : syncStatus === "syncing" || syncStatus === "loading"
              ? "Đang đồng bộ dữ liệu…"
              : syncStatus === "error"
                ? "Đồng bộ bị gián đoạn · dữ liệu vẫn còn trên thiết bị"
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
        <button className="local-mode-card" onClick={onSync} aria-label={syncStatus === "synced" ? "Đã đồng bộ an toàn" : syncStatus === "syncing" || syncStatus === "loading" ? "Đang đồng bộ" : "Bật đồng bộ dữ liệu"} data-tooltip={compact ? syncStatus === "synced" ? "Đã đồng bộ an toàn" : syncStatus === "syncing" || syncStatus === "loading" ? "Đang đồng bộ" : "Bật đồng bộ dữ liệu" : undefined}>
          <span className={`local-mode-icon ${syncStatus}`}><Icon name={syncStatus === "error" ? "zap" : "check"} size={15} /></span>
          <span>
            <strong>{syncStatus === "synced" ? "Đã đồng bộ an toàn" : syncStatus === "syncing" || syncStatus === "loading" ? "Đang đồng bộ…" : "Bật đồng bộ dữ liệu"}</strong>
            <small>{syncStatus === "synced" ? "Cập nhật trên mọi thiết bị" : "Public để xem · riêng tư khi dùng"}</small>
          </span>
        </button>
      </div>
    </aside>
  );
}

function ItemGroup({ label, items, projects, today, hideTodayDue = false, onComplete, onEdit, onFlag }: {
  label?: string;
  items: SparkItem[];
  projects: Project[];
  today: string;
  hideTodayDue?: boolean;
  onComplete: (item: SparkItem) => void;
  onEdit: (item: SparkItem) => void;
  onFlag: (id: string, update: Partial<SparkItem>) => void;
}) {
  return (
    <section className="item-group">
      {label && <h2>{label}<span>{items.length}</span></h2>}
      <div className="item-list">
        {items.map((item) => {
          const project = projects.find((entry) => entry.id === item.projectId);
          const overdue = item.dueDate && item.dueDate < today && !item.completedAt;
          return (
            <article className={`item-row ${item.completedAt ? "is-complete" : ""}`} key={item.id}>
              {item.type === "task" ? (
                <button className={`checkbox ${item.completedAt ? "checked" : ""}`} onClick={() => onComplete(item)} aria-label={item.completedAt ? `Đánh dấu chưa xong: ${item.title}` : `Hoàn thành: ${item.title}`}>
                  {item.completedAt && <Icon name="check" size={15} />}
                </button>
              ) : <span className="note-bullet" aria-label="Ghi chú"><span className="note-mark" aria-hidden="true" /></span>}
              {project ? <span className="project-dot item-project-dot" style={{ background: project.color }} title={project.name} /> : <span className="project-dot-spacer" />}
              <button className="item-main" onClick={() => onEdit(item)}>
                <span className="item-title">{item.title}</span>
                <span className="item-meta">
                  {item.dueDate && !(hideTodayDue && item.dueDate === today) && <span className={overdue ? "due-overdue" : ""}>{formatShortDate(item.dueDate, today)}</span>}
                </span>
              </button>
              <div className="item-flags">
                <button className={`flag-button important ${item.isImportant ? "selected" : ""}`} onClick={() => onFlag(item.id, { isImportant: !item.isImportant })} aria-label="Quan Trọng"><Icon name="star" size={18} /></button>
                <button className={`flag-button urgent ${item.isUrgent ? "selected" : ""}`} onClick={() => onFlag(item.id, { isUrgent: !item.isUrgent })} aria-label="Ưu tiên"><Icon name="zap" size={18} /></button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function QuickAdd({ projects, today, view, onAdd }: { projects: Project[]; today: string; view: View; onAdd: (item: SparkItem) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [type, setType] = useState<ItemType>("task");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(view.type === "today" ? today : view.type === "calendar" ? view.date : "");
  const [projectId, setProjectId] = useState(view.type === "project" ? view.projectId : "");
  const inputRef = useRef<HTMLInputElement>(null);

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
    return <button className="quick-add-trigger" onClick={() => { setType("task"); setExpanded(true); }}><Icon name="plus" size={16} />Thêm công việc</button>;
  }

  return (
    <form className="quick-add" onSubmit={submit}>
      <div className="quick-add-entry">
        <label className="quick-title-field">
          <span>{type === "task" ? "Tên công việc" : "Nội dung ghi chú"}</span>
          <input ref={inputRef} autoFocus maxLength={type === "task" ? 200 : 500} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={type === "task" ? "Bạn muốn hoàn thành điều gì?" : "Ghi lại một điều cần nhớ…"} aria-label="Tên mục" />
        </label>
        <label className="note-toggle"><input type="checkbox" checked={type === "note"} onChange={(event) => setType(event.target.checked ? "note" : "task")} />Ghi chú</label>
      </div>
      <div className="quick-add-controls">
        <label className="quick-add-field"><span>Ngày</span><span className="quick-add-control"><Icon name="calendar" size={16} /><input type="date" min={view.type === "upcoming" ? addCalendarDays(today, 1) : undefined} max={view.type === "upcoming" ? addCalendarDays(today, 3) : undefined} value={date} onChange={(event) => setDate(event.target.value)} required={view.type === "upcoming"} /></span></label>
        <label className="quick-add-field"><span>Dự án</span><span className="quick-add-control"><span className="project-dot empty" /><select value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">Không có dự án</option>{projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select></span></label>
        <div className="quick-add-actions"><button type="button" className="text-button" onClick={() => { setExpanded(false); setTitle(""); setType("task"); }}>Hủy</button><button className="primary-button" disabled={!title.trim()}>Thêm</button></div>
      </div>
    </form>
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
  const shortcuts = [["S T", "Mở Hôm nay"], ["S S", "Mở Sắp tới"], ["S D", "Mở Theo ngày"], ["S A", "Mở Tất cả"], ["S I", "Mở Quan Trọng"], ["S U", "Mở Ưu tiên"], ...projects.map((project, index) => [`S ${index + 1}`, `Mở ${project.name}`]), ["[", "Thu gọn / mở sidebar"], ["?", "Mở bảng trợ giúp"], ["Esc", "Đóng hoặc hủy"]];
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
            <div className="sync-hero"><span><Icon name="check" size={27} /></span><h3>{status === "error" ? "Đồng bộ đang gián đoạn" : "Đã đồng bộ an toàn"}</h3><p>Task, note và dự án của bạn sẽ xuất hiện trên mọi browser sau khi đăng nhập bằng cùng email.</p></div>
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
