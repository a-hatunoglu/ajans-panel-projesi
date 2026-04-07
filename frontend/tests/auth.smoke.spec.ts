import { expect, test } from "@playwright/test";
import { getAuthStatePath, qaFixture, resetQaDataset } from "./helpers/qa-data";
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
  await expect(session.page.locator("header").first()).toContainText(
    session.user.email,
  );
  await session.context.storageState({ path: getAuthStatePath("designer") });

  await session.context.close();
});
