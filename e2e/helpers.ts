import type { Page } from "@playwright/test";
import { Client } from "pg";

export function uniqueTestEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
}

export const TEST_PASSWORD = "correcthorse123";

export async function signUp(page: Page, email: string) {
  await page.goto("/signup");
  await page.fill("#email", email);
  await page.fill("#password", TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForSelector("text=Inbox");
}

// Uses the `pg` driver directly rather than the Prisma client: Playwright's
// own test-loading process can't handle the Prisma client's ESM-only
// generated code, so we avoid importing it here at all.
export async function deleteTestUser(email: string) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('DELETE FROM users WHERE email = $1', [email]);
  } finally {
    await client.end();
  }
}

export async function userExists(email: string): Promise<boolean> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const result = await client.query('SELECT 1 FROM users WHERE email = $1', [email]);
    return (result.rowCount ?? 0) > 0;
  } finally {
    await client.end();
  }
}
