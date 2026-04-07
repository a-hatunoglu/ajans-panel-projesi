import { expect, test } from "@playwright/test";
import { qaFixture, resetQaDataset } from "./helpers/qa-data";
import { createAuthenticatedSession } from "./helpers/session";

test.beforeEach(() => {
  resetQaDataset();
});

test("company detail tabs respect owner and client role visibility", async ({
  browser,
}) => {
  const ownerSession = await createAuthenticatedSession(browser, "owner");

  await ownerSession.page.goto(`/app/companies/${qaFixture.company.id}`);
  await expect(
    ownerSession.page.getByRole("button", { name: "Payments" }),
  ).toBeVisible();
  await expect(
    ownerSession.page.getByRole("button", { name: "Users" }),
  ).toBeVisible();
  await expect(
    ownerSession.page.getByRole("button", { name: "Activity" }),
  ).toBeVisible();

  await ownerSession.context.close();

  const clientSession = await createAuthenticatedSession(browser, "client");

  await clientSession.page.goto(`/app/companies/${qaFixture.company.id}`);
  await expect(
    clientSession.page.getByRole("button", { name: "Overview" }),
  ).toBeVisible();
  await expect(
    clientSession.page.getByRole("button", { name: "Social Accounts" }),
  ).toBeVisible();
  await expect(
    clientSession.page.getByRole("button", { name: "Contents" }),
  ).toBeVisible();
  await expect(
    clientSession.page.getByRole("button", { name: "Calendar" }),
  ).toBeVisible();
  await expect(
    clientSession.page.getByRole("button", { name: "Payments" }),
  ).toHaveCount(0);
  await expect(
    clientSession.page.getByRole("button", { name: "Users" }),
  ).toHaveCount(0);
  await expect(
    clientSession.page.getByRole("button", { name: "Activity" }),
  ).toHaveCount(0);

  await clientSession.context.close();
});
