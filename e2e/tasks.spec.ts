import { test, expect } from "@playwright/test";
import { uniqueTestEmail, signUp, deleteTestUser } from "./helpers";

test.describe("task CRUD, priority, labels, due dates, subtasks", () => {
  let email: string;

  test.beforeEach(async ({ page }) => {
    email = uniqueTestEmail("tasks");
    await signUp(page, email);
  });

  test.afterEach(async () => {
    await deleteTestUser(email);
  });

  test("create, complete, and delete a task", async ({ page }) => {
    await page.fill('input[name="title"]', "Buy groceries");
    await page.click('main button:has-text("Add")');
    await page.waitForSelector("text=Buy groceries");

    const row = page.locator('li:has-text("Buy groceries")');
    await row.locator('[role="checkbox"]').click();
    await expect(row.locator("span", { hasText: "Buy groceries" })).toHaveClass(/line-through/);

    await row.locator('button:has-text("Delete")').click();
    await expect(page.locator("text=Buy groceries")).toHaveCount(0);
  });

  test("set priority and labels at creation, then change priority afterward", async ({
    page,
  }) => {
    await page.fill('input[name="title"]', "Urgent report");
    await page.click('form[action] [role="combobox"], form button:has-text("Medium")');
    await page.click('[role="option"]:visible:has-text("Urgent")');
    await page.fill('input[name="labels"]', "work, deadline");
    await page.click('main button:has-text("Add")');
    await page.waitForSelector("text=Urgent report");

    const row = page.locator('li:has-text("Urgent report")');
    await expect(row.locator("text=work")).toBeVisible();
    await expect(row.locator("text=deadline")).toBeVisible();
    await expect(row.locator('button:has-text("Urgent")')).toBeVisible();

    await row.locator('button:has-text("Urgent")').click();
    await page.click('[role="option"]:visible:has-text("Low")');
    await expect(row.locator('button:has-text("Low")')).toBeVisible();
  });

  test("adding a subtask nests it under its parent, not as a top-level task", async ({
    page,
  }) => {
    await page.fill('input[name="title"]', "Plan trip");
    await page.click('main button:has-text("Add")');
    await page.waitForSelector("text=Plan trip");

    const row = page.locator('li:has-text("Plan trip")');
    await row.locator('input[name="title"]').fill("Book flights");
    await row.locator('button:has-text("Add")').click();
    await page.waitForSelector("text=Book flights");

    const topLevelCount = await page.locator("ul.flex.flex-col.gap-2 > li").count();
    expect(topLevelCount).toBe(1);
  });
});
