"use client";

import { flushSync } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import ContentEditor, { type ContentEditorHandle } from "@/components/ContentEditor";
import { Icon } from "@/components/ui/Icon";
import { CONTENT_LIMIT, contentLength, normalizeContent, type ContentRun } from "@/lib/content-format";
import { addCalendarDays, formatShortWeekday, isValidDateRange } from "@/lib/dates";
import { lockDetailScroll } from "@/lib/detail-scroll-lock";
import { createUuid } from "@/lib/ids";
import { defaultStartDate } from "@/lib/quick-add";
import type { ItemType, Project, SparkItem, View } from "@/lib/types";

export function QuickAdd({ expanded, projects, today, view, onAdd, onExpandedChange }: {
  expanded: boolean;
  projects: Project[];
  today: string;
  view: View;
  onAdd: (item: SparkItem) => boolean;
  onExpandedChange: (expanded: boolean) => void;
}) {
  const [type, setType] = useState<ItemType>("task");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionFormat, setDescriptionFormat] = useState<ContentRun[] | null>(null);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [contentFocused, setContentFocused] = useState(false);
  const [classificationOpen, setClassificationOpen] = useState(false);
  const classificationToggleRef = useRef<HTMLButtonElement>(null);
  const contentEditorRef = useRef<ContentEditorHandle>(null);
  const contentBeforeEditRef = useRef<{ description: string; format: ContentRun[] | null; open: boolean } | null>(null);
  const descriptionToggleRef = useRef<HTMLButtonElement>(null);
  const [startDateOverride, setStartDateOverride] = useState<string | null>(null);
  const startDate = startDateOverride ?? defaultStartDate(view, type, today);
  const [dueDate, setDueDate] = useState(view.type === "today" ? today : view.type === "calendar" ? view.date : "");
  const [projectId, setProjectId] = useState(view.type === "project" && projects.some((project) => project.id === view.projectId) ? view.projectId : "");
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const upcomingStart = addCalendarDays(today, 1);
  const upcomingEnd = addCalendarDays(today, 3);
  const hasUpcomingDate = view.type !== "upcoming" || [startDate, dueDate].some(
    (date) => date >= upcomingStart && date <= upcomingEnd,
  );

  const close = useCallback(() => {
    onExpandedChange(false);
    setTitle("");
    setDescription("");
    setDescriptionFormat(null);
    setDescriptionOpen(false);
    setContentFocused(false);
    contentBeforeEditRef.current = null;
    setClassificationOpen(false);
    setType("task");
    setStartDateOverride(null);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, [onExpandedChange]);

  const finishContent = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    contentBeforeEditRef.current = null;
    setContentFocused(false);
    window.requestAnimationFrame(() => descriptionToggleRef.current?.focus({ preventScroll: true }));
  }, []);

  const cancelContent = useCallback(() => {
    const previous = contentBeforeEditRef.current;
    if (previous) {
      setDescription(previous.description);
      setDescriptionFormat(previous.format);
      setDescriptionOpen(previous.open);
    }
    contentBeforeEditRef.current = null;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    setContentFocused(false);
    window.requestAnimationFrame(() => descriptionToggleRef.current?.focus({ preventScroll: true }));
  }, []);

  const hideClassification = useCallback(() => {
    setClassificationOpen(false);
    classificationToggleRef.current?.focus({ preventScroll: true });
  }, []);

  const openContent = () => {
    const mobile = window.matchMedia("(max-width: 699px)").matches;
    if (mobile) contentBeforeEditRef.current = { description, format: descriptionFormat, open: descriptionOpen };
    flushSync(() => {
      setDescriptionOpen(mobile ? true : !descriptionOpen);
      setContentFocused(mobile);
      if (mobile) setClassificationOpen(false);
    });
    if (mobile) contentEditorRef.current?.focusEnd();
  };

  useLayoutEffect(() => {
    if (!expanded || !backdropRef.current) return;
    return lockDetailScroll(backdropRef.current, window.matchMedia("(max-width: 699px)").matches);
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const visualViewport = window.visualViewport;

    const revealInput = () => {
      const activeElement = document.activeElement;
      if (activeElement !== inputRef.current && activeElement && backdropRef.current?.contains(activeElement)) return;
      inputRef.current?.focus({ preventScroll: true });
      window.requestAnimationFrame(() => {
        if (document.activeElement === inputRef.current) inputRef.current?.scrollIntoView({ block: "center", inline: "nearest" });
      });
    };

    const fitOverlayToMobileViewport = () => {
      const backdrop = backdropRef.current;
      if (!backdrop || !visualViewport || !window.matchMedia("(max-width: 699px)").matches) return;
      backdrop.style.setProperty("--quick-viewport-top", `${visualViewport.offsetTop}px`);
      backdrop.style.setProperty("--quick-viewport-height", `${visualViewport.height}px`);
      const keyboardOpen = visualViewport.scale === 1 && window.innerHeight - visualViewport.height > 120;
      backdrop.style.setProperty("--quick-bottom", keyboardOpen ? "12px" : "calc(16px + env(safe-area-inset-bottom))");
      window.requestAnimationFrame(() => {
        if (document.activeElement === inputRef.current) inputRef.current?.scrollIntoView({ block: "center", inline: "nearest" });
      });
    };

    fitOverlayToMobileViewport();
    const focusFrame = window.requestAnimationFrame(revealInput);
    const keyboardTimer = window.setTimeout(() => {
      fitOverlayToMobileViewport();
      revealInput();
    }, 280);
    visualViewport?.addEventListener("resize", fitOverlayToMobileViewport);
    visualViewport?.addEventListener("scroll", fitOverlayToMobileViewport);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const controls = Array.from(backdropRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select, [contenteditable="true"]') ?? []).filter(el => el.getClientRects().length > 0);
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        return;
      }
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (window.matchMedia("(max-width: 699px)").matches && backdropRef.current?.querySelector(".focused-content")) cancelContent();
      else close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.clearTimeout(keyboardTimer);
      visualViewport?.removeEventListener("resize", fitOverlayToMobileViewport);
      visualViewport?.removeEventListener("scroll", fitOverlayToMobileViewport);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [close, expanded, cancelContent]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const invalidDateRange = !isValidDateRange(startDate, dueDate);
    if (!title.trim() || invalidDateRange || !hasUpcomingDate || contentLength(description) > CONTENT_LIMIT) return;
    const added = onAdd({
      id: createUuid(),
      type,
      title: title.trim(),
      ...normalizeContent(description, descriptionFormat),
      startDate: startDate || null,
      dueDate: dueDate || null,
      projectId: projectId || null,
      completedAt: null,
      archivedAt: null,
      isImportant: false,
      isUrgent: false,
      createdAt: new Date().toISOString(),
    });
    if (added) close();
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
        className={`quick-add quick-add-dialog ${contentFocused ? "focused-content" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-add-title"
        onKeyDown={(event) => {
          if (event.key === "Escape" && classificationOpen && window.matchMedia("(max-width: 699px)").matches) {
            event.preventDefault();
            event.stopPropagation();
            hideClassification();
          }
        }}
        onClick={(event) => event.stopPropagation()}
        onSubmit={submit}
      >
        <div className="quick-mobile-header">
          <h2>{type === "task" ? "Thêm task" : "Thêm ghi chú"}</h2>
        </div>
        <div className="quick-add-entry">
          <label className="quick-title-field">
            <span id="quick-add-title">{type === "task" ? "Tên Công Việc" : "Tên Ghi Chú"}</span>
            <input ref={inputRef} autoFocus maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={type === "task" ? "Bạn muốn hoàn thành điều gì?" : "Đặt tên ghi chú…"} aria-label="Tên mục" />
          </label>
          <div className="quick-add-entry-actions">
            <label className="note-toggle"><input type="checkbox" checked={type === "note"} onChange={(event) => {
              const nextType = event.target.checked ? "note" : "task";
              setType(nextType);
            }} />Ghi chú</label>
            <button
              ref={descriptionToggleRef}
              className="quick-description-toggle"
              type="button"
              aria-expanded={descriptionOpen}
              onClick={openContent}
            >
              <Icon name="description" size={16} />
              <span className="quick-description-desktop-label">{descriptionOpen ? "Ẩn Nội Dung" : "Thêm Nội Dung"}</span><span className="quick-description-mobile-label"><span>{descriptionOpen ? "Sửa " : "Thêm "}</span>Nội Dung</span>
            </button>
            <button ref={classificationToggleRef} type="button" className="quick-description-toggle quick-classification-toggle" aria-expanded={classificationOpen} aria-controls="quick-classification" onClick={(event) => {
              if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
              event.currentTarget.focus({ preventScroll: true });
              setClassificationOpen(open => !open);
            }}><Icon name="layers" size={16} />Phân Loại</button>
          </div>
        </div>
        <div className="quick-add-body">
          {descriptionOpen && (
            <div className="quick-description-field">
              <div className="quick-content-heading"><span>Nội Dung</span>{contentFocused && <div className="detail-edit-actions"><button type="button" className="detail-icon-action save quick-content-done" onClick={finishContent} aria-label="Lưu Nội dung" title="Lưu Nội dung"><Icon name="check" size={18} /></button><button type="button" className="detail-icon-action cancel quick-content-cancel" onClick={cancelContent} aria-label="Hủy Nội dung" title="Hủy Nội dung"><Icon name="close" size={18} /></button></div>}</div>
              <button type="button" className="quick-description-preview" onClick={openContent} aria-label="Sửa Nội dung thêm nhanh"><span>{description || "Chưa có nội dung"}</span><Icon name="edit" size={17} /></button>
              <ContentEditor focusHandle={contentEditorRef} onCancel={contentFocused ? cancelContent : undefined} value={description} format={descriptionFormat} label="Nội dung" onChange={(content) => { setDescription(content.description ?? ""); setDescriptionFormat(content.descriptionFormat); }} />
            </div>
          )}
          {startDate && dueDate && startDate > dueDate && <p className="form-error quick-date-error">Ngày đến hạn không thể trước ngày bắt đầu.</p>}
          {!hasUpcomingDate && <p className="form-error quick-date-error">Chọn ngày bắt đầu hoặc ngày đến hạn trong ba ngày sắp tới.</p>}
        </div>
        <div className={`quick-add-controls ${classificationOpen ? "classification-open" : ""}`}>
          <div id="quick-classification" className={`quick-classification ${classificationOpen ? "is-open" : ""}`}>
            <div className="quick-classification-heading"><button type="button" className="icon-button" aria-label="Ẩn Phân Loại" onClick={hideClassification}><Icon name="close" size={18} /></button></div>
            <div className="quick-classification-fields">
              <label className="quick-add-field"><span>Ngày Bắt Đầu</span><span className="quick-add-control"><Icon name="play" size={16} /><input type="date" max={dueDate || undefined} value={startDate} onChange={(event) => setStartDateOverride(event.target.value)} /></span></label>
              <label className="quick-add-field"><span>Ngày Đến Hạn</span><span className="quick-add-control"><Icon name="flag" size={16} /><input type="date" min={startDate || undefined} value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></span></label>
              <label className="quick-add-field quick-add-project"><span>Dự án</span><span className="quick-add-control"><span className="project-dot empty" /><select aria-label="Dự án" value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">Không có dự án</option>{projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select></span></label>
            </div>
          </div>
          <div className="quick-add-actions"><button type="button" className="text-button" onClick={close}><Icon name="arrow-left" size={18} />Hủy</button><button className="primary-button" disabled={!title.trim() || !hasUpcomingDate || Boolean(startDate && dueDate && startDate > dueDate)}><Icon name="plus" size={18} />Thêm</button></div>
        </div>
      </form>
    </div>
  );
}

export function DateStrip({ selected, today, onSelect }: { selected: string; today: string; onSelect: (date: string) => void }) {
  const dates = Array.from({ length: 7 }, (_, index) => addCalendarDays(selected, index - 3));
  return (
    <div className="date-strip-wrap">
      <div className="date-strip">
        {dates.map((date) => {
          const object = new Date(`${date}T12:00:00Z`);
          return <button key={date} className={date === selected ? "selected" : ""} onClick={() => onSelect(date)}><small>{formatShortWeekday(date)}</small><strong>{object.getUTCDate()}</strong></button>;
        })}
      </div>
      {selected !== today && <button className="today-button" onClick={() => onSelect(today)}>Về hôm nay</button>}
    </div>
  );
}
