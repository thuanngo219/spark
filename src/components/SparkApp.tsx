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
  formatLongDate,
  formatShortDate,
  getLocalDateKey,
} from "@/lib/dates";
import { normalizeDataIds, type SparkData } from "@/lib/data-ids";
import { completedForView, filterItems } from "@/lib/task-filters";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import type { ItemType, Project, SparkItem, View } from "@/lib/types";

const STORAGE_KEY = "spark:data:v1";
const SIDEBAR_KEY = "spark:sidebar";

const projectColors = ["#32C8C7", "#8461D5", "#D6A84F", "#D9776A", "#5C78D6"];
type SyncStatus = "demo" | "loading" | "syncing" | "synced" | "error" | "not-configured";
type CloudUser = { id: string; email: string };

function seedData(today: string): SparkData {
  const workProjectId = crypto.randomUUID();
  const personalProjectId = crypto.randomUUID();
  const sparkProjectId = crypto.randomUUID();
  const projects: Project[] = [
    { id: workProjectId, name: "Công việc", color: "#32C8C7", archivedAt: null },
    { id: personalProjectId, name: "Cá nhân", color: "#8461D5", archivedAt: null },
    { id: sparkProjectId, name: "Spark", color: "#D6A84F", archivedAt: null },
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

export function SparkApp() {
  const today = getLocalDateKey();
  const [data, setData] = useState<SparkData | null>(null);
  const [view, setView] = useState<View>({ type: "today" });
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [pendingG, setPendingG] = useState(false);
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
      setSidebarCompact(window.localStorage.getItem(SIDEBAR_KEY) === "compact");
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
    window.localStorage.setItem(SIDEBAR_KEY, sidebarCompact ? "compact" : "expanded");
  }, [sidebarCompact]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return;
      if (event.key === "Escape") {
        setPendingG(false);
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
      if (pendingG) {
        if (key === "t") setView({ type: "today" });
        if (key === "u") setView({ type: "upcoming" });
        if (key === "d") setView({ type: "calendar", date: today });
        setPendingG(false);
        if (["t", "u", "d"].includes(key)) event.preventDefault();
        return;
      }
      if (key === "g") {
        event.preventDefault();
        setPendingG(true);
        if (pendingTimer.current) clearTimeout(pendingTimer.current);
        pendingTimer.current = setTimeout(() => setPendingG(false), 1000);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pendingG, today]);

  const projects = data?.projects.filter((project) => !project.archivedAt) ?? [];
  const openItems = useMemo(
    () => (data ? filterItems(data.items, view, today) : []),
    [data, view, today],
  );
  const completedItems = useMemo(
    () => (data ? completedForView(data.items, view, today) : []),
    [data, view, today],
  );
  const overdue = view.type === "today" ? openItems.filter((item) => item.dueDate! < today) : [];
  const current = view.type === "today" ? openItems.filter((item) => item.dueDate === today) : openItems;
  const activeProject = view.type === "project" ? projects.find((project) => project.id === view.projectId) : null;

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
          : view.type === "important"
            ? "Quan Trọng"
            : view.type === "urgent"
              ? "Urgent"
              : activeProject?.name ?? "Dự án";

  const subtitle =
    view.type === "today"
      ? formatLongDate(today)
      : view.type === "upcoming"
        ? "Ba ngày tiếp theo"
        : view.type === "calendar"
          ? formatLongDate(view.date)
          : `${openItems.length} mục đang mở`;

  if (!data) return <LoadingShell />;

  return (
    <div className={`app-shell ${sidebarCompact ? "sidebar-compact" : ""}`}>
      <Sidebar
        compact={sidebarCompact}
        currentView={view}
        items={data.items}
        onCloseMobile={() => setMobileNav(false)}
        onEditProject={setProjectEditor}
        onHelp={() => setHelpOpen(true)}
        onNavigate={navigate}
        onSync={() => setSyncDialogOpen(true)}
        onToggle={() => setSidebarCompact((value) => !value)}
        projects={projects}
        syncStatus={syncStatus}
        today={today}
      />

      {mobileNav && (
        <div className="mobile-nav-backdrop" onClick={() => setMobileNav(false)}>
          <div className="mobile-nav-panel" onClick={(event) => event.stopPropagation()}>
            <Sidebar
              compact={false}
              currentView={view}
              items={data.items}
              mobile
              onCloseMobile={() => setMobileNav(false)}
              onEditProject={setProjectEditor}
              onHelp={() => setHelpOpen(true)}
              onNavigate={navigate}
              onSync={() => setSyncDialogOpen(true)}
              onToggle={() => setMobileNav(false)}
              projects={projects}
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
          <Image src="/brand/spark-logo.png" width={120} height={45} alt="Spark" priority />
          <button className={`public-badge ${syncStatus}`} onClick={() => setSyncDialogOpen(true)}>{cloudUser ? "Đã sync" : "Public"}</button>
        </header>

        <section className="canvas" aria-labelledby="view-title">
          <div className="view-header">
            <div>
              <div className="eyebrow">
                {view.type === "project" && activeProject && (
                  <span className="project-dot header-dot" style={{ background: activeProject.color }} />
                )}
                {subtitle}
              </div>
              <h1 id="view-title">{title}</h1>
              <p>{openItems.length} mục · {overdue.length ? `${overdue.length} quá hạn` : "mọi thứ trong tầm tay"}</p>
            </div>
            <div className="view-actions">
              <button className="icon-button" aria-label="Tìm kiếm" title="Tìm kiếm sẽ có trong bản tiếp theo">
                <Icon name="search" />
              </button>
              <button className="icon-button" onClick={() => setHelpOpen(true)} aria-label="Phím tắt">
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
                onComplete={toggleComplete}
                onEdit={setEditingItem}
                onFlag={mutateItem}
              />
            )}
            {openItems.length === 0 && <EmptyState view={view} />}

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
            setProjectEditor(null);
          }}
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
      {pendingG && <div className="key-hint"><kbd>G</kbd><span>Tiếp theo:</span><kbd>T</kbd> Hôm nay <kbd>U</kbd> Sắp tới <kbd>D</kbd> Theo ngày</div>}
      {deletedItem && (
        <div className="toast" role="status"><span>Đã xóa “{deletedItem.title}”</span><button onClick={undoDelete}>Hoàn tác</button></div>
      )}
    </div>
  );
}

