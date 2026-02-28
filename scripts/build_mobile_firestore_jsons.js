import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.join(__dirname, "..", "data", "firestore_export");
const OUTPUT_ROOT = path.join(__dirname, "..", "data", "mobile_firestore_export", "v2");

const SCREEN_PROFILES = [
  { id: "xs", label: "Small phones", width: 320, height: 568, fontScale: 0.78, pipScale: 0.8, spacingScale: 0.82 },
  { id: "sm", label: "Standard phones", width: 360, height: 640, fontScale: 0.88, pipScale: 0.9, spacingScale: 0.9 },
  { id: "md", label: "Large phones", width: 390, height: 844, fontScale: 1.0, pipScale: 1.0, spacingScale: 1.0 },
  { id: "lg", label: "Phablets", width: 430, height: 932, fontScale: 1.08, pipScale: 1.12, spacingScale: 1.1 },
];

const COLLECTIONS = [
  "anime_styles",
  "animation_library",
  "text_designs",
  "canvas_presets",
  "dynamic_presets",
  "social_banners",
  "animated_banners",
  "public_canvas_presets",
  "preset_templates",
  "filters",
  "caption_presets",
  "layout_templates",
];

const clone = (value) => JSON.parse(JSON.stringify(value));
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const percentToNum = (value, fallback = 0) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value.replace("%", ""));
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const remapSectionStylesToVertical = (sections, profile) => {
  if (!Array.isArray(sections) || sections.length === 0) return sections;

  const count = sections.length;
  const gap = clamp(Math.round(2 * profile.spacingScale), 1, 3);
  const available = 100 - gap * (count - 1);
  const eachHeight = clamp(available / count, 12, 100);

  return sections.map((section, index) => {
    const style = clone(section.style || {});
    const y = (eachHeight + gap) * index;

    return {
      ...section,
      mobileSectionOrder: index,
      style: {
        ...style,
        position: "absolute",
        left: "0%",
        width: "100%",
        top: `${Number(y.toFixed(2))}%`,
        height: `${Number(eachHeight.toFixed(2))}%`,
        borderRadius: `${Math.round(14 * profile.spacingScale)}px`,
      },
    };
  });
};

const scaleTextStyle = (style = {}, profile) => {
  const next = { ...style };
  if (typeof next.fontSize === "number") {
    next.fontSize = clamp(Math.round(next.fontSize * profile.fontScale), 14, 72);
  }

  if (typeof next.borderWidth === "number") {
    next.borderWidth = clamp(Math.round(next.borderWidth * profile.spacingScale), 0, 3);
  }

  const shadows = {
    xs: "0 1px 6px rgba(0,0,0,0.35)",
    sm: "0 1px 8px rgba(0,0,0,0.35)",
    md: "0 2px 10px rgba(0,0,0,0.35)",
    lg: "0 2px 12px rgba(0,0,0,0.35)",
  };
  next.textShadow = next.textShadow || shadows[profile.id];

  return next;
};

const scaleOverlayLayout = (layout = {}, profile) => {
  const next = clone(layout);
  if (next.position) {
    next.position = {
      x: clamp(percentToNum(next.position.x, 0), 0, 100),
      y: clamp(percentToNum(next.position.y, 0), 0, 100),
    };
  }

  if (next.size) {
    next.size = {
      width: clamp(percentToNum(next.size.width, 100) * 0.92, 12, 100),
      height: clamp(percentToNum(next.size.height, 100) * 0.92, 8, 100),
    };
  }

  return next;
};

const mobileBaseMeta = (item, collection, profile) => ({
  platform: "mobile",
  variant: "v2",
  screenProfile: profile.id,
  collection,
  sourceId: item.id,
});

