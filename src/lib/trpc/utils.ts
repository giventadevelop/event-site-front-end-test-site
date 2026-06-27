import { getAppUrl } from "@/lib/env";

export function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return getAppUrl();
}

export function getUrl() {
  return getBaseUrl() + "/api/trpc";
}