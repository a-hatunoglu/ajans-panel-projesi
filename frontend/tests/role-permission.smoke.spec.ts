import { expect, test } from "@playwright/test";
import { qaFixture, resetQaDataset } from "./helpers/qa-data";
import { createAuthenticatedSession } from "./helpers/session";

test.beforeEach(() => {
  resetQaDataset();
});

test("editor is blocked from the global payments page", async ({ browser }) => {
  const session = await createAuthenticatedSession(browser, "editor");

  await session.page.goto("/app/payments");
  await expect(
    session.page.getByText("Access Restricted"),
  ).toBeVisible();
  await expect(
    session.page.getByText(
      "Payment records are limited to owners and admins.",
    ),
  ).toBeVisible();
  await expect(
    session.page.getByRole("button", { name: "Add Payment" }),
  ).toHaveCount(0);

  await session.context.close();
});

test("editor sidebar does not show Payments or Activity links", async ({
  browser,
}) => {
  const session = await createAuthenticatedSession(browser, "editor");

  await session.page.goto("/app");
  await expect(
    session.page.getByRole("heading", { name: "Overview" }),
  ).toBeVisible();

  // Positive control: Contents link should be visible
  await expect(
    session.page.locator("nav a[href='/app/contents']"),
  ).toBeVisible();

  // Negative: Payments and Activity links must be absent
  await expect(
    session.page.locator("nav a[href='/app/payments']"),
  ).toHaveCount(0);
  await expect(
    session.page.locator("nav a[href='/app/activity']"),
  ).toHaveCount(0);

  await session.context.close();
});

test("client cannot see edit or schedule actions on content detail", async ({
  browser,
}) => {
  const session = await createAuthenticatedSession(browser, "client");

  // Draft content — client should NOT see Submit For Review
  await session.page.goto(`/app/contents/${qaFixture.contents.draft.id}`);
  await expect(
    session.page.getByRole("heading", {
      name: qaFixture.contents.draft.title,
    }),
  ).toBeVisible();
  await expect(
    session.page.getByRole("button", { name: "Submit For Review" }),
  ).toHaveCount(0);

  // Approved content — client should NOT see Schedule Content
  await session.page.goto(`/app/contents/${qaFixture.contents.approved.id}`);
  await expect(
    session.page.getByRole("heading", {
      name: qaFixture.contents.approved.title,
    }),
  ).toBeVisible();
  await expect(
    session.page.getByRole("link", { name: "Schedule Content" }),
  ).toHaveCount(0);
  await expect(
    session.page.getByRole("button", { name: "Schedule Content" }),
  ).toHaveCount(0);

  await session.context.close();
});

test("designer cannot see admin-only tabs on company detail", async ({
  browser,
}) => {
  const session = await createAuthenticatedSession(browser, "designer");

  await session.page.goto(`/app/companies/${qaFixture.company.id}`);
  await expect(
    session.page.getByRole("heading", { name: qaFixture.company.name }),
  ).toBeVisible();

  // Positive control: Overview tab should be visible
  await expect(
    session.page.getByRole("button", { name: "Overview" }),
  ).toBeVisible();

  // Negative: Admin-only tabs must be absent
  await expect(
    session.page.getByRole("button", { name: "Payments" }),
  ).toHaveCount(0);
  await expect(
    session.page.getByRole("button", { name: "Users" }),
  ).toHaveCount(0);
  await expect(
    session.page.getByRole("button", { name: "Activity" }),
  ).toHaveCount(0);

  await session.context.close();
});

test("editor is blocked from the global activity page", async ({
  browser,
}) => {
  const session = await createAuthenticatedSession(browser, "editor");

  await session.page.goto("/app/activity");
  await expect(
    session.page.getByRole("heading", { name: "Global Activity Stream" }),
  ).toBeVisible();
  await expect(
    session.page.getByText("Access Restricted"),
  ).toBeVisible();
  await expect(
    session.page.getByText(
      "Global activity records are limited to owners and admins.",
    ),
  ).toBeVisible();

  await session.context.close();
});
