/**
 * Generates a clean URL-safe slug from Arabic/English text.
 * Falls back to timestamp suffix if needed to ensure uniqueness.
 */
export function slugify(text: string): string {
  // Transliterate common Arabic terms or clean string
  const clean = text
    .toString()
    .toLowerCase()
    .trim()
    // Replace Arabic diacritics
    .replace(/[\u064B-\u065F\u0670]/g, "")
    // Replace non-alphanumeric chars with hyphens
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!clean || clean.length < 2) {
    return `course-${Date.now().toString(36)}`;
  }

  return clean;
}