function Sidebar({
  compact,
  currentView,
  items,
  mobile = false,
  onCloseMobile,
  onEditProject,
  onHelp,
  onNavigate,
  onSync,
  onToggle,
  projects,
  syncStatus,
  today,
}: {
  compact: boolean;
  currentView: View;
  items: SparkItem[];
  mobile?: boolean;
  onCloseMobile: () => void;
  onEditProject: (project: Project | "new") => void;
  onHelp: () => void;
  onNavigate: (view: View) => void;
  onSync: () => void;
  onToggle: () => void;
  projects: Project[];
  syncStatus: SyncStatus;
  today: string;
}) {
  const navItems = [
    { view: { type: "today" } as View, label: "Hôm nay", icon: "sun" as const, count: filterItems(items, { type: "today" }, today).length },
    { view: { type: "upcoming" } as View, label: "Sắp tới", icon: "clock" as const, count: filterItems(items, { type: "upcoming" }, today).length },
    { view: { type: "calendar", date: today } as View, label: "Theo ngày", icon: "calendar" as const },
  ];
  const smartItems = [
    { view: { type: "important" } as View, label: "Quan Trọng", icon: "star" as const, className: "important" },
    { view: { type: "urgent" } as View, label: "Urgent", icon: "zap" as const, className: "urgent" },
  ];
  const isActive = (candidate: View) => candidate.type === currentView.type;

  return (
    <aside className={`sidebar ${mobile ? "sidebar-mobile" : ""}`}>
      <div className="sidebar-brand">
        <Image className="brand-full" src="/brand/spark-logo.png" width={151} height={57} alt="Spark" priority />
        <Image className="brand-mark" src="/spark-mark.svg" width={40} height={40} alt="Spark" />
        {mobile && <button className="icon-button sidebar-close" onClick={onCloseMobile} aria-label="Đóng điều hướng"><Icon name="close" /></button>}
      </div>
      <nav aria-label="Điều hướng chính">
        <div className="nav-section">
          {!compact && <span className="nav-label">Kế hoạch</span>}
          {navItems.map((entry) => (
            <button key={entry.label} className={`nav-item ${isActive(entry.view) ? "active" : ""}`} onClick={() => onNavigate(entry.view)} title={entry.label}>
              <Icon name={entry.icon} /><span className="nav-text">{entry.label}</span>{entry.count !== undefined && <span className="nav-count">{entry.count}</span>}
            </button>
          ))}
        </div>
        <div className="nav-section">
          {!compact && <span className="nav-label">Tập trung</span>}
          {smartItems.map((entry) => (
            <button key={entry.label} className={`nav-item ${entry.className} ${isActive(entry.view) ? "active" : ""}`} onClick={() => onNavigate(entry.view)} title={entry.label}>
              <Icon name={entry.icon} /><span className="nav-text">{entry.label}</span>
            </button>
          ))}
        </div>
        <div className="nav-section projects-nav">
          <div className="nav-heading">
            {!compact && <span className="nav-label">Dự án</span>}
            <button className="mini-button" onClick={() => onEditProject("new")} aria-label="Tạo dự án"><Icon name="plus" size={17} /></button>
          </div>
          {projects.map((project) => (
            <div className="project-nav-row" key={project.id}>
              <button className={`nav-item ${currentView.type === "project" && currentView.projectId === project.id ? "active" : ""}`} onClick={() => onNavigate({ type: "project", projectId: project.id })} title={project.name}>
                <span className="project-dot" style={{ background: project.color }} /><span className="nav-text">{project.name}</span>
              </button>
              {!compact && <button className="project-more" onClick={() => onEditProject(project)} aria-label={`Sửa ${project.name}`}><Icon name="more" size={18} /></button>}
            </div>
          ))}
        </div>
      </nav>
      <div className="sidebar-footer">
        <button className="nav-item" onClick={onHelp}><Icon name="help" /><span className="nav-text">Phím tắt</span><kbd className="nav-kbd">?</kbd></button>
        <button className="local-mode-card" onClick={onSync}>
          <span className={`local-mode-icon ${syncStatus}`}><Icon name={syncStatus === "error" ? "zap" : "check"} size={15} /></span>
          <span>
            <strong>{syncStatus === "synced" ? "Đã đồng bộ an toàn" : syncStatus === "syncing" || syncStatus === "loading" ? "Đang đồng bộ…" : "Bật đồng bộ dữ liệu"}</strong>
            <small>{syncStatus === "synced" ? "Cập nhật trên mọi thiết bị" : "Public để xem · riêng tư khi dùng"}</small>
          </span>
        </button>
      </div>
      {!mobile && <button className="sidebar-toggle" onClick={onToggle} aria-label={compact ? "Mở rộng sidebar" : "Thu gọn sidebar"}><Icon name="chevron" className={compact ? "flip" : ""} size={17} /></button>}
    </aside>
  );
}

