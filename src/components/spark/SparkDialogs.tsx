"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { ThemePreference } from "@/components/ThemePreference";
import { Icon } from "@/components/ui/Icon";
import { createSparkEmailOtpRequest } from "@/lib/auth-email";
import { lockDetailScroll } from "@/lib/detail-scroll-lock";
import { EMAIL_OTP_LENGTH, isCompleteEmailOtp, normalizeEmailOtp } from "@/lib/email-otp";
import { createUuid } from "@/lib/ids";
import { PROJECT_COLORS } from "@/lib/project-colors";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Project } from "@/lib/types";
import { syncStatusTitle, type CloudUser, type SyncStatus } from "./shared";

const projectColors = PROJECT_COLORS;

function useDialogControls(onClose: () => void, focusInput = true) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const [previous] = useState(() => typeof document !== "undefined" && document.activeElement instanceof HTMLElement ? document.activeElement : null);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const dialog = dialogRef.current;
    const controls = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), [tabindex="0"]') ?? []);
    if (!dialog?.contains(document.activeElement)) ((focusInput ? dialog?.querySelector<HTMLInputElement>('input:not([disabled])') : null) ?? controls()[0])?.focus();
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
  }, [previous, focusInput]);
  return dialogRef;
}

export function ArchivedProjects({ projects, onClose, onView, onEdit }: {
  projects: Project[];
  onClose: () => void;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
}) {
  const dialogRef = useDialogControls(onClose);
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

export function ProjectEditor({ project, itemCount, onArchive, onDelete, onClose, onSave }: {
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
  const dialogRef = useDialogControls(onClose);
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

function useUtilityScreen(onClose: () => void) {
  const dialogRef = useDialogControls(onClose, false);
  // Release inert/scroll in layout cleanup before dialog controls restore focus.
  useLayoutEffect(() => {
    const screen = dialogRef.current?.parentElement;
    if (!screen) return;
    const unlock = lockDetailScroll(screen);
    const viewport = window.visualViewport;
    const fitViewport = () => {
      if (!viewport || viewport.scale !== 1) return;
      screen.style.setProperty("--utility-top", `${viewport.offsetTop}px`);
      screen.style.setProperty("--utility-height", `${viewport.height}px`);
      const focused = document.activeElement;
      if (focused instanceof HTMLInputElement && screen.contains(focused)) {
        const bounds = focused.getBoundingClientRect();
        const headerBottom = screen.querySelector(".editor-header")?.getBoundingClientRect().bottom ?? viewport.offsetTop;
        if (bounds.bottom > viewport.offsetTop + viewport.height - 16 || bounds.top < headerBottom) {
          focused.scrollIntoView({ block: "end", inline: "nearest" });
        }
      }
    };
    fitViewport();
    viewport?.addEventListener("resize", fitViewport);
    viewport?.addEventListener("scroll", fitViewport);
    return () => {
      viewport?.removeEventListener("resize", fitViewport);
      viewport?.removeEventListener("scroll", fitViewport);
      unlock();
    };
  }, [dialogRef]);
  return dialogRef;
}

export function ShortcutHelp({
  onClose,
  projectLabelsEnabled,
  onProjectLabelsEnabledChange,
}: {
  onClose: () => void;
  projectLabelsEnabled: boolean;
  onProjectLabelsEnabledChange: (enabled: boolean) => void;
}) {
  const dialogRef = useUtilityScreen(onClose);
  const groups = [
    { id: "navigation", title: "Điều hướng", rows: [["T", "Hôm nay"], ["S", "Sắp tới"], ["D", "Theo ngày"], ["A", "Tất cả"], ["1–9", "Dự án theo thứ tự"]] },
    { id: "filter", title: "Lọc nội dung", rows: [["I", "Quan Trọng"], ["U", "Ưu tiên"], ["[", "Chỉ ghi chú"], ["]", "Chỉ task"], ["\\", "Tất cả nội dung"]] },
    { id: "actions", title: "Thao tác", rows: [["N", "Thêm task"], ["⌘/Ctrl + \\", "Sidebar"], ["?", "Trợ giúp"], ["Esc", "Đóng"]] },
    { id: "theme", title: "Giao diện", rows: [["<", "Sáng"], [">", "Tối"], ["M", "Theo hệ thống"]] },
  ];
  return (
    <div className="utility-screen">
      <div ref={dialogRef} className="shortcut-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcut-title">
        <div className="utility-content">
          <div className="editor-header">
            <div><span>Đi nhanh hơn</span><h2 id="shortcut-title">Phím tắt & hiển thị</h2></div>
            <button className="icon-button" onClick={onClose} aria-label="Đóng bảng phím tắt"><Icon name="close" /></button>
          </div>
          <div className="utility-body">
            <div className="utility-body-inner">
              <div className="shortcut-columns">
                {groups.map(group => <section className="shortcut-group" key={group.id} aria-labelledby={"shortcut-" + group.id}>
                  <h3 id={"shortcut-" + group.id}>{group.title}</h3>
                  {group.rows.map(([key, label]) => <div key={key}><span>{label}</span><kbd>{key}</kbd></div>)}
                </section>)}
              </div>
              <p className="shortcut-note">Phím tắt dùng với bàn phím và tạm dừng khi bạn đang nhập nội dung.</p>
              <ThemePreference />
              <section className="display-preference" aria-labelledby="project-label-preference">
                <span>
                  <strong id="project-label-preference">Mở tên dự án khi chạm</strong>
                  <small>Mở hoặc thu gọn đồng loạt trong mọi view.</small>
                </span>
                <button
                  className="preference-switch"
                  type="button"
                  role="switch"
                  aria-checked={projectLabelsEnabled}
                  aria-labelledby="project-label-preference"
                  onClick={() => onProjectLabelsEnabledChange(!projectLabelsEnabled)}
                >
                  <span aria-hidden="true" />
                </button>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SyncDialog({ configured, status, user, onClose, onSignedOut }: {
  configured: boolean;
  status: SyncStatus;
  user: CloudUser | null;
  onClose: () => void;
  onSignedOut: () => void;
}) {
  const dialogRef = useUtilityScreen(onClose);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError("");
    try {
      const client = await getSupabaseBrowserClient();
      if (!client) return;
      const result = await client.auth.signInWithOtp(
        createSparkEmailOtpRequest(
          email,
          process.env.NEXT_PUBLIC_SPARK_AUTH_REDIRECT_ORIGIN,
        ),
      );
      if (result.error) {
        setError(
          result.error.message.toLowerCase().includes("rate")
            ? "Bạn vừa yêu cầu mã. Hãy đợi một phút rồi thử lại."
            : "Chưa gửi được mã. Hãy kiểm tra email và thử lại.",
        );
      } else {
        setSent(true);
      }
    } catch (error) {
      console.error("Spark OTP request failed", error);
      setError("Chưa tải được kết nối đồng bộ. Hãy kiểm tra mạng và thử lại.");
    } finally {
      setSending(false);
    }
  };

  const verify = async (event: FormEvent) => {
    event.preventDefault();
    if (!isCompleteEmailOtp(token)) return;
    setVerifying(true);
    setError("");
    try {
      const client = await getSupabaseBrowserClient();
      if (!client) return;
      const result = await client.auth.verifyOtp({
        email: email.trim(),
        token,
        type: "email",
      });
      if (result.error) {
        setError("Mã không đúng hoặc đã hết hạn. Hãy dùng mã mới nhất trong email.");
      }
    } catch (error) {
      console.error("Spark OTP verification failed", error);
      setError("Chưa tải được kết nối đồng bộ. Hãy kiểm tra mạng và thử lại.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="utility-screen">
      <div ref={dialogRef} className="sync-dialog" role="dialog" aria-modal="true" aria-labelledby="sync-title">
        <div className="utility-content">
          <div className="editor-header">
            <div><span>ĐỒNG BỘ TỪ CLOUD</span><h2 id="sync-title">Dữ liệu luôn bên bạn, trên mọi thiết bị.</h2></div>
            <button className="icon-button" onClick={onClose} aria-label="Đóng"><Icon name="close" /></button>
          </div>
          <div className="utility-body">
            <div className="utility-body-inner">
              {!configured ? (
                <div className="sync-message warning"><Icon name="zap" /><div><strong>Chưa kết nối Supabase</strong><p>Thêm hai biến môi trường trong <code>.env.local</code> và chạy migration để bật đồng bộ.</p></div></div>
              ) : user ? (
                <>
                  <div className="sync-hero"><span><Icon name={status === "error" || status === "offline" ? "zap" : "check"} size={27} /></span><h3>{syncStatusTitle(status)}</h3><p>{status === "offline" || status === "error" ? "Mọi thay đổi vẫn được giữ trên thiết bị và sẽ tự thử lại; bạn không cần nhập lại." : "Task, note và dự án của bạn sẽ xuất hiện trên mọi browser sau khi đăng nhập bằng cùng email."}</p></div>
                  <div className="signed-in-row"><div><small>Tài khoản</small><strong>{user.email}</strong></div><button className="disconnect-button" onClick={onSignedOut}><Icon name="log-out" size={17} />Ngắt kết nối</button></div>
                </>
              ) : sent ? (
                <div className="sync-hero otp-step">
                  <span><Icon name="check" size={27} /></span>
                  <h3>Nhập mã trong email</h3>
                  <p>Mình đã gửi mã đăng nhập tới <strong>{email}</strong>. Nhập mã mới nhất ngay tại đây; không cần mở liên kết.</p>
                  <form className="sync-form" onSubmit={verify}>
                    <label className="field"><span>Mã đăng nhập gồm 6 số</span><input className="otp-input" name="otp" type="text" autoFocus autoComplete="one-time-code" inputMode="numeric" enterKeyHint="done" minLength={EMAIL_OTP_LENGTH} maxLength={EMAIL_OTP_LENGTH} pattern="[0-9]{6}" required value={token} onChange={(event) => setToken(normalizeEmailOtp(event.target.value))} placeholder="000000" aria-label="Mã đăng nhập gồm 6 chữ số" /></label>
                    {error && <p className="form-error">{error}</p>}
                    <button className="primary-button" disabled={verifying || !isCompleteEmailOtp(token)}>{verifying ? "Đang xác nhận…" : "Xác nhận và đồng bộ"}</button>
                  </form>
                  <button className="text-button" onClick={() => { setSent(false); setToken(""); setError(""); }}>Gửi lại hoặc dùng email khác</button>
                </div>
              ) : (
                <form className="sync-form" onSubmit={submit}><label className="field"><span>Email nhận mã đăng nhập</span><input type="email" required autoComplete="email" placeholder="ban@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /></label>{error && <p className="form-error">{error}</p>}<button className="primary-button" disabled={sending || !email.trim()}>{sending ? "Đang gửi…" : "Gửi mã và bật đồng bộ"}</button></form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
