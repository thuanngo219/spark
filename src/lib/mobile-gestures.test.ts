import { describe, expect, it } from "vitest";
import { resolveItemSwipe, shouldOpenMobileSidebar } from "./mobile-gestures";

describe("mobile item gestures", () => {
  it("toggles Important after a deliberate right swipe", () => {
    expect(resolveItemSwipe(72, 8, false)).toBe("toggle-important");
  });

  it("opens the action tray after a deliberate left swipe", () => {
    expect(resolveItemSwipe(-58, 6, false)).toBe("open-actions");
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