function ItemGroup({ label, items, projects, today, onComplete, onEdit, onFlag }: {
  label?: string;
  items: SparkItem[];
  projects: Project[];
  today: string;
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
              ) : <span className="note-bullet" aria-label="Ghi chú"><span /></span>}
              <button className="item-main" onClick={() => onEdit(item)}>
                <span className="item-title">{item.title}</span>
                <span className="item-meta">
                  {project && <span className="project-dot" style={{ background: project.color }} title={project.name} />}
                  {item.type === "note" && <span className="type-label">Ghi chú</span>}
                  {item.dueDate && <span className={overdue ? "due-overdue" : ""}>{formatShortDate(item.dueDate, today)}</span>}
                </span>
              </button>
              <div className="item-flags">
                <button className={`flag-button important ${item.isImportant ? "selected" : ""}`} onClick={() => onFlag(item.id, { isImportant: !item.isImportant })} aria-label="Quan Trọng"><Icon name="star" size={18} /></button>
                <button className={`flag-button urgent ${item.isUrgent ? "selected" : ""}`} onClick={() => onFlag(item.id, { isUrgent: !item.isUrgent })} aria-label="Urgent"><Icon name="zap" size={18} /></button>
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
    inputRef.current?.focus();
  };

  if (!expanded) {
    return <button className="quick-add-trigger" onClick={() => setExpanded(true)}><span><Icon name="plus" size={19} /></span>Thêm mục mới</button>;
  }

  return (
    <form className="quick-add" onSubmit={submit}>
      <div className="type-switch" role="group" aria-label="Loại mục">
        <button type="button" className={type === "task" ? "active" : ""} onClick={() => setType("task")}><Icon name="check" size={16} /> Task</button>
        <button type="button" className={type === "note" ? "active" : ""} onClick={() => setType("note")}><Icon name="note" size={16} /> Note</button>
      </div>
      <input ref={inputRef} autoFocus maxLength={type === "task" ? 200 : 500} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={type === "task" ? "Bạn muốn hoàn thành điều gì?" : "Ghi lại một điều cần nhớ…"} aria-label="Tên mục" />
      <div className="quick-add-controls">
        <label><Icon name="calendar" size={16} /><input type="date" min={view.type === "upcoming" ? addCalendarDays(today, 1) : undefined} max={view.type === "upcoming" ? addCalendarDays(today, 3) : undefined} value={date} onChange={(event) => setDate(event.target.value)} required={view.type === "upcoming"} /></label>
        <label><span className="project-dot empty" /><select value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">Không có dự án</option>{projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select></label>
        <div className="quick-add-actions"><button type="button" className="text-button" onClick={() => { setExpanded(false); setTitle(""); }}>Hủy</button><button className="primary-button" disabled={!title.trim()}>Thêm</button></div>
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
        <div className="flag-options"><button type="button" className={`flag-option important ${important ? "selected" : ""}`} onClick={() => setImportant((value) => !value)}><Icon name="star" />Quan Trọng</button><button type="button" className={`flag-option urgent ${urgent ? "selected" : ""}`} onClick={() => setUrgent((value) => !value)}><Icon name="zap" />Urgent</button></div>
        <div className="editor-actions"><button type="button" className="delete-button" onClick={onDelete}><Icon name="trash" size={17} /> Xóa</button><button className="primary-button" disabled={!title.trim()}>Lưu thay đổi</button></div>
      </form>
    </div>
  );
}

