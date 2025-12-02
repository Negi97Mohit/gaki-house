/**
 * Generates a unique ID with an optional prefix and timestamp.
 * Format: {prefix}-{timestamp}-{random}
 * Example: "overlay-1715623456789-x9z2k3"
 */
export function generateId(prefix: string = "id"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generates a simple unique ID (equivalent to UUID v4 usage in UI).
 * Format: {random}
 */
export function generateSimpleId(): string {
  // Uses crypto.randomUUID if available (modern browsers), falls back to Math.random
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substr(2, 9);
}
