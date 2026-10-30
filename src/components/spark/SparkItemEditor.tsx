"use client";

import { ProjectSelect } from "@/components/ProjectSelect";
import { flushSync } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ContentEditor, { type ContentEditorHandle } from "@/components/ContentEditor";
import { FormattedContent } from "@/components/FormattedContent";
import { Icon } from "@/components/ui/Icon";
import { CONTENT_LIMIT, contentLength, normalizeContent } from "@/lib/content-format";
import { isValidDateRange } from "@/lib/dates";
import { installDetailMotion } from "@/lib/detail-motion";
import { lockDetailScroll } from "@/lib/detail-scroll-lock";
import type { Project, SparkItem } from "@/lib/types";

function DetailTitleField({ value, label, onChange, onSave, onCancel }: {
  value: string;
  label: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  // This field mounts only when the user opens inline editing.
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 699px)").matches);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 699px)");
    const change = () => setMobile(query.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);
  useLayoutEffect(() => {
    const field = textareaRef.current;
    if (!mobile || !field) return;
    const fit = () => {
      field.style.height = "0px";
      field.style.height = `${Math.max(28, field.scrollHeight)}px`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [mobile, value]);
  const shared = {
    autoFocus: true,
    maxLength: 100,
    value,
    "aria-label": label,
    onChange: (event: { target: { value: string } }) => onChange(event.target.value.replace(/[\r\n]+/g, " ")),
    onKeyDown: (event: { key: string; preventDefault: () => void }) => {
      if (event.key === "Enter") { event.preventDefault(); onSave(); }
      if (event.key === "Escape") onCancel();
    },
  };
  return mobile ? <textarea {...shared} ref={textareaRef} rows={1} /> : <input {...shared} />;
}

export function ItemEditor({ item, projects, onArchive, onClose, onDelete, onSave }: { item: SparkItem; projects: Project[]; onArchive: () => void; onClose: () => void; onDelete: () => void; onSave: (update: Partial<SparkItem>) => void }) {
  const backdropPointer = useRef<number | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentEditorRef = useRef<ContentEditorHandle>(null);
  const closeRef = useRef(onClose);
  const detailMotionRef = useRef<ReturnType<typeof installDetailMotion> | null>(null);
  useLayoutEffect(() => { closeRef.current = onClose; }, [onClose]);
  useLayoutEffect(() => {
    const backdrop = backdropRef.current;
    if (!backdrop) return;
    const mobile = window.matchMedia("(max-width: 699px)");
    const viewport = window.visualViewport;
    let layoutWidth = window.innerWidth;
    let layoutHeight = window.innerHeight;
    backdrop.style.setProperty("--detail-layout-height", `${layoutHeight}px`);
    const motion = installDetailMotion(backdrop, () => closeRef.current());
    detailMotionRef.current = motion;
    const unlockScroll = lockDetailScroll(backdrop);
    const fitViewport = () => {
      if (window.innerWidth !== layoutWidth) {
        layoutWidth = window.innerWidth;
        layoutHeight = window.innerHeight;
        backdrop.style.setProperty("--detail-layout-height", `${layoutHeight}px`);
      }
      if (mobile.matches && viewport) {
        backdrop.style.setProperty("--detail-viewport-height", `${viewport.height}px`);
        backdrop.style.setProperty("--detail-viewport-top", `${viewport.offsetTop}px`);
        // iOS can retain the home-indicator inset above the keyboard. Ignore
        // small browser-chrome changes and pinch zoom; focus alone is not enough
        // because Done can dismiss the keyboard without blurring the editor.
        const keyboardOpen = Math.abs(viewport.scale - 1) < 0.01 && window.innerHeight - viewport.height > 120;
        if (keyboardOpen) backdrop.style.setProperty("--detail-content-bottom", "0px");
        else backdrop.style.removeProperty("--detail-content-bottom");
      } else {
        backdrop.style.removeProperty("--detail-viewport-height");
        backdrop.style.removeProperty("--detail-viewport-top");
        backdrop.style.removeProperty("--detail-content-bottom");
      }
    };
    fitViewport();
    const metadata = backdrop.querySelector<HTMLElement>(".detail-metadata");
    const fitCloseOverlay = () => {
      if (metadata) backdrop.style.setProperty("--detail-metadata-height", `${metadata.getBoundingClientRect().height}px`);
    };
    const metadataObserver = new ResizeObserver(fitCloseOverlay);
    if (metadata) {
      fitCloseOverlay();
      metadataObserver.observe(metadata);
    }
    mobile.addEventListener("change", fitViewport);
    window.addEventListener("resize", fitViewport);
    viewport?.addEventListener("resize", fitViewport);
    viewport?.addEventListener("scroll", fitViewport);
    return () => {
      motion.destroy();
      metadataObserver.disconnect();
      detailMotionRef.current = null;
      mobile.removeEventListener("change", fitViewport);
      window.removeEventListener("resize", fitViewport);
      viewport?.removeEventListener("resize", fitViewport);
      viewport?.removeEventListener("scroll", fitViewport);
      const focused = document.activeElement;
      if (focused instanceof HTMLElement && backdrop.contains(focused)) focused.blur();
      unlockScroll?.();
    };
  }, []);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [descriptionFormat, setDescriptionFormat] = useState(item.descriptionFormat ?? null);
  const [startDate, setStartDate] = useState(item.startDate ?? "");
  const [dueDate, setDueDate] = useState(item.dueDate ?? "");
  const [projectId, setProjectId] = useState(item.projectId ?? "");
  const [important, setImportant] = useState(item.isImportant);
  const [urgent, setUrgent] = useState(item.isUrgent);
  const [editingField, setEditingField] = useState<"title" | "content" | null>(null);
  const [dateError, setDateError] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const project = projects.find((entry) => entry.id === projectId);
  const closeDetail = () => detailMotionRef.current?.close();

  const saveTitle = (finishEditing = true) => {
    const value = title.trim();
    if (!value) { setTitleError(true); return false; }
    setTitleError(false);
    setTitle(value);
    onSave({ title: value });
    if (finishEditing) setEditingField(null);
    return true;
  };

  const saveContent = (finishEditing = true) => {
    if (contentLength(description) > CONTENT_LIMIT) return false;
    const content = normalizeContent(description, descriptionFormat);
    setDescription(content.description ?? "");
    setDescriptionFormat(content.descriptionFormat);
    onSave(content);
    if (finishEditing) setEditingField(null);
    return true;
  };
  const cancelContent = () => {
    setDescription(item.description ?? "");
    setDescriptionFormat(item.descriptionFormat ?? null);
    setEditingField(null);
  };

  const switchField = (field: "title" | "content" | null) => {
    if (editingField === field) return;
    if (editingField === "title" && !saveTitle()) return;
    if (editingField === "content" && !saveContent()) return;
    if (field === "content") {
      // Mount and focus before leaving the user gesture so iOS opens its keyboard.
      flushSync(() => setEditingField(field));
      contentEditorRef.current?.focusEnd();
    } else setEditingField(field);
  };
  const saveDates = (start: string, due: string) => {
    setStartDate(start); setDueDate(due);
    const invalid = !isValidDateRange(start, due);
    setDateError(invalid);
    if (!invalid) onSave({ startDate: start || null, dueDate: due || null });
  };

  const titleMarker = item.type === "task" ? (
    <button
      type="button"
      className="detail-title-marker detail-status-toggle"
      role="checkbox"
      aria-checked={Boolean(item.completedAt)}
      aria-label={item.completedAt ? "Đánh dấu chưa xong" : "Hoàn thành task"}
      onClick={() => {
        if (editingField === "title" && !saveTitle()) return;
        if (editingField === "content" && !saveContent()) return;
        onSave({ completedAt: item.completedAt ? null : new Date().toISOString() });
      }}
    >
      <span className={`detail-status-box ${item.completedAt ? "checked" : ""}`} aria-hidden="true">
        {item.completedAt && <Icon name="check" size={15} />}
      </span>
    </button>
  ) : (
    <span className="detail-title-marker" role="img" aria-label="Ghi chú">
      <span className="note-mark" aria-hidden="true" />
    </span>
  );

  return (
    <div
      ref={backdropRef}
      className="dialog-backdrop item-detail-backdrop"
      onPointerDownCapture={(event) => {
        // A selection dragged out of the sheet can produce a click on the backdrop.
        backdropPointer.current = event.isPrimary && event.button === 0 && event.target === event.currentTarget ? event.pointerId : null;
      }}
      onPointerUpCapture={(event) => {
        if (event.pointerId !== backdropPointer.current || event.button !== 0 || event.target !== event.currentTarget) backdropPointer.current = null;
      }}
      onPointerCancelCapture={() => { backdropPointer.current = null; }}
      onClick={(event) => {
        const dismiss = backdropPointer.current !== null && event.target === event.currentTarget;
        backdropPointer.current = null;
        if (dismiss && !window.matchMedia("(max-width: 699px)").matches) closeDetail();
      }}
    >
      <section className={`editor-sheet item-detail-sheet ${editingField === "content" ? "editing-content" : editingField === "title" ? "editing-title" : ""}`} role="dialog" aria-modal="true" aria-label={editingField === "content" ? "Nội dung" : title} onClick={(event) => event.stopPropagation()}>
        <div className="detail-main">
          <div className="detail-main-inner">
            <div className="detail-content">
              <section className={`detail-text-block ${editingField === "title" ? "editing" : ""}`}>
                {editingField === "title" ? (
                  <>
                    <div className="detail-inline-editor detail-title-row">
                      {titleMarker}
                      <DetailTitleField value={title} label={item.type === "task" ? "Tên task" : "Tên ghi chú"} onChange={setTitle} onSave={() => saveTitle()} onCancel={() => { setTitle(item.title); setTitleError(false); setEditingField(null); }} />
                      <div className="detail-edit-actions">
                        <button type="button" className="detail-icon-action save" onClick={() => saveTitle()} aria-label="Lưu"><Icon name="check" size={18} /></button>
                        <button type="button" className="detail-icon-action cancel" onClick={() => { setTitle(item.title); setTitleError(false); setEditingField(null); }} aria-label="Hủy"><Icon name="close" size={18} /></button>
                      </div>
                    </div>
                    {titleError && <p className="form-error" role="status">Tên không được để trống.</p>}
                  </>
                ) : (
                  <div className="detail-read-row detail-title-row">
                    {titleMarker}
                    <p>{title}</p>
                    <button type="button" className="detail-icon-action edit" onClick={() => switchField("title")} aria-label="Sửa tên"><Icon name="edit" size={17} /></button>
                  </div>
                )}
              </section>

              <section className={`detail-text-block detail-description ${editingField === "content" ? "editing" : ""}`}>
                  <div className="detail-field-heading">
                    <span className="detail-label" id="item-content-title">Nội Dung</span>
                    {editingField === "content" ? (
                      <div className="detail-edit-actions">
                        <button type="button" className="detail-icon-action save" onClick={() => saveContent()} aria-label="Lưu Nội dung"><Icon name="check" size={18} /></button>
                        <button type="button" className="detail-icon-action cancel" onClick={cancelContent} aria-label="Hủy"><Icon name="close" size={18} /></button>
                      </div>
                    ) : (
                      <button type="button" className="detail-icon-action edit" onClick={() => switchField("content")} aria-label="Sửa Nội dung"><Icon name="edit" size={17} /></button>
                    )}
                  </div>
                  {editingField === "content" ? (
                    <div className="detail-inline-editor">
                      <ContentEditor focusHandle={contentEditorRef} value={description} format={descriptionFormat} label={item.type === "task" ? "Nội dung task" : "Nội dung ghi chú"} onChange={(content) => { setDescription(content.description ?? ""); setDescriptionFormat(content.descriptionFormat); }} onCancel={cancelContent} />
                    </div>
                  ) : (
                    <div className="detail-read-row align-start">
                      <div className={`formatted-content ${description ? "" : "empty"}`}>{description ? <FormattedContent value={description} format={descriptionFormat} /> : "Chưa có nội dung"}</div>
                    </div>
                  )}
              </section>
            </div>
          </div>
        </div>
        {dateError && <p className="form-error detail-date-error" role="status">Ngày đến hạn không thể trước ngày bắt đầu. Thay đổi ngày chưa được lưu.</p>}
        <div className="editor-header"><button type="button" className="icon-button detail-close-button" onClick={closeDetail}><span className="detail-close-desktop"><Icon name="close" size={16} /><span>Đóng</span></span><span className="detail-close-mobile"><Icon name="arrow-left" size={16} /><span>QUAY LẠI</span></span></button></div>
        <div className="detail-metadata" aria-label="Thông tin mục" onFocusCapture={() => {
          // Save without moving the focused control between pointerdown and click.
          if (editingField === "title") saveTitle(false);
          if (editingField === "content") saveContent(false);
        }}>
          <button type="button" className={`detail-meta-button icon-only important ${important ? "selected" : ""}`} title="Quan Trọng" aria-label="Quan Trọng" aria-pressed={important} onClick={() => { const value = !important; setImportant(value); onSave({ isImportant: value }); }}><Icon name="star" size={17} /></button>
          <button type="button" className={`detail-meta-button icon-only urgent ${urgent ? "selected" : ""}`} title="Ưu tiên" aria-label="Ưu tiên" aria-pressed={urgent} onClick={() => { const value = !urgent; setUrgent(value); onSave({ isUrgent: value }); }}><Icon name="zap" size={17} /></button>
          <div className="detail-date-controls">
            <label className="detail-meta-control" title="Ngày Bắt Đầu">
              <Icon name="play" size={16} />
              <input type="date" max={dueDate || undefined} value={startDate} aria-label="Ngày bắt đầu" onChange={(event) => { const value = event.target.value; saveDates(value, dueDate); }} />
            </label>
            <label className="detail-meta-control" title="Ngày Đến Hạn">
              <Icon name="flag" size={16} />
              <input type="date" min={startDate || undefined} value={dueDate} aria-label="Ngày đến hạn" onChange={(event) => { const value = event.target.value; saveDates(startDate, value); }} />
            </label>
          </div>
          <div className="detail-project-actions">
            <label className="detail-meta-control project" title="Dự án">
              <span className={`project-dot ${project ? "" : "empty"}`} style={project ? { background: project.color } : undefined} />
              <ProjectSelect value={project?.id ?? ""} projects={projects.filter(entry => !entry.archivedAt || entry.id === projectId)} onChange={value => { setProjectId(value); onSave({ projectId: value || null }); }} />
            </label>
            <div className="detail-item-actions">
              {item.type === "note" && <button type="button" className="detail-meta-button archive" onClick={onArchive} aria-label={item.archivedAt ? "Khôi phục ghi chú" : "Lưu trữ ghi chú"} title={item.archivedAt ? "Khôi phục" : "Lưu trữ"}><Icon name="archive" size={18} /><span className="detail-meta-label">{item.archivedAt ? "Khôi phục" : "Lưu trữ"}</span></button>}
              <span className="detail-meta-danger-separator" aria-hidden="true" />
              <button type="button" className="detail-meta-button delete" onClick={onDelete} aria-label="Xóa mục" title="Xóa"><Icon name="trash" size={18} /><span className="detail-meta-label">Xóa</span></button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
