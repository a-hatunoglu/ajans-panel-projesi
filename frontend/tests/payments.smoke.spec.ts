import { expect, test } from "@playwright/test";
import { qaFixture, resetQaDataset } from "./helpers/qa-data";
import { createAuthenticatedSession } from "./helpers/session";

test.beforeEach(() => {
  resetQaDataset();
});

test("admin can load the global payments surface while clients stay restricted", async ({
  browser,
}) => {
  const adminSession = await createAuthenticatedSession(browser, "admin");

  await adminSession.page.goto("/app/payments");
  await expect(
    adminSession.page.getByRole("heading", { name: "Payments" }),
  ).toBeVisible();

  await adminSession.page
    .getByLabel("Client")
    .selectOption(qaFixture.company.id);
  await adminSession.page.getByLabel("Status").selectOption("pending");

  const seededPaymentRow = adminSession.page.locator("div").filter({
    hasText: "Atlas Local Dev",
  }).filter({
    hasText: "Apr 12, 2026",
  }).filter({
    hasText: "TRY 12,500.00",
  }).first();

  await expect(
    seededPaymentRow,
  ).toBeVisible();
  await expect(
    adminSession.page.getByText(/Showing \d+-\d+ of \d+/),
  ).toBeVisible();

  await adminSession.context.close();

  const clientSession = await createAuthenticatedSession(browser, "client");

  await clientSession.page.goto("/app/payments");
  await expect(clientSession.page.getByText("Access Restricted")).toBeVisible();
  await expect(
    clientSession.page.getByText(
      "Payment records are limited to owners and admins.",
    ),
  ).toBeVisible();

  await clientSession.context.close();
});
