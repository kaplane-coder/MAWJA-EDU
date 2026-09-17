import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind CSS classes safely with clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numerical amount into Algerian Dinars (DZD).
 * Example: 12500 -> "12,500 د.ج"
 */
export function formatDZD(amount: number): string {
  const formatted = new Intl.NumberFormat("ar-DZ", {
    maximumFractionDigits: 0,
  }).format(amount);

  return `${formatted} د.ج`;
}

/**
 * Formats seconds or minutes into a human-readable Arabic duration string.
 * Example: 90 -> "1 س و 30 د"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} دقيقة`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) {
    return `${hours} ${hours === 1 ? "ساعة" : hours === 2 ? "ساعتان" : hours <= 10 ? "ساعات" : "ساعة"}`;
  }
  return `${hours} س و ${remainingMins} د`;
}

/**
 * Truncates text cleanly at word boundaries.
 */
export function truncate(str: string, length: number): string {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}
