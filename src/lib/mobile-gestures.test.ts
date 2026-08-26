import { describe, expect, it } from "vitest";
import { createItemClickGuard, resolveItemContentTap, resolveItemSwipe, shouldOpenMobileSidebar } from "./mobile-gestures";

describe("item content tap with a shared action tray", () => {
  it("opens details with one tap when no tray is open", () => {
    expect(resolveItemContentTap(null, true)).toBe("open-details");
  });

  it.each(["same-item", "another-item"])("only closes an open tray belonging to %s", (openId) => {
    expect(resolveItemContentTap(openId, true)).toBe("close-actions");
    expect(resolveItemContentTap(null, true)).toBe("open-details");
  });

  it("does not block desktop details with a hidden mobile tray", () => {
    expect(resolveItemContentTap("some-item", false)).toBe("open-details");
  });
});

describe("mobile item single-tap guard", () => {
  it("allows the first click of an ordinary tap", () => {
    const guard = createItemClickGuard();
    guard.beginPointer();
    expect(guard.shouldSuppressClick(1)).toBe(false);
  });

  it.each(["swipe", "scroll", "pointer cancellation"])("blocks compatibility clicks after %s", () => {
    const guard = createItemClickGuard();
    guard.beginPointer();
    guard.blockPointerClick();
    expect(guard.shouldSuppressClick(1)).toBe(true);
    // Late/repeated compatibility clicks cannot open or mutate the item either.
    expect(guard.shouldSuppressClick(2)).toBe(true);
  });

  it.each([true, false])("allows the very next tap whether the swipe emitted a click (%s)", (emittedClick) => {
    const guard = createItemClickGuard();
    guard.beginPointer();
    guard.blockPointerClick();
    if (emittedClick) expect(guard.shouldSuppressClick(1)).toBe(true);
    guard.beginPointer();
    expect(guard.shouldSuppressClick(1)).toBe(false);
  });

  it("preserves keyboard and assistive-technology activation after a swipe", () => {
    const guard = createItemClickGuard();
    guard.blockPointerClick();
    expect(guard.shouldSuppressClick(0)).toBe(false);
  });
});

describe("mobile item gestures", () => {
  it("opens the action tray after a deliberate left swipe", () => {
    expect(resolveItemSwipe(-72, 8, false)).toBe("open-actions");
  });

  it("does not assign an item action to a right swipe", () => {
    expect(resolveItemSwipe(58, 6, false)).toBe("closed");
  });

  it("does not turn vertical scrolling into an item action", () => {
    expect(resolveItemSwipe(-62, 70, false)).toBe("closed");
  });

  it("closes an open action tray with a right swipe", () => {
    expect(resolveItemSwipe(50, 4, true)).toBe("closed");
  });
});

describe("mobile sidebar gesture", () => {
  it("opens for a horizontal drag from the left edge", () => {
    expect(shouldOpenMobileSidebar(76, 12)).toBe(true);
  });

  it("does not open during a mostly vertical scroll", () => {
    expect(shouldOpenMobileSidebar(72, 64)).toBe(false);
  });
});
