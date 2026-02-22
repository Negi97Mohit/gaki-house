import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INPUT_DIR = path.join(__dirname, '..', 'data', 'firestore_export');
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'mobile_firestore_export');

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const toNumber = (v, fallback = 0) => typeof v === 'number' && Number.isFinite(v) ? v : fallback;

function mobileIdentity(item) {
  const copy = JSON.parse(JSON.stringify(item));
  copy.isMobile = true;
  copy.originalDesktopId = item.id;
  copy.id = item.id?.endsWith('_mobile') ? item.id : `${item.id}_mobile`;
  if (copy.name && !String(copy.name).includes('(Mobile)')) copy.name = `${copy.name} (Mobile)`;
  return copy;
}

function normalizeCaptionStyle(style = {}, compact = false) {
  const next = { ...style };
  const baseFont = compact ? 26 : 30;
  next.fontSize = clamp(toNumber(next.fontSize, baseFont), compact ? 20 : 24, compact ? 36 : 44);
  next.position = {
    x: clamp(toNumber(next.position?.x, 50), 35, 65),
    y: clamp(toNumber(next.position?.y, 86), 76, 94),
  };
  if (!next.backgroundColor || next.backgroundColor === 'transparent') {
    next.backgroundColor = 'rgba(0,0,0,0.58)';
  }
  if (!next.color) next.color = '#ffffff';
  if (next.shape === 'banner') next.shape = 'rounded';
  next.padding = next.padding || '8px 12px';
  next.textAlign = next.textAlign || 'center';
  return next;
}

function normalizeTextOverlay(overlay = {}) {
  const next = { ...overlay };
  if (next.layout?.position) {
    next.layout.position = {
      x: clamp(toNumber(next.layout.position.x, 50), 8, 86),
      y: clamp(toNumber(next.layout.position.y, 82), 8, 92),
    };
  }
  if (next.layout?.size) {
    next.layout.size = {
      width: clamp(toNumber(next.layout.size.width, 64), 28, 90),
      height: clamp(toNumber(next.layout.size.height, 12), 8, 30),
    };
  }
  if (next.style) {
    next.style = normalizeCaptionStyle(next.style, true);
  }
  return next;
}

function normalizePip(pip = {}) {
  const next = { ...pip };
  const layoutMode = next.layoutMode || 'pip';
  next.layoutMode = ['pip', 'solo', 'split-horizontal', 'split-vertical'].includes(layoutMode) ? layoutMode : 'pip';

  next.pipSize = {
    width: clamp(toNumber(next.pipSize?.width, 34), 24, 46),
    height: clamp(toNumber(next.pipSize?.height, 28), 20, 40),
  };
  next.pipPosition = {
    x: clamp(toNumber(next.pipPosition?.x, 62), 50, 72),
    y: clamp(toNumber(next.pipPosition?.y, 6), 4, 16),
  };
  next.pipBorder = next.pipBorder || { color: '#ffffff', width: 1.2 };
  next.pipShadow = next.pipShadow || { color: 'rgba(0,0,0,0.35)', blur: 18 };
  if (!next.cameraShape || next.cameraShape === 'rectangle') next.cameraShape = 'rounded';
  return next;
}

function normalizeCanvasPreset(item = {}) {
  const next = mobileIdentity(item);
  next.pip = normalizePip(next.pip || {});
  next.effects = {
    ...(next.effects || {}),
    videoFilter: next.effects?.videoFilter || 'none',
  };
  next.background = {
    ...(next.background || {}),
    blankCanvasColor: next.background?.blankCanvasColor || '#0d1117',
  };
  next.textOverlays = Array.isArray(next.textOverlays) ? next.textOverlays.map(normalizeTextOverlay).slice(0, 2) : [];
  return next;
}