function transformCollectionItem(item, collection, profile) {
  const output = clone(item);

  output.id = `${item.id}__mobile_${profile.id}`;
  output.name = output.name ? `${output.name} • ${profile.id.toUpperCase()} Mobile` : output.name;
  output.mobileMeta = mobileBaseMeta(item, collection, profile);

  if (collection === "layout_templates") {
    output.sections = remapSectionStylesToVertical(output.sections, profile);
    output.layoutDirection = "vertical-stack";
  }

  if (["canvas_presets", "public_canvas_presets", "dynamic_presets"].includes(collection)) {
    output.canvasAspectRatio = "9:16";

    if (output.pip) {
      const width = clamp(Math.round(34 * profile.pipScale), 24, 46);
      const height = clamp(Math.round(42 * profile.pipScale), 30, 56);
      output.pip = {
        ...output.pip,
        layoutMode: output.pip.layoutMode === "hidden" ? "hidden" : "pip",
        pipSize: { width, height },
        pipPosition: { x: clamp(50 - width / 2, 4, 76), y: clamp(52, 38, 66) },
      };
    }

    if (Array.isArray(output.textOverlays)) {
      output.textOverlays = output.textOverlays.map((overlay) => ({
        ...overlay,
        layout: scaleOverlayLayout(overlay.layout, profile),
        style: scaleTextStyle(overlay.style, profile),
      }));
    }

    if (output.background) {
      output.background = {
        ...output.background,
        mobileSafeAreaAware: true,
      };
    }
  }

  if (["caption_presets", "preset_templates", "text_designs"].includes(collection)) {
    if (output.style) {
      output.style = scaleTextStyle(output.style, profile);

      if (output.style.position) {
        output.style.position = {
          x: clamp(percentToNum(output.style.position.x, 50), 4, 96),
          y: clamp(percentToNum(output.style.position.y, 50), 8, 92),
        };
      }

      output.style.mobileLineClamp = profile.id === "xs" ? 2 : 3;
      output.style.mobileSafeMargin = Math.round(10 * profile.spacingScale);
    }
  }

  if (["social_banners", "animated_banners"].includes(collection)) {
    output.layout = "mobile-stack";
    output.maxLinks = clamp(Math.min(output.maxLinks || 4, 4), 2, 4);

    if (output.styles?.container) {
      const pad = Math.round(16 * profile.spacingScale);
      output.styles.container = {
        ...output.styles.container,
        width: "100%",
        minWidth: "100%",
        padding: `${pad}px`,
        borderRadius: `${Math.round(18 * profile.spacingScale)}px`,
        gap: `${Math.round(8 * profile.spacingScale)}px`,
      };
    }

    if (output.styles?.name) {
      output.styles.name = {
        ...output.styles.name,
        fontSize: `${clamp(Math.round(18 * profile.fontScale), 14, 24)}px`,
      };
    }

    if (output.styles?.tagline) {
      output.styles.tagline = {
        ...output.styles.tagline,
        fontSize: `${clamp(Math.round(12 * profile.fontScale), 10, 16)}px`,
      };
    }
  }

  if (collection === "animation_library") {
    output.animationConfig = {
      ...output.animationConfig,
      mobileOptimized: true,
      quality: "balanced",
    };
  }

  if (collection === "filters") {
    output.mobileMeta.recommendedIntensity = profile.id === "xs" ? 0.65 : profile.id === "sm" ? 0.75 : 0.85;
  }

  if (collection === "anime_styles") {
    output.mobileMeta.renderHint = profile.id === "xs" ? "performance" : "balanced";
  }

  return output;
}

async function loadCollection(collection) {
  const filePath = path.join(INPUT_DIR, `${collection}.json`);
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

async function writeCollection(profile, collection, items) {
  const profileDir = path.join(OUTPUT_ROOT, profile.id);
  await fs.mkdir(profileDir, { recursive: true });
  await fs.writeFile(path.join(profileDir, `${collection}.json`), JSON.stringify(items, null, 2));
}

async function main() {
  await fs.mkdir(OUTPUT_ROOT, { recursive: true });

  const manifest = {
    generatedAt: new Date().toISOString(),
    version: "mobile-firestore-v2",
    source: "data/firestore_export/*.json",
    profiles: SCREEN_PROFILES,
    collections: {},
  };

  for (const collection of COLLECTIONS) {
    const sourceItems = await loadCollection(collection);
    manifest.collections[collection] = {};

    for (const profile of SCREEN_PROFILES) {
      const mobileItems = sourceItems.map((item) => transformCollectionItem(item, collection, profile));
      await writeCollection(profile, collection, mobileItems);
      manifest.collections[collection][profile.id] = {
        inputCount: sourceItems.length,
        outputCount: mobileItems.length,
        outputPath: `data/mobile_firestore_export/v2/${profile.id}/${collection}.json`,
      };
    }
  }

  await fs.writeFile(path.join(OUTPUT_ROOT, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`[mobile-jsons] Generated ${COLLECTIONS.length} collections for ${SCREEN_PROFILES.length} mobile profiles.`);
}

main().catch((error) => {
  console.error("[mobile-jsons] Failed:", error);
  process.exit(1);
});
