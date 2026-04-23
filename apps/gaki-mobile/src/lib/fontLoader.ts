// Dynamically inject Google Fonts <link> tags on demand.
// Caches per-family so we never request the same font twice.

const loaded = new Set<string>();

// Some font families bundled in our JSON aren't on Google Fonts. Skip them.
const SKIP = new Set(["Courier New", "Arial", "Inter"]);

/**
 * Inject a <link rel="stylesheet"> for a Google Font family.
 * Safe to call repeatedly; no-op for already-loaded families.
 */
export function loadFont(family?: string) {
  if (!family || typeof document === "undefined") return;
  const key = family.trim();
  if (!key || loaded.has(key) || SKIP.has(key)) return;

  loaded.add(key);
  const href =
    "https://fonts.googleapis.com/css2?family=" +
    encodeURIComponent(key).replace(/%20/g, "+") +
    ":wght@400;600;700&display=swap";

  // Avoid duplicates if another mechanism already added it.
  if (document.querySelector(`link[data-font="${key}"]`)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.font = key;
  document.head.appendChild(link);
}

/** Bulk loader. */
export function loadFonts(families: Array<string | undefined>) {
  for (const f of families) loadFont(f);
}
