import { expect, test } from "@playwright/test";
import { qaFixture, resetQaDataset } from "./helpers/qa-data";
import { createAuthenticatedSession } from "./helpers/session";

test.beforeEach(() => {
  resetQaDataset();
});

test("editor can submit a draft for review", async ({ browser }) => {
  const session = await createAuthenticatedSession(browser, "editor");

  await session.page.goto(`/app/contents/${qaFixture.contents.draft.id}`);
  await session.page.getByRole("button", { name: "Submit For Review" }).click();

  await expect(
    session.page.getByText("In Review", { exact: true }),
  ).toBeVisible();
  await expect(
    session.page.getByRole("button", { name: "Submit For Review" }),
  ).toHaveCount(0);

  await session.context.close();
});

test("client can request revision on in-review content", async ({ browser }) => {
  const session = await createAuthenticatedSession(browser, "client");
  const revisionComment = "Please tighten the caption before approval.";

  await session.page.goto(`/app/contents/${qaFixture.contents.inReview.id}`);
  await session.page
    .getByPlaceholder("Add a comment or revision note")
    .fill(revisionComment);
  await session.page.getByRole("button", { name: "Request Revision" }).click();

  await expect(
    session.page.getByText("Revision", { exact: true }),
  ).toBeVisible();
  await expect(session.page.getByText(revisionComment)).toBeVisible();

  await session.context.close();
});

test("editor can resubmit revision content for review", async ({ browser }) => {
  const session = await createAuthenticatedSession(browser, "editor");

  await session.page.goto(`/app/contents/${qaFixture.contents.revise.id}`);
  await session.page.getByRole("button", { name: "Submit For Review" }).click();

  await expect(
    session.page.getByText("In Review", { exact: true }),
  ).toBeVisible();

  await session.context.close();
});

test("owner can approve in-review content", async ({ browser }) => {
  const session = await createAuthenticatedSession(browser, "owner");
  const approvalComment = "Approved for scheduling.";

  await session.page.goto(`/app/contents/${qaFixture.contents.inReview.id}`);
  await session.page
    .getByPlaceholder("Add a comment or revision note")
    .fill(approvalComment);
  await session.page.getByRole("button", { name: "Approve" }).click();

  await expect(
    session.page.getByText("Approved", { exact: true }),
  ).toBeVisible();
  await expect(session.page.getByText(approvalComment)).toBeVisible();

  await session.context.close();
});

test("editor can schedule approved content", async ({ browser }) => {
  const session = await createAuthenticatedSession(browser, "editor");

  await session.page.goto(
    `/app/contents/${qaFixture.contents.approved.id}/schedule`,
  );
  await expect(
    session.page.getByRole("heading", { name: "Schedule Content" }),
  ).toBeVisible();
  await session.page
    .getByLabel("Scheduled Date & Time")
    .fill("2026-04-15T10:30");

  await Promise.all([
    session.page.waitForURL(`**/app/contents/${qaFixture.contents.approved.id}`),
    session.page.getByRole("button", { name: "Schedule Content" }).click(),
  ]);

  await expect(
    session.page.getByText("Scheduled", { exact: true }),
  ).toBeVisible();

  await session.context.close();
});

test("editor can publish scheduled content", async ({ browser }) => {
  const session = await createAuthenticatedSession(browser, "editor");

  await session.page.goto(
    `/app/contents/${qaFixture.contents.scheduled.id}/publish`,
  );
  await expect(
    session.page.getByRole("heading", { name: "Publish Content" }),
  ).toBeVisible();

  await Promise.all([
    session.page.waitForURL(`**/app/contents/${qaFixture.contents.scheduled.id}`),
    session.page.getByRole("button", { name: "Publish Content" }).click(),
  ]);

  await expect(
    session.page.getByText("Published", { exact: true }),
  ).toBeVisible();

  await session.context.close();
});
