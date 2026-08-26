export type ItemSwipeResult = "closed" | "open-actions";

const ITEM_HORIZONTAL_THRESHOLD = 48;
const OPEN_ROW_CLOSE_THRESHOLD = 42;

export function resolveItemContentTap(openSwipeItemId: string | null, isMobile: boolean) {
  return isMobile && openSwipeItemId !== null ? "close-actions" : "open-details";
}

// Keep swipe/scroll clicks blocked until a fresh pointer gesture starts.
// A timer can expire before a browser delivers its compatibility click.
export function createItemClickGuard() {
  let blocked = false;

  return {
    beginPointer() {
      blocked = false;
    },
    blockPointerClick() {
      blocked = true;
    },
    shouldSuppressClick(detail: number) {
      // Keyboard and assistive-technology activation have no pointer click count.
      return detail > 0 && blocked;
    },
  };
}

export function resolveItemSwipe(
  deltaX: number,
  deltaY: number,
  wasOpen: boolean,
): ItemSwipeResult {
  const horizontal = Math.abs(deltaX);
  const vertical = Math.abs(deltaY);

  if (horizontal <= vertical * 1.15) {
    return wasOpen ? "open-actions" : "closed";
  }

  if (wasOpen) {
    return deltaX > OPEN_ROW_CLOSE_THRESHOLD ? "closed" : "open-actions";
  }

  if (deltaX <= -ITEM_HORIZONTAL_THRESHOLD) return "open-actions";
  return "closed";
}

export function shouldOpenMobileSidebar(deltaX: number, deltaY: number) {
  return deltaX >= 68 && deltaX > Math.abs(deltaY) * 1.25;
}
