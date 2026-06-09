import slugifyLib from "slugify";

/**
 * Merge Tailwind / CSS class names. Simple concat — no clsx/tailwind-merge
 * dependency needed for a small project. Falsy values are filtered out.
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Format a Date (or ISO string) into a human-readable string.
 * Falls back to the raw value on invalid dates.
 */
export function formatDate(
  date: Date | string | undefined | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return String(date);

  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

/**
 * Generate a URL-safe slug from arbitrary text.
 */
export function slugify(text: string): string {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

/**
 * Generate a membership ID like THR-F-2026-001, THR-HF-2026-042, THR-DF-2026-003.
 */
export function generateMembershipId(
  type: "student" | "collaborator" | "professional" | "senior" | "fellow" | "distinguished_fellow",
  count: number
): string {
  const prefix =
    type === "student" ? "ST" :
    type === "collaborator" ? "CO" :
    type === "professional" ? "PR" :
    type === "senior" ? "SR" :
    type === "fellow" ? "F" : "DF";
  const year = new Date().getFullYear();
  const serial = String(count + 1).padStart(3, "0");
  return `THR-${prefix}-${year}-${serial}`;
}

/**
 * Truncate text to a maximum length, appending "…" if truncated.
 */
export function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Extract initials from a full name (up to 2 characters).
 */
export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

/**
 * Format a number with locale-aware separators and optional compact notation.
 *
 * @example formatNumber(12500)        → "12,500"
 * @example formatNumber(12500, true)  → "12.5K"
 */
export function formatNumber(
  num: number,
  compact: boolean = false
): string {
  if (compact) {
    return new Intl.NumberFormat("en", { notation: "compact" }).format(num);
  }
  return new Intl.NumberFormat("en-IN").format(num);
}
