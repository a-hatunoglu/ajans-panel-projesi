import { expect, test } from "@playwright/test";
import { qaFixture, resetQaDataset } from "./helpers/qa-data";
import { createUiAuthenticatedSession } from "./helpers/session";

test.beforeEach(() => {
  resetQaDataset();
});

test("a seeded user can sign in and load protected app routes", async ({
  browser,
}) => {
  const session = await createUiAuthenticatedSession(browser, "designer");

  await session.page.goto(`/app/companies/${qaFixture.company.id}`);
  await expect(
    session.page.getByRole("heading", { name: qaFixture.company.name }),
  ).toBeVisible();

  await session.context.close();
});

test("user can initiate forgot password flow", async ({ page }) => {
  await page.goto("/login");
  await page.locator("a[href='/forgot-password']").click();
  
  await expect(page).toHaveURL(/\/forgot-password/);
  await expect(page.locator("input[name='email']")).toBeVisible();
  await page.locator("input[name='email']").fill("forgot@agencyos.app");
  
  await page.locator("button[type='submit']").click();
  
  // Prove stable success state mounts deterministically (check icon shows)
  await expect(page.locator("svg.lucide-check")).toBeVisible();
  await expect(page.locator("input[name='email']")).toBeHidden();
});

test("reset password token form handles invalid input without crash", async ({ page }) => {
  await page.goto("/reset-password?token=mock_token");
  
  await page.locator("input[name='password']").fill("SafePass123!");
  await page.locator("input[name='confirmPassword']").fill("SafePass123!");
  await page.locator("button[type='submit']").click();
  
  // Prove client context handles server rejection correctly
  await expect(page.locator(".text-red-500").first()).toBeVisible();
});

test("accept invite token form handles invalid input without crash", async ({ page }) => {
  await page.goto("/accept-invite?token=mock_token");
  
  await page.locator("input[name='password']").fill("SafePass123!");
  await page.locator("input[name='confirmPassword']").fill("SafePass123!");
  await page.locator("button[type='submit']").click();
  
  // Prove client context handles server rejection correctly
  await expect(page.locator(".text-red-500").first()).toBeVisible();
});
