"use client";

import { memo, useId, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { formatListDate } from "@/lib/dates";
import { createItemClickGuard, resolveItemContentTap, resolveItemSwipe } from "@/lib/mobile-gestures";
import { sortItemsForDisplay, type ItemSortField, type ItemSortPreference } from "@/lib/task-filters";
import type { Project, SparkItem, View } from "@/lib/types";

const sortFieldLabels: Record<ItemSortField, string> = {
  attention: "MỨC CHÚ Ý",
  title: "TÊN",
  startDate: "NGÀY BẮT ĐẦU",
  dueDate: "NGÀY ĐẾN HẠN",
  statusDate: "NGÀY TRẠNG THÁI",
};

export function ItemGroup({
  label,
  items,
  projectById,
  today,
  collapsible = false,
  open = true,
  onToggle,
  sortPreference,
  onSortPreferenceChange,
  disabledSortFields = [],
  includeStatusSort = false,
  showEmptyDates = false,
  onArchive,
  onComplete,
  onDelete,
  onEdit,
  onFlag,
  projectLabelsExpanded,
  onProjectLabelsExpandedChange,
  openSwipeItemId,
  onSwipeOpenChange,
  projectLabelsEnabled,
}: {
  label?: string;
  items: SparkItem[];
  projectById: Map<string, Project>;
  today: string;
  collapsible?: boolean;
  open?: boolean;
  onToggle?: () => void;
  sortPreference: ItemSortPreference;
  onSortPreferenceChange: (preference: ItemSortPreference) => void;
  disabledSortFields?: ItemSortField[];
  includeStatusSort?: boolean;
  showEmptyDates?: boolean;
  onArchive: (item: SparkItem) => void;
  onComplete: (item: SparkItem) => void;
  onDelete: (item: SparkItem) => void;
  onEdit: (item: SparkItem) => void;
  onFlag: (id: string, update: Partial<SparkItem>) => void;
  projectLabelsExpanded: boolean;
  onProjectLabelsExpandedChange: (expanded: boolean) => void;
  openSwipeItemId: string | null;
  onSwipeOpenChange: (id: string | null) => void;
  projectLabelsEnabled: boolean;
}) {
  const listId = useId();
  const sortedItems = useMemo(
    () => sortItemsForDisplay(items, sortPreference),
    [items, sortPreference],
  );
  const sortFields: ItemSortField[] = [
    "attention",
    "dueDate",
    "startDate",
    "title",
    ...(includeStatusSort ? ["statusDate" as const] : []),
  ];
  return (
    <section className="item-group">
      {label && <div className="item-group-header">
        {collapsible ? (
          <button
            type="button"
            className="completed-toggle item-group-toggle"
            aria-controls={listId}
            aria-expanded={open}
            onClick={onToggle}
          >
            <Icon name="chevron" className={open ? "rotate-down" : ""} size={17} />
            {label}
            <span>{items.length}</span>
          </button>
        ) : <h2>{label}<span>{items.length}</span></h2>}
        <div className="item-sort-controls">
          <span className="item-sort-select">
            <select
              value={sortPreference.field}
              aria-label={`Sắp xếp khu ${label}`}
              onChange={(event) => onSortPreferenceChange({
                ...sortPreference,
                field: event.target.value as ItemSortField,
              })}
            >
              {sortFields.map((field) => (
                <option key={field} value={field} disabled={disabledSortFields.includes(field)}>
                  {sortFieldLabels[field]}
                </option>
              ))}
            </select>
            <Icon className="item-sort-select-icon" name="chevron-down" size={15} />
          </span>
          <button
            type="button"
            className={`item-sort-direction ${sortPreference.direction === "desc" ? "descending" : ""}`}
            onClick={() => onSortPreferenceChange({
              ...sortPreference,
              direction: sortPreference.direction === "asc" ? "desc" : "asc",
            })}
            aria-label={`Đổi chiều sắp xếp khu ${label}`}
            title={sortPreference.direction === "asc" ? "Tăng dần" : "Giảm dần"}
          >
            <Icon name={sortPreference.direction === "asc" ? "sort-ascending" : "sort-descending"} size={17} />
          </button>
        </div>
      </div>}
      {(!collapsible || open) && <div className="item-list" id={listId}>
        {sortedItems.map((item) => {
          const project = item.projectId ? projectById.get(item.projectId) : undefined;
          const overdue = item.dueDate && item.dueDate < today && !item.completedAt;
          return (
            <SwipeableItemRow
              item={item}
              project={project}
              overdue={Boolean(overdue)}
              showEmptyDates={showEmptyDates}
              hasOpenSwipeItem={openSwipeItemId !== null}
              isSwipeOpen={openSwipeItemId === item.id}
              key={item.id}
              onArchive={onArchive}
              onComplete={onComplete}
              onDelete={onDelete}
              onEdit={onEdit}
              onFlag={onFlag}
              projectLabelExpanded={projectLabelsExpanded}
              onProjectLabelExpandedChange={onProjectLabelsExpandedChange}
              onSwipeOpenChange={onSwipeOpenChange}
              projectLabelsEnabled={projectLabelsEnabled}
              today={today}
            />
          );
        })}
      </div>}
    </section>
  );
}

const SWIPE_ACTIONS_WIDTH = 144;

const SwipeableItemRow = memo(function SwipeableItemRow({
  item,
  project,
  overdue,
  showEmptyDates,
  hasOpenSwipeItem,
  isSwipeOpen,
  onArchive,
  onComplete,
  onDelete,
  onEdit,
  onFlag,
  onSwipeOpenChange,
  projectLabelExpanded,
  onProjectLabelExpandedChange,
  projectLabelsEnabled,
  today,
}: {
  item: SparkItem;
  project?: Project;
  overdue: boolean;
  showEmptyDates: boolean;
  hasOpenSwipeItem: boolean;
  isSwipeOpen: boolean;
  onArchive: (item: SparkItem) => void;
  onComplete: (item: SparkItem) => void;
  onDelete: (item: SparkItem) => void;
  onEdit: (item: SparkItem) => void;
  onFlag: (id: string, update: Partial<SparkItem>) => void;
  onSwipeOpenChange: (id: string | null) => void;
  projectLabelExpanded: boolean;
  onProjectLabelExpandedChange: (expanded: boolean) => void;
  projectLabelsEnabled: boolean;
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
        className={`item-row ${project && projectLabelsEnabled ? "project-labels-enabled" : ""} ${project && projectLabelsEnabled && projectLabelExpanded ? "project-labels-expanded" : ""} ${item.completedAt ? "is-complete" : ""} ${item.archivedAt ? "is-archived" : ""}`}
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
        {project ? (projectLabelsEnabled ? (
          <>
            <button
              className={`item-project-chip ${projectLabelExpanded ? "expanded" : ""}`}
              type="button"
              style={{
                "--project-color": project.color,
              } as CSSProperties}
              aria-expanded={projectLabelExpanded}
              aria-label={`${projectLabelExpanded ? "Thu gọn" : "Mở rộng"} tên tất cả dự án`}
              title={`${project.name} · ${projectLabelExpanded ? "Thu gọn" : "Mở rộng"} tên dự án`}
              onClick={() => {
                closeActions();
                onProjectLabelExpandedChange(!projectLabelExpanded);
              }}
            >
              <span className="item-project-chip-visual" aria-hidden="true">
                <span className="item-project-chip-dot" />
                <span className="item-project-chip-label">{project.name}</span>
              </span>
            </button>
            <span
              className="project-dot item-project-dot mobile-project-dot"
              style={{ background: project.color }}
              title={project.name}
            />
          </>
        ) : (
          <span className="project-dot item-project-dot" style={{ background: project.color }} title={project.name} />
        )) : <span className="project-dot-spacer" />}
        <button className="item-main" onClick={() => {
          const action = resolveItemContentTap(
            hasOpenSwipeItem ? item.id : null,
            window.matchMedia("(max-width: 699px)").matches,
          );
          closeActions();
          if (action === "open-details") onEdit(item);
        }}>
          <span className="item-title-wrap"><span className="item-title">{item.title}</span></span>
          <span className="item-meta">
            {(item.startDate || showEmptyDates) && (
              <span className={`item-date ${item.startDate ? "" : "empty"}`} title="Ngày Bắt Đầu">
                <Icon name="play" size={13} />
                {item.startDate ? formatListDate(item.startDate, today) : "Chưa bắt đầu"}
              </span>
            )}
            {(item.dueDate || showEmptyDates) && (
              <span className={`item-date ${overdue ? "due-overdue" : ""} ${item.dueDate ? "" : "empty"}`} title="Ngày Đến Hạn">
                <Icon name="flag" size={13} />
                {item.dueDate ? formatListDate(item.dueDate, today) : "Chưa có hạn"}
              </span>
            )}
            {item.description && <span className="item-description-indicator" aria-label="Có nội dung" title="Có nội dung"><Icon name="description" size={15} /></span>}
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
});

export function EmptyState({ view }: { view: View }) {
  return <div className="empty-state"><span><Icon name={view.type === "calendar" ? "calendar" : "check"} size={28} /></span><h2>Khoảng trống thật dễ chịu.</h2><p>Không có mục nào ở đây. Thêm một việc nhỏ để bắt đầu, hoặc tận hưởng cảm giác đã xong.</p></div>;
}
