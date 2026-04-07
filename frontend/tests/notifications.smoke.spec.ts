import { expect, test } from "@playwright/test";
import { qaFixture, resetQaDataset } from "./helpers/qa-data";
import { createAuthenticatedSession } from "./helpers/session";

test.beforeEach(() => {
  resetQaDataset();
});

test("client can mark single notifications and then clear the unread queue", async ({
  browser,
}) => {
  const editorSession = await createAuthenticatedSession(browser, "editor");
  await editorSession.page.goto(`/app/contents/${qaFixture.contents.draft.id}`);
  await editorSession.page
    .getByRole("button", { name: "Submit For Review" })
    .click();
  await expect(
    editorSession.page.getByText("In Review", { exact: true }),
  ).toBeVisible();
  await editorSession.context.close();

  const ownerSession = await createAuthenticatedSession(browser, "owner");
  await ownerSession.page.goto(
    `/app/contents/${qaFixture.contents.scheduled.id}/publish`,
  );
  await Promise.all([
    ownerSession.page.waitForURL(
      `**/app/contents/${qaFixture.contents.scheduled.id}`,
    ),
    ownerSession.page.getByRole("button", { name: "Publish Content" }).click(),
  ]);
  await expect(
    ownerSession.page.getByText("Published", { exact: true }),
  ).toBeVisible();
  await ownerSession.context.close();

  const clientSession = await createAuthenticatedSession(browser, "client");
  await clientSession.page.goto("/app/notifications");
  await expect(
    clientSession.page.getByRole("heading", { name: "Notifications" }),
  ).toBeVisible();

  const unreadActions = clientSession.page.getByRole("button", {
    name: "Mark as read",
  });
  await expect(unreadActions.first()).toBeVisible();
  const initialUnreadCount = await unreadActions.count();

  await unreadActions.first().click();
  await expect
    .poll(async () => unreadActions.count())
    .toBeLessThan(initialUnreadCount);

  const markAllButton = clientSession.page.getByRole("button", {
    name: "Mark all as read",
  });
  await expect(markAllButton).toBeEnabled();
  await markAllButton.click();

  await expect(unreadActions).toHaveCount(0);
  await expect(clientSession.page.getByText("All caught up.")).toBeVisible();

  await clientSession.context.close();
});
