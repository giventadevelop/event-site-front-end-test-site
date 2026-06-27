import { customAlphabet } from "nanoid";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { getAppUrl } from "@/lib/env"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789");

export function absoluteUrl(path: string) {
  return `${getAppUrl()}${path}`;
}

/**
 * Check if a user role string represents an admin-level role.
 * Accepts both 'ADMIN' and 'SUPER_ADMIN'.
 */
export function isAdminRole(role: string | null | undefined): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}