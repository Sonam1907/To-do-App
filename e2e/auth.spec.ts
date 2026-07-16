import { test, expect } from "@playwright/test";
import { uniqueTestEmail, signUp, deleteTestUser, userExists, TEST_PASSWORD } from "./helpers";

test.describe("authentication", () => {
  test("redirects an unauthenticated visitor from / to /login", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL("**/login");
  });

  test("signup logs the user in immediately and persists the account", async ({ page }) => {
    const email = uniqueTestEmail("auth-signup");
    await signUp(page, email);
    await expect(page.locator("text=" + email)).toBeVisible();

    expect(await userExists(email)).toBe(true);

    await deleteTestUser(email);
  });

  test("logging out then back in works, and rejects a wrong password", async ({ page }) => {
    const email = uniqueTestEmail("auth-login");
    await signUp(page, email);

    await page.click('button:has-text("Log out")');
    await page.waitForSelector("text=Log in");

    // wrong password
    await page.fill("#email", email);
    await page.fill("#password", "wrongpassword");
    await page.click('button[type="submit"]');
    await page.waitForSelector("text=Invalid email or password.");

    // correct password
    await page.fill("#email", email);
    await page.fill("#password", TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForSelector("text=Inbox");

    await deleteTestUser(email);
  });
});
