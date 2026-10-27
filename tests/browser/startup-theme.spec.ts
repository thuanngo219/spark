import { test, expect } from "./fixtures";

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  for (const initial of ["light", "dark"] as const) {
    for (const preference of ["system", initial] as const) {
      test(`reveal refreshes ${preference}/${initial} synchronously with motion ${reducedMotion}`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.emulateMedia({ colorScheme: initial, reducedMotion });
        await page.addInitScript(({ preference, initial }) => {
          localStorage.setItem("spark:theme:v1", preference);
          const record = { initialTheme: "", initialColor: "", refreshes: 0, theme: "", color: "", scheme: "", reveal: false };
          Object.assign(window, { revealThemeRecord: record });
          let revealing = false;
          const readyObserver = new MutationObserver(() => {
            if (document.querySelector(".startup-screen.is-ready")) {
              readyObserver.disconnect();
              record.initialTheme = document.documentElement.dataset.theme ?? "";
              record.initialColor = document.querySelector('meta[name="theme-color"]')?.getAttribute("content") ?? "";
              // OS changes during loading without delivering a media change event.
              const original = window.matchMedia.bind(window);
              window.matchMedia = query => {
                const result = original(query);
                if (query === "(prefers-color-scheme: dark)") {
                  Object.defineProperty(result, "matches", { configurable: true, value: initial === "light" });
                }
                return result;
              };
            }
          });
          readyObserver.observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
          document.addEventListener("animationstart", event => {
            if (event.animationName === "startup-reveal") revealing = true;
          }, true);
          window.addEventListener("spark:theme-change", () => { if (revealing) record.refreshes++; });
          // Next delegates React events to document; window runs after that handler.
          // A delayed refresh cannot pass this assertion, even by one frame.
          window.addEventListener("animationstart", event => {
            if (event.animationName !== "startup-reveal") return;
            record.theme = document.documentElement.dataset.theme ?? "";
            record.color = document.querySelector('meta[name="theme-color"]')?.getAttribute("content") ?? "";
            record.scheme = document.documentElement.style.colorScheme;
            record.reveal = true;
            revealing = false;
          });
        }, { preference, initial });
        await page.goto("/");
        await page.getByRole("region", { name: "Khởi động Spark" }).waitFor({ state: "hidden" });
        const record = await page.evaluate(() => (window as unknown as {
          revealThemeRecord: { initialTheme: string; initialColor: string; refreshes: number; theme: string; color: string; scheme: string; reveal: boolean };
        }).revealThemeRecord);
        const expected = preference === "system" ? initial === "light" ? "dark" : "light" : initial;
        expect(record).toEqual({
          initialTheme: initial, initialColor: initial === "light" ? "#f7f8fa" : "#121622",
          refreshes: 1, theme: expected, color: expected === "light" ? "#f7f8fa" : "#121622", scheme: expected, reveal: true,
        });
        await expect(page.locator(".app-shell")).not.toHaveAttribute("inert");
        await expect(page.locator(".app-shell")).toHaveCSS("color-scheme", expected);
      });
    }
  }
}
