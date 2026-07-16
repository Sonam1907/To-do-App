import { test, expect } from "@playwright/test";
import { uniqueTestEmail, signUp, deleteTestUser } from "./helpers";

async function countVisibleTasks(page: import("@playwright/test").Page): Promise<number> {
  return page.locator("ul.flex.flex-col.gap-2 > li").count();
}

test.describe("search and filtering", () => {
  let email: string;

  test.beforeEach(async ({ page }) => {
    email = uniqueTestEmail("search");
    await signUp(page, email);

    await page.fill('input[name="title"]', "Buy milk");
    await page.click('main button:has-text("Add")');
    await page.waitForSelector("text=Buy milk");

    await page.fill('input[name="title"]', "Finish report");
    await page.click('main button:has-text("Add")');
    await page.waitForSelector("text=Finish report");
  });

  test.afterEach(async () => {
    await deleteTestUser(email);
  });

  test("search narrows the list to matching titles", async ({ page }) => {
    expect(await countVisibleTasks(page)).toBe(2);

    await page.fill('input[name="q"]', "milk");
    await page.click('form[method="get"] button:has-text("Filter")');
    await expect(page.locator("text=Buy milk")).toBeVisible();
    expect(await countVisibleTasks(page)).toBe(1);
  });

  test("clearing filters restores the full list", async ({ page }) => {
    await page.fill('input[name="q"]', "milk");
    await page.click('form[method="get"] button:has-text("Filter")');
    expect(await countVisibleTasks(page)).toBe(1);

    await page.click('a:has-text("Clear")');
    await page.waitForURL("http://localhost:3000/");
    expect(await countVisibleTasks(page)).toBe(2);
  });
});
