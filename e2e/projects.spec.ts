import { test, expect } from "@playwright/test";
import { uniqueTestEmail, signUp, deleteTestUser } from "./helpers";

test.describe("projects", () => {
  let email: string;

  test.beforeEach(async ({ page }) => {
    email = uniqueTestEmail("projects");
    await signUp(page, email);
  });

  test.afterEach(async () => {
    await deleteTestUser(email);
  });

  test("tasks in a project don't leak into Inbox, and deleting the project keeps its tasks", async ({
    page,
  }) => {
    await page.fill('input[name="name"]', "Work");
    await page.click('aside button:has-text("+")');
    await page.waitForSelector('a:has-text("Work")');

    await page.fill('input[name="title"]', "Inbox task");
    await page.click('main button:has-text("Add")');
    await page.waitForSelector("text=Inbox task");

    await page.click('a:has-text("Work")');
    await page.waitForURL("**/projects/*");
    await page.fill('input[name="title"]', "Work task");
    await page.click('main button:has-text("Add")');
    await page.waitForSelector("text=Work task");
    await expect(page.locator("text=Inbox task")).toHaveCount(0);

    await page.click('button:has-text("Delete project")');
    await page.waitForURL((url) => !url.pathname.includes("/projects/"));
    await expect(page.locator("text=Inbox task")).toBeVisible();
    await expect(page.locator("text=Work task")).toBeVisible();
  });
});
