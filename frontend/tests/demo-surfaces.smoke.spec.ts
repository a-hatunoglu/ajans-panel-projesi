import { expect, test } from "@playwright/test";
import { qaFixture, resetQaDataset } from "./helpers/qa-data";
import { createAuthenticatedSession } from "./helpers/session";

test.beforeEach(() => {
  resetQaDataset();
});

test("owner dashboard loads with stats and populated sections", async ({
  browser,
}) => {
  const session = await createAuthenticatedSession(browser, "owner");

  await session.page.goto("/app");
  await expect(
    session.page.getByRole("heading", { name: "Overview" }),
  ).toBeVisible();

  // Stats section should render (not first-run empty state)
  await expect(
    session.page.getByText("Active Companies", { exact: true }),
  ).toBeVisible();

  // At least one of the operational sections should be visible
  await expect(
    session.page.getByRole("heading", { name: "Needs Attention" }).or(
      session.page.getByRole("heading", { name: "Upcoming Schedule" }),
    ).first(),
  ).toBeVisible();

  await session.context.close();
});

test("owner companies list shows both seeded companies", async ({
  browser,
}) => {
  const session = await createAuthenticatedSession(browser, "owner");

  await session.page.goto("/app/companies");
  await expect(
    session.page.getByRole("heading", { name: "Companies" }),
  ).toBeVisible();

  await expect(
    session.page.getByText(qaFixture.company.name),
  ).toBeVisible();
  await expect(
    session.page.getByText(qaFixture.company2.name),
  ).toBeVisible();

  await session.context.close();
});

test("owner contents list shows seeded contents with pagination", async ({
  browser,
}) => {
  const session = await createAuthenticatedSession(browser, "owner");

  await session.page.goto("/app/contents");
  await expect(
    session.page.getByRole("heading", { name: "Contents" }),
  ).toBeVisible();

  // At least one seeded content should be visible
  await expect(
    session.page.getByText(qaFixture.contents.draft.title).or(
      session.page.getByText(qaFixture.contents.published.title),
    ),
  ).toBeVisible();

  // Pagination indicator should be visible (seeded data exceeds 0)
  await expect(
    session.page.getByText(/Showing \d+-\d+ of \d+/),
  ).toBeVisible();

  await session.context.close();
});

test("owner activity page shows seeded activity logs", async ({
  browser,
}) => {
  const session = await createAuthenticatedSession(browser, "owner");

  await session.page.goto("/app/activity");
  await expect(
    session.page.getByRole("heading", { name: "Global Activity Stream" }),
  ).toBeVisible();

  // At least one seeded actor name should be visible in the activity list
  await expect(
    session.page.getByText("Enes Owner").or(
      session.page.getByText("Ece Editor"),
    ).first(),
  ).toBeVisible();

  // Pagination should be visible (10 seeded logs)
  await expect(
    session.page.getByText(/Showing \d+-\d+ of \d+/),
  ).toBeVisible();

  await session.context.close();
});
