import fs from "node:fs/promises";
import path from "node:path";
import { request } from "@playwright/test";
import {
  API_BASE_URL,
  QA_PASSWORD,
  getAuthStatePath,
  qaUsers,
  resetQaDataset,
} from "./helpers/qa-data";

async function globalSetup() {
  resetQaDataset();

  await fs.mkdir(path.dirname(getAuthStatePath("owner")), {
    recursive: true,
  });

  for (const role of ["owner", "admin", "editor", "client"] as const) {
    const requestContext = await request.newContext();

    const response = await requestContext.post(`${API_BASE_URL}/auth/login`, {
      data: {
        email: qaUsers[role].email,
        password: QA_PASSWORD,
      },
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to create auth state for ${role}: ${response.status()} ${response.statusText()}`,
      );
    }

    await requestContext.storageState({ path: getAuthStatePath(role) });
    await requestContext.dispose();
  }
}

export default globalSetup;
