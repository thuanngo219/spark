"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { ProjectDropPlacement } from "@/lib/project-order";
import type { Project, View } from "@/lib/types";
import { SPARK_LOGO_NEGATIVE_SRC, orderProjectsForSidebar, syncStatusDetail, syncStatusTitle, type SyncStatus } from "./shared";

export function Sidebar({
  archivedProjects,
  onOpenProjectArchive,
  attentionOpen,
  compact,
  counts,
  currentView,
  mobile = false,
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
  counts: { today: number; upcoming: number; all: number };
  currentView: View;
  mobile?: boolean;
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
    { view: { type: "today" } as View, label: "Hôm nay", icon: "sun" as const, count: counts.today },
    { view: { type: "upcoming" } as View, label: "Sắp tới", icon: "clock" as const, count: counts.upcoming },
    { view: { type: "calendar", date: today } as View, label: "Theo ngày", icon: "calendar" as const },
    { view: { type: "all" } as View, label: "Tất cả", icon: "list" as const, count: counts.all },
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
        <span className="brand-full-wrap"><Image className="brand-full" src={SPARK_LOGO_NEGATIVE_SRC} width={153.6} height={57.6} alt="Spark" priority unoptimized /></span>
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
