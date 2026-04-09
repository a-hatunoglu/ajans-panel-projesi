import { expect, test } from "@playwright/test";
import { resetQaDataset } from "./helpers/qa-data";
import { createAuthenticatedSession } from "./helpers/session";

test.beforeEach(() => {
  resetQaDataset();
});

test("client is restricted from the activity page", async ({ browser }) => {
  const session = await createAuthenticatedSession(browser, "client");

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
