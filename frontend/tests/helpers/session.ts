import fs from "node:fs";
import { expect, type Browser, type BrowserContext, type Page } from "@playwright/test";
import {
  APP_BASE_URL,
  QA_LOCALE_COOKIE,
  QA_PASSWORD,
  getAuthStatePath,
  qaUsers,
  type QaRole,
} from "./qa-data";

async function setEnglishLocale(context: BrowserContext) {
  await context.addCookies([
    {
      ...QA_LOCALE_COOKIE,
      url: APP_BASE_URL,
    },
  ]);
}

export async function loginAs(page: Page, role: QaRole) {
  const user = qaUsers[role];

  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(QA_PASSWORD);

  await Promise.all([
    page.waitForURL("**/app", { timeout: 15_000 }),
    page.getByRole("button", { name: "Sign In" }).click(),
  ]);

  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();

  return user;
}

export async function createUiAuthenticatedSession(browser: Browser, role: QaRole) {
  const context = await browser.newContext({ baseURL: APP_BASE_URL });
  await setEnglishLocale(context);
  const page = await context.newPage();

  await loginAs(page, role);

  return {
    context,
    page,
    user: qaUsers[role],
  };
}

export async function createAuthenticatedSession(browser: Browser, role: QaRole) {
  const authStatePath = getAuthStatePath(role);
  const context = await browser.newContext({
    baseURL: APP_BASE_URL,
    storageState: fs.existsSync(authStatePath) ? authStatePath : undefined,
  });
  await setEnglishLocale(context);
  const page = await context.newPage();

  if (fs.existsSync(authStatePath)) {
    await page.goto("/app");
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  } else {
    await loginAs(page, role);
  }

  return {
    context,
    page,
    user: qaUsers[role],
  };
}
