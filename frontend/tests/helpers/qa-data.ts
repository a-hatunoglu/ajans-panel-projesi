import { execSync } from "node:child_process";
import path from "node:path";

export type QaRole = "owner" | "admin" | "editor" | "designer" | "client";

export const APP_BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100";
export const API_BASE_URL =
  process.env.PLAYWRIGHT_API_URL ?? "http://127.0.0.1:3200/api/v1";
export const QA_LOCALE_COOKIE = {
  name: "agency-locale",
  value: "en",
} as const;
export const QA_PASSWORD = "LocalDev123!";
export const qaRoles: QaRole[] = [
  "owner",
  "admin",
  "editor",
  "designer",
  "client",
];

export const qaUsers: Record<QaRole, { email: string }> = {
  owner: { email: "enes@test.com" },
  admin: { email: "ayla.admin@test.com" },
  editor: { email: "ece.editor@test.com" },
  designer: { email: "deniz.designer@test.com" },
  client: { email: "cem.client@test.com" },
};

export const qaFixture = {
  company: {
    id: "0349f0bd-aa25-4cc0-8ea1-4dac3c9c340b",
    name: "Atlas Local Dev",
  },
  contents: {
    draft: {
      id: "8501b9f4-ab59-4789-ae24-aea4b3d50184",
      title: "[QA] Workflow Draft",
    },
    inReview: {
      id: "8851a9fa-f457-44f0-a24c-42dac3a0a76e",
      title: "[QA] Workflow In Review",
    },
    revise: {
      id: "52801ac6-1ebe-44e1-86d2-5a84dd633abd",
      title: "[QA] Workflow Revise",
    },
    approved: {
      id: "70afac3f-54ff-4796-a8b5-d5fd5ce6d9a1",
      title: "[QA] Workflow Approved",
    },
    scheduled: {
      id: "44a6e6eb-67c4-49cf-bbf0-f2a81f9e7d4f",
      title: "[QA] Workflow Scheduled",
    },
  },
  payments: {
    pendingPeriodLabel: "Apr 01 - Apr 30, 2026",
  },
} as const;

const frontendRoot = path.resolve(__dirname, "..", "..");
const repoRoot = path.resolve(frontendRoot, "..");
const authStateDir = path.join(frontendRoot, "playwright", ".auth");

export function resetQaDataset() {
  execSync("npm run dev:seed:workflow-qa", {
    cwd: repoRoot,
    stdio: "pipe",
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV ?? "development",
    },
  });
}

export function getAuthStatePath(role: QaRole) {
  return path.join(authStateDir, `${role}.json`);
}
