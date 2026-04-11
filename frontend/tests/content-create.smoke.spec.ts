import { expect, test } from "@playwright/test";
import { createAuthenticatedSession } from "./helpers/session";
import { resetQaDataset } from "./helpers/qa-data";

test.beforeEach(() => {
  resetQaDataset();
});

test("editor can create a draft from contents and land on the new detail page", async ({
  browser,
}) => {
  const session = await createAuthenticatedSession(browser, "editor");
  const draftTitle = `[Smoke] Content Create ${Date.now()}`;

  await session.page.goto("/app/contents");
  await expect(
    session.page.getByRole("link", { name: "Create Content" }),
  ).toBeVisible();

  await session.page.getByRole("link", { name: "Create Content" }).click();

  await expect(
    session.page.getByRole("heading", { name: "New Content Draft" }),
  ).toBeVisible();
  await expect(
    session.page.getByRole("heading", { name: "Draft Setup" }),
  ).toBeVisible();

  await session.page.getByLabel("Title").fill(draftTitle);
  await expect(
    session.page.getByRole("button", { name: "Create Draft" }),
  ).toBeEnabled();

  await Promise.all([
    session.page.waitForURL(/\/app\/contents\/[^/]+$/),
    session.page.getByRole("button", { name: "Create Draft" }).click(),
  ]);

  await expect(
    session.page.getByRole("heading", { name: draftTitle }),
  ).toBeVisible();
  await expect(session.page.getByText("Draft", { exact: true })).toBeVisible();

  await session.context.close();
});

test("designer can create a draft with locked self-assignment", async ({
  browser,
}) => {
  const session = await createAuthenticatedSession(browser, "designer");
  const draftTitle = `[Smoke] Designer Content Create ${Date.now()}`;

  await session.page.goto("/app/contents");
  await expect(
    session.page.getByRole("link", { name: "Create Content" }),
  ).toBeVisible();

  await session.page.getByRole("link", { name: "Create Content" }).click();

  await expect(
    session.page.getByRole("heading", { name: "New Content Draft" }),
  ).toBeVisible();
  await expect(
    session.page.getByRole("heading", { name: "Draft Setup" }),
  ).toBeVisible();
  await expect(session.page.locator("#assignedDesignerId")).toHaveCount(0);
  await expect(session.page.getByRole("main").getByText("Deniz Designer")).toBeVisible();
  await expect(
    session.page.getByText("Your role assigns the designer field to you."),
  ).toBeVisible();

  await session.page.getByLabel("Title").fill(draftTitle);
  await expect(
    session.page.getByRole("button", { name: "Create Draft" }),
  ).toBeEnabled();

  await Promise.all([
    session.page.waitForURL(/\/app\/contents\/[^/]+$/),
    session.page.getByRole("button", { name: "Create Draft" }).click(),
  ]);

  await expect(
    session.page.getByRole("heading", { name: draftTitle }),
  ).toBeVisible();
  await expect(session.page.getByText("Draft", { exact: true })).toBeVisible();
  const workflowSection = session.page
    .locator("section")
    .filter({
      has: session.page.getByRole("heading", { name: "Workflow Context" }),
    });
  await expect(workflowSection.getByText("Deniz Designer")).toBeVisible();

  await session.context.close();
});

test("client cannot access the content-create surface", async ({ browser }) => {
  const session = await createAuthenticatedSession(browser, "client");

  await session.page.goto("/app/contents");
  await expect(
    session.page.getByRole("link", { name: "Create Content" }),
  ).toHaveCount(0);

  await session.page.goto("/app/contents/new");

  await expect(
    session.page.getByRole("heading", { name: "Access Restricted" }),
  ).toBeVisible();
  await expect(
    session.page.getByText(
      "Only owners, admins, editors, and designers can create content drafts.",
    ),
  ).toBeVisible();
  await expect(
    session.page.getByRole("heading", { name: "Draft Setup" }),
  ).toHaveCount(0);

  await session.context.close();
});
