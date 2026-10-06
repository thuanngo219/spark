import { test as base, expect } from "@playwright/test";
import { getLocalDateKey } from "../../src/lib/dates";
import { seedData } from "../seed-data";

export const test = base.extend({
  page: async ({ page }, runPage) => {
    const fixture = seedData(getLocalDateKey());
    // Fixtures are intentional test data, not the untouched legacy demo pack.
    fixture.items = fixture.items.map((item, index) => ({ ...item, createdAt: new Date(Date.parse(item.createdAt) + index).toISOString() }));
    await page.addInitScript(data => {
      if (!sessionStorage.getItem("spark:test-fixture-seeded")) {
        localStorage.setItem("spark:data:v1", JSON.stringify(data));
        sessionStorage.setItem("spark:test-fixture-seeded", "1");
      }
    }, fixture);
    await runPage(page);
  },
});
export { expect };
