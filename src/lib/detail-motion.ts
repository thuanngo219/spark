// Native browser motion only; shared CSS tokens control duration and easing.
export function installDetailMotion(backdrop: HTMLElement, onClose: () => void) {
  const mobile = window.matchMedia("(max-width: 699px)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let animation: Animation | null = null;
  let closing = false;
  let destroyed = false;
  let gesture: { x: number; y: number; time: number; offset: number; claimed: boolean } | null = null;

  const cancelMotion = () => {
    animation?.cancel();
    animation = null;
    for (const current of backdrop.getAnimations()) current.cancel();
  };
  const settle = (to: number, finish?: () => void) => {
    const style = getComputedStyle(backdrop);
    const from = style.transform;
    const easing = style.getPropertyValue("--ease").trim();
    const durationValue = style.animationDuration.split(",")[0];
    const duration = reduced.matches ? 0 : parseFloat(durationValue) * (durationValue.endsWith("ms") ? 1 : 1000);
    cancelMotion();
    backdrop.style.transform = `translate3d(${to}px, 0, 0)`;
    if (!duration) { finish?.(); return; }
    const next = backdrop.animate([{ transform: from }, { transform: backdrop.style.transform }], { duration, easing });
    animation = next;
    void next.finished.then(() => {
      if (destroyed || animation !== next) return;
      animation = null;
      finish?.();
    }, () => undefined);
  };
  const close = () => {
    if (closing || destroyed) return;
    closing = true;
    if (!mobile.matches) { onClose(); return; }
    gesture = null;
    // Keep the list locked until exit completes and dismiss the keyboard like ×.
    const active = document.activeElement;
    if (active instanceof HTMLElement && backdrop.contains(active)) active.blur();
    backdrop.inert = true;
    settle(backdrop.clientWidth, onClose);
  };
  const start = (event: TouchEvent) => {
    cancelGesture();
    if (!mobile.matches || closing || event.touches.length !== 1) { cancelGesture(); return; }
    const touch = event.touches[0];
    const selection = window.getSelection();
    if (touch.clientX > 24 || (selection && !selection.isCollapsed && selection.toString())) return;
    // Do not steal a tap on a control placed near the edge.
    if (event.target instanceof Element && event.target.closest("button, select, a")) return;
    gesture = { x: touch.clientX, y: touch.clientY, time: performance.now(), offset: 0, claimed: false };
  };
  const move = (event: TouchEvent) => {
    if (!gesture || event.touches.length !== 1) { cancelGesture(); return; }
    const dx = event.touches[0].clientX - gesture.x;
    const dy = event.touches[0].clientY - gesture.y;
    if (!gesture.claimed) {
      if ((Math.abs(dy) > 8 && Math.abs(dy) >= Math.abs(dx) / 1.25) || dx < -8 || performance.now() - gesture.time > 450) { gesture = null; return; }
      if (dx < 8 || dx <= Math.abs(dy) * 1.25) return;
      gesture.claimed = true;
      cancelMotion();
    }
    if (event.cancelable) event.preventDefault();
    event.stopPropagation();
    gesture.offset = Math.min(backdrop.clientWidth, Math.max(0, dx));
    if (!reduced.matches) backdrop.style.transform = `translate3d(${gesture.offset}px, 0, 0)`;
  };
  const end = (event: TouchEvent) => {
    if (!gesture?.claimed) { gesture = null; return; }
    if (event.cancelable) event.preventDefault();
    event.stopPropagation();
    const dismiss = gesture.offset >= Math.max(72, backdrop.clientWidth * .25);
    gesture = null;
    if (dismiss) close();
    else settle(0);
  };
  const cancelGesture = () => {
    if (gesture?.claimed && !closing) settle(0);
    gesture = null;
  };
  const breakpoint = () => {
    if (mobile.matches) return;
    gesture = null;
    cancelMotion();
    backdrop.style.removeProperty("transform");
    if (closing) onClose();
  };
  backdrop.addEventListener("touchstart", start, { passive: true });
  backdrop.addEventListener("touchmove", move, { passive: false });
  backdrop.addEventListener("touchend", end, { passive: false });
  backdrop.addEventListener("touchcancel", cancelGesture);
  mobile.addEventListener("change", breakpoint);

  return {
    close,
    destroy() {
      destroyed = true;
      cancelMotion();
      backdrop.removeEventListener("touchstart", start);
      backdrop.removeEventListener("touchmove", move);
      backdrop.removeEventListener("touchend", end);
      backdrop.removeEventListener("touchcancel", cancelGesture);
      mobile.removeEventListener("change", breakpoint);
    },
  };
}