function ProjectEditor({ project, onClose, onSave }: { project: Project | null; onClose: () => void; onSave: (project: Project) => void }) {
  const [name, setName] = useState(project?.name ?? "");
  const [color, setColor] = useState(project?.color ?? projectColors[0]);
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <form className="editor-sheet compact-editor" onClick={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); if (name.trim()) onSave(project ? { ...project, name: name.trim(), color } : { id: crypto.randomUUID(), name: name.trim(), color, archivedAt: null }); }}>
        <div className="editor-header"><div><span>Dự án</span><h2>{project ? "Chỉnh sửa dự án" : "Tạo dự án mới"}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Đóng"><Icon name="close" /></button></div>
        <label className="field"><span>Tên dự án</span><input autoFocus maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Ra mắt website" /></label>
        <fieldset className="color-picker"><legend>Màu nhận diện</legend>{projectColors.map((entry) => <button type="button" aria-label={`Chọn màu ${entry}`} className={color === entry ? "selected" : ""} style={{ background: entry }} key={entry} onClick={() => setColor(entry)} />)}</fieldset>
        <div className="editor-actions"><button type="button" className="text-button" onClick={onClose}>Hủy</button><button className="primary-button" disabled={!name.trim()}>{project ? "Lưu thay đổi" : "Tạo dự án"}</button></div>
      </form>
    </div>
  );
}

function ShortcutHelp({ onClose }: { onClose: () => void }) {
  const shortcuts = [["G T", "Mở Hôm nay"], ["G U", "Mở Sắp tới"], ["G D", "Mở Theo ngày"], ["[", "Thu gọn / mở sidebar"], ["?", "Mở bảng trợ giúp"], ["Esc", "Đóng hoặc hủy"]];
  return <div className="dialog-backdrop" onClick={onClose}><div className="shortcut-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcut-title" onClick={(event) => event.stopPropagation()}><div className="editor-header"><div><span>Đi nhanh hơn</span><h2 id="shortcut-title">Phím tắt</h2></div><button className="icon-button" onClick={onClose} aria-label="Đóng"><Icon name="close" /></button></div><div className="shortcut-list">{shortcuts.map(([keys, label]) => <div key={keys}><span>{label}</span><span>{keys.split(" ").map((key) => <kbd key={key}>{key}</kbd>)}</span></div>)}</div><p>Phím tắt sẽ tạm dừng khi bạn đang nhập nội dung.</p></div></div>;
}

function SyncDialog({ configured, status, user, onClose, onSignedOut }: {
  configured: boolean;
  status: SyncStatus;
  user: CloudUser | null;
  onClose: () => void;
  onSignedOut: () => void;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
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
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setSending(false);
    if (result.error) setError("Chưa gửi được liên kết. Hãy kiểm tra email và thử lại.");
    else setSent(true);
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
            <div className="sync-hero"><span><Icon name="check" size={27} /></span><h3>{status === "error" ? "Đồng bộ đang gián đoạn" : "Đã đồng bộ an toàn"}</h3><p>Task, note và dự án của bạn sẽ xuất hiện trên mọi browser sau khi mở magic link bằng cùng email.</p></div>
            <div className="signed-in-row"><div><small>Đang dùng</small><strong>{user.email}</strong></div><button className="text-button" onClick={onSignedOut}>Ngắt kết nối</button></div>
          </>
        ) : sent ? (
          <div className="sync-hero"><span><Icon name="check" size={27} /></span><h3>Kiểm tra hộp thư</h3><p>Mình đã gửi magic link tới <strong>{email}</strong>. Mở liên kết đó trên browser này để kết nối dữ liệu.</p><button className="text-button" onClick={() => setSent(false)}>Dùng email khác</button></div>
        ) : (
          <>
            <div className="sync-benefits"><div><span>01</span><p><strong>Website vẫn mở public</strong>Ai cũng xem được giao diện, không có màn hình login chặn lối vào.</p></div><div><span>02</span><p><strong>Dữ liệu của bạn vẫn riêng tư</strong>Magic link nhận diện bạn; RLS ngăn người khác đọc hoặc sửa danh sách.</p></div></div>
            <form className="sync-form" onSubmit={submit}><label className="field"><span>Email nhận magic link</span><input type="email" required autoComplete="email" placeholder="ban@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /></label>{error && <p className="form-error">{error}</p>}<button className="primary-button" disabled={sending || !email.trim()}>{sending ? "Đang gửi…" : "Bật đồng bộ"}</button></form>
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