function normalizeDynamicPreset(item = {}) {
  const next = normalizeCanvasPreset(item);
  if (next.canvasLayout?.sections && Array.isArray(next.canvasLayout.sections)) {
    const sections = next.canvasLayout.sections.slice(0, 3);
    if (sections.length === 2) {
      sections[0].style = { ...(sections[0].style || {}), top: '0%', left: '0%', width: '100%', height: '58%' };
      sections[1].style = { ...(sections[1].style || {}), top: '58%', left: '0%', width: '100%', height: '42%' };
    }
    if (sections.length >= 3) {
      sections[0].style = { ...(sections[0].style || {}), top: '0%', left: '0%', width: '100%', height: '52%' };
      sections[1].style = { ...(sections[1].style || {}), top: '52%', left: '0%', width: '50%', height: '48%' };
      sections[2].style = { ...(sections[2].style || {}), top: '52%', left: '50%', width: '50%', height: '48%' };
    }
    next.canvasLayout.sections = sections;
  }
  return next;
}

function normalizeLayoutTemplate(item = {}) {
  const next = mobileIdentity(item);
  const sections = Array.isArray(next.sections) ? next.sections.slice(0, 3) : [];
  if (sections.length === 1) {
    sections[0].style = { ...(sections[0].style || {}), top: '0%', left: '0%', width: '100%', height: '100%' };
  } else if (sections.length === 2) {
    sections[0].style = { ...(sections[0].style || {}), top: '0%', left: '0%', width: '100%', height: '58%' };
    sections[1].style = { ...(sections[1].style || {}), top: '58%', left: '0%', width: '100%', height: '42%' };
  } else if (sections.length >= 3) {
    sections[0].style = { ...(sections[0].style || {}), top: '0%', left: '0%', width: '100%', height: '52%' };
    sections[1].style = { ...(sections[1].style || {}), top: '52%', left: '0%', width: '50%', height: '48%' };
    sections[2].style = { ...(sections[2].style || {}), top: '52%', left: '50%', width: '50%', height: '48%' };
  }
  next.sections = sections;
  return next;
}

function normalizeTextDesign(item = {}) {
  const next = mobileIdentity(item);
  next.style = normalizeCaptionStyle(next.style || {}, true);
  if (next.style.fontFamily && String(next.style.fontFamily).includes(',')) {
    next.style.fontFamily = String(next.style.fontFamily).split(',')[0].trim();
  }
  return next;
}

function normalizeCaptionPreset(item = {}) {
  const next = mobileIdentity(item);
  next.style = normalizeCaptionStyle(next.style || {}, false);
  return next;
}

function normalizePresetTemplate(item = {}) {
  const next = mobileIdentity(item);
  next.style = normalizeCaptionStyle(next.style || {}, false);
  return next;
}

function normalizeBanner(item = {}) {
  const next = mobileIdentity(item);
  next.maxLinks = clamp(toNumber(next.maxLinks, 3), 2, 4);
  return next;
}

function normalizeFilter(item = {}) {
  const next = mobileIdentity(item);
  next.style = String(next.style || 'none').replace(/blur\((\d+)px\)/g, (_, px) => `blur(${Math.min(Number(px), 3)}px)`);
  return next;
}

function transformByCollection(item, filename) {
  switch (filename) {
    case 'canvas_presets.json':
    case 'public_canvas_presets.json':
      return normalizeCanvasPreset(item);
    case 'dynamic_presets.json':
      return normalizeDynamicPreset(item);
    case 'layout_templates.json':
      return normalizeLayoutTemplate(item);
    case 'text_designs.json':
      return normalizeTextDesign(item);
    case 'caption_presets.json':
      return normalizeCaptionPreset(item);
    case 'preset_templates.json':
      return normalizePresetTemplate(item);
    case 'social_banners.json':
    case 'animated_banners.json':
      return normalizeBanner(item);
    case 'filters.json':
      return normalizeFilter(item);
    default:
      return mobileIdentity(item);
  }
}

async function processFile(filename) {
  if (!filename.endsWith('.json') || filename === 'all_data.json') return;
  const inPath = path.join(INPUT_DIR, filename);
  const outPath = path.join(OUTPUT_DIR, filename);

  const raw = await fs.readFile(inPath, 'utf-8');
  const parsed = JSON.parse(raw);
  const list = Array.isArray(parsed) ? parsed : [];
  const mobile = list.map((item) => transformByCollection(item, filename));

  await fs.writeFile(outPath, JSON.stringify(mobile, null, 2));
  console.log(`[mobile] ${filename}: ${mobile.length}`);
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const files = await fs.readdir(INPUT_DIR);
  for (const f of files) {
    await processFile(f);
  }
  console.log('done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
