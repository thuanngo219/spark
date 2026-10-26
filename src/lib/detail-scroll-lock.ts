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

export function lockDetailScroll(backdrop: HTMLElement) {
  const body = document.body;
  const root = document.documentElement;
  const x = window.scrollX;
  const y = window.scrollY;
  const previousFrozenY = frozenScrollY;
  const restoreBody = preserveStyles(body, ["position", "top", "left", "width", "overflow"]);
  const restoreRoot = preserveStyles(root, ["overflow", "overscroll-behavior"]);
  const background = Array.from(backdrop.parentElement?.children ?? [])
    .filter((element): element is HTMLElement => element instanceof HTMLElement && element.matches("main, aside, .mobile-dock, .mobile-floating-controls"))
    .map(element => ({ element, inert: element.inert }));

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

  return () => {
    for (const { element, inert } of background) element.inert = inert;
    restoreBody();
    restoreRoot();
    frozenScrollY = previousFrozenY;
    window.scrollTo({ left: x, top: y, behavior: "instant" });
  };
}
