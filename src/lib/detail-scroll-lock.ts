let frozenScrollY: number | null = null;

// Header collapse must use the list position while a fixed body reports scrollY = 0.
export function pageScrollY() {
  return frozenScrollY ?? window.scrollY;
}

function preserveStyles(element: HTMLElement, properties: string[]) {
  const values = properties.map(property => [property, element.style.getPropertyValue(property), element.style.getPropertyPriority(property)]);
  return () => {
    for (const [property, value, priority] of values) {
      if (value) element.style.setProperty(property, value, priority);
      else element.style.removeProperty(property);
    }
  };
}

export function lockDetailScroll(backdrop: HTMLElement, isolateAncestors = false) {
  const body = document.body;
  const root = document.documentElement;
  const x = window.scrollX;
  const y = window.scrollY;
  const previousFrozenY = frozenScrollY;
  const restoreBody = preserveStyles(body, ["position", "top", "left", "width", "overflow"]);
  const restoreRoot = preserveStyles(root, ["overflow", "overscroll-behavior"]);
  const backgroundElements: HTMLElement[] = [];
  if (isolateAncestors) {
    // Quick-add is nested inside the list canvas: keep every sibling branch
    // inert without disabling the ancestors that contain the dialog itself.
    for (let branch: HTMLElement | null = backdrop; branch && branch !== body; branch = branch.parentElement) {
      for (const sibling of Array.from(branch.parentElement?.children ?? [])) {
        if (sibling !== branch && sibling instanceof HTMLElement && !sibling.matches("script, style, link")) backgroundElements.push(sibling);
      }
    }
  } else {
    backgroundElements.push(...Array.from(backdrop.parentElement?.children ?? []).filter((element): element is HTMLElement => element instanceof HTMLElement && element.matches("main, aside, .mobile-dock, .mobile-floating-controls")));
  }
  const background = backgroundElements.map(element => ({ element, inert: element.inert }));

  frozenScrollY = y;
  // overflow:hidden alone does not reliably lock the document with the iOS keyboard.
  body.style.position = "fixed";
  body.style.top = `${-y}px`;
  body.style.left = `${-x}px`;
  body.style.width = "100%";
  body.style.overflow = "hidden";
  root.style.overflow = "hidden";
  root.style.overscrollBehavior = "none";
  for (const { element } of background) element.inert = true;

  // iOS can pan the visual viewport even when overflow/overscroll are disabled,
  // especially if the editor has too little text to create a scroll range.
  let gesture: { x: number; y: number; time: number; target: Element; mode: "pending" | "scroll" | "selection" } | null = null;
  const startTouch = (event: TouchEvent) => {
    gesture = event.touches.length === 1 && event.target instanceof Element
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY, time: performance.now(), target: event.target, mode: "pending" }
      : null;
  };
  const moveTouch = (event: TouchEvent) => {
    if (!gesture || event.touches.length !== 1 || (!isolateAncestors && !backdrop.querySelector(".item-detail-sheet.editing-content, .quick-add-dialog.focused-content"))) return;
    const touch = event.touches[0];
    const dy = touch.clientY - gesture.y;
    const dx = touch.clientX - gesture.x;
    gesture.y = touch.clientY;
    gesture.x = touch.clientX;
    // Leave taps, horizontal gestures, pinch zoom and native text selection alone.
    const selection = window.getSelection();
    if (Math.abs(dy) < 2 || Math.abs(dx) >= Math.abs(dy) || (selection && !selection.isCollapsed && selection.toString().length > 0)) return;
    if (gesture.mode === "pending") gesture.mode = performance.now() - gesture.time > 450 ? "selection" : "scroll";
    if (gesture.mode === "selection") return;
    const input = gesture.target.closest<HTMLElement>(isolateAncestors ? ".content-editor-input, .quick-add-body" : ".content-editor-input");
    const maxScroll = input ? input.scrollHeight - input.clientHeight : 0;
    const atBoundary = !input || maxScroll <= 1 || (dy > 0 && input.scrollTop <= 1) || (dy < 0 && input.scrollTop >= maxScroll - 1);
    if (atBoundary && event.cancelable) event.preventDefault();
  };
  const endTouch = () => { gesture = null; };
  backdrop.addEventListener("touchstart", startTouch, { passive: true });
  backdrop.addEventListener("touchmove", moveTouch, { passive: false });
  backdrop.addEventListener("touchend", endTouch);
  backdrop.addEventListener("touchcancel", endTouch);

  return () => {
    backdrop.removeEventListener("touchstart", startTouch);
    backdrop.removeEventListener("touchmove", moveTouch);
    backdrop.removeEventListener("touchend", endTouch);
    backdrop.removeEventListener("touchcancel", endTouch);
    for (const { element, inert } of background) element.inert = inert;
    restoreBody();
    restoreRoot();
    frozenScrollY = previousFrozenY;
    window.scrollTo({ left: x, top: y, behavior: "instant" });
  };
}
