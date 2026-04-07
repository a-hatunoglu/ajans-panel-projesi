import { cookies } from "next/headers";
import { LOCALE_COOKIE_NAME, normalizeLocale } from "./config";

export function resolveServerLocale() {
  return normalizeLocale(cookies().get(LOCALE_COOKIE_NAME)?.value);
}
