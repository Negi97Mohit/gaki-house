import React, { useEffect, useRef } from "react";

export const FUTURISTIC_TYPES = [
  "eventHorizon",
  "silkFilaments",
  "orbitalGlobe",
  "hypercube",
  "halftoneTide",
  "harmonograph",
  "flowField",
  "plexusDrift",
  "spectralCurtains",
  "prismBeams",
  "inkBloom",
  "brushStrokes",
  "ditherField",
  "stainedGlass",
  "livePen",
  "grainMesh",
  "glitchScan",
  "kaleidoscope",
  "paperLayers",
  "contourTopo",
  "pendulumWave",
  "moireRings",
  "bokehDrift",
  "warpGrid",
  "ridgeline",
  "phyllotaxis",
  "colorField",
  "rippleRain",
  "glyphField",
  "stringArt",
] as const;
export type FuturisticType = (typeof FUTURISTIC_TYPES)[number];

type Ctx = CanvasRenderingContext2D;
interface Opts {
  colors: string[];
  intensity: number;
  dark: boolean;
  bg: string;
}
type Frame = (t: number) => void;
type Factory = (ctx: Ctx, w: number, h: number, o: Opts) => Frame;

const TAU = Math.PI * 2;
const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1, 7), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
const mix = (hex: string, to: string, k: number) => {
  const a = parseInt(hex.slice(1, 7), 16),
    b = parseInt(to.slice(1, 7), 16);
  const ch = (s: number) =>
    Math.round(((a >> s) & 255) * (1 - k) + ((b >> s) & 255) * k);
  return (
    "#" + [16, 8, 0].map((s) => ch(s).toString(16).padStart(2, "0")).join("")
  );
};
const wipe = (ctx: Ctx, w: number, h: number, o: Opts, a = 1) => {
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.fillStyle = rgba(o.bg, a);
  ctx.fillRect(0, 0, w, h);
};
const glow = (ctx: Ctx, o: Opts) => {
  ctx.globalCompositeOperation = o.dark ? "lighter" : "multiply";
};
const normal = (ctx: Ctx) => {
  ctx.globalCompositeOperation = "source-over";
};

/* 1 ── Event Horizon: lensed accretion disk around a black hole */
const eventHorizon: Factory = (ctx, w, h, o) => {
  const cx = w / 2,
    cy = h / 2,
    R = Math.min(w, h) * 0.13,
    tilt = 0.26;
  const ps = Array.from({ length: 2200 }, () => ({
    r: R * (1.5 + Math.pow(Math.random(), 1.7) * 3.6),
    a: Math.random() * TAU,
    c: Math.floor(Math.random() * o.colors.length),
    j: (Math.random() - 0.5) * R * 0.05,
  }));
  return (t) => {
    wipe(ctx, w, h, o, 0.2);
    const pass = (back: boolean) => {
      for (const p of ps) {
        const ang = p.a + t * 0.35 * Math.pow((R * 1.5) / p.r, 1.5);
        const s = Math.sin(ang),
          x = Math.cos(ang) * p.r;
        if (s < 0 !== back) continue;
        let py = cy + s * p.r * tilt + p.j;
        if (back) {
          const k = Math.sqrt(Math.max(0, 1 - (x / p.r) ** 2));
          py = cy - k * (R * 1.2 + (p.r - R * 1.5) * 0.35);
        }
        const doppler = 0.55 + 0.45 * (x / p.r);
        ctx.globalAlpha = Math.min(
          1,
          o.intensity * 1.2 * Math.min(1, (R * 2.2) / p.r) * doppler,
        );
        ctx.fillStyle = o.colors[p.c];
        const z = p.r < R * 2.2 ? 1.7 : 1.1;
        ctx.fillRect(cx + x, py, z, z);
      }
      ctx.globalAlpha = 1;
    };
    glow(ctx, o);
    pass(true);
    normal(ctx);
    ctx.fillStyle = o.dark ? o.bg : "#111114";
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = rgba(o.colors[0], 0.9);
    ctx.lineWidth = 1.4;
    ctx.shadowColor = o.colors[1 % o.colors.length];
    ctx.shadowBlur = 26;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.03, 0, TAU);
    ctx.stroke();
    ctx.shadowBlur = 0;
    glow(ctx, o);
    pass(false);
  };
};

/* 2 ── Silk Filaments: braided hairlines that pinch at both ends */
const silkFilaments: Factory = (ctx, w, h, o) => (t) => {
  wipe(ctx, w, h, o);
  glow(ctx, o);
  const lines = 72;
  ctx.lineWidth = 0.7;
  for (let i = 0; i < lines; i++) {
    const k = i / (lines - 1);
    ctx.strokeStyle = rgba(
      o.colors[Math.floor(k * o.colors.length) % o.colors.length],
      0.1 + 0.25 * o.intensity,
    );
    ctx.beginPath();
    for (let x = 0; x <= w + 8; x += 8) {
      const nx = x / w,
        env = Math.sin(nx * Math.PI);
      const y =
        h * 0.5 +
        env *
          ((k - 0.5) * h * 0.6 * Math.sin(nx * 2.4 + t * 0.35 + k * 1.5) +
            h * 0.12 * Math.sin(nx * 5 - t * 0.5 + k * 3));
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
};

/* 3 ── Orbital Atlas: wireframe globe, dotted orbits, satellites */
const orbitalGlobe: Factory = (ctx, w, h, o) => {
  const cx = w / 2,
    cy = h / 2,
    R = Math.min(w, h) * 0.28;
  const dots = Array.from({ length: 260 }, (_, i) => {
    const y = 1 - (i / 259) * 2,
      r = Math.sqrt(1 - y * y),
      th = i * 2.399963;
    return [Math.cos(th) * r, y, Math.sin(th) * r];
  });
  return (t) => {
    wipe(ctx, w, h, o);
    glow(ctx, o);
    const ay = t * 0.18,
      ax = 0.42 + Math.sin(t * 0.1) * 0.08;
    const cyA = Math.cos(ay),
      syA = Math.sin(ay),
      cxA = Math.cos(ax),
      sxA = Math.sin(ax);
    const proj = (
      x: number,
      y: number,
      z: number,
    ): [number, number, number] => {
      const X = x * cyA + z * syA,
        Z = -x * syA + z * cyA;
      const Y = y * cxA - Z * sxA,
        Z2 = y * sxA + Z * cxA;
      const s = 1 + Z2 * 0.15;
      return [cx + X * R * s, cy + Y * R * s, Z2];
    };
    const F = new Path2D(),
      B = new Path2D();
    const line = (pts: number[][]) => {
      let prev = proj(pts[0][0], pts[0][1], pts[0][2]);
      for (let i = 1; i < pts.length; i++) {
        const c = proj(pts[i][0], pts[i][1], pts[i][2]);
        const P = (prev[2] + c[2]) / 2 >= 0 ? F : B;
        P.moveTo(prev[0], prev[1]);
        P.lineTo(c[0], c[1]);
        prev = c;
      }
    };
    for (let lat = -75; lat <= 75; lat += 15) {
      const a = (lat * Math.PI) / 180,
        pts: number[][] = [];
      for (let i = 0; i <= 64; i++) {
        const th = (i / 64) * TAU;
        pts.push([
          Math.cos(a) * Math.cos(th),
          Math.sin(a),
          Math.cos(a) * Math.sin(th),
        ]);
      }
      line(pts);
    }
    for (let m = 0; m < 9; m++) {
      const ph = (m * Math.PI) / 9,
        pts: number[][] = [];
      for (let i = 0; i <= 64; i++) {
        const th = (i / 64) * TAU;
        pts.push([
          Math.cos(th) * Math.cos(ph),
          Math.sin(th),
          Math.cos(th) * Math.sin(ph),
        ]);
      }
      line(pts);
    }
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = rgba(o.colors[0], 0.12 * o.intensity * 2);
    ctx.stroke(B);
    ctx.strokeStyle = rgba(o.colors[0], 0.5 * o.intensity * 1.4);
    ctx.stroke(F);
    ctx.fillStyle = rgba(o.colors[1 % o.colors.length], 0.8);
    for (const d of dots) {
      const [x, y, z] = proj(d[0], d[1], d[2]);
      if (z > 0) ctx.fillRect(x, y, 1.6, 1.6);
    }
    // orbits
    ctx.setLineDash([2, 7]);
    [
      [1.35, 0.5, 0],
      [1.62, -0.8, 1.2],
      [1.95, 0.25, 2.4],
    ].forEach(([r, inc, yaw], i) => {
      ctx.beginPath();
      const at = (th: number) => {
        const x = r * Math.cos(th),
          y = r * Math.sin(th) * Math.sin(inc),
          z = r * Math.sin(th) * Math.cos(inc);
        return proj(
          x * Math.cos(yaw) + z * Math.sin(yaw),
          y,
          -x * Math.sin(yaw) + z * Math.cos(yaw),
        );
      };
      for (let k = 0; k <= 90; k++) {
        const p = at((k / 90) * TAU);
        k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
      }
      ctx.strokeStyle = rgba(o.colors[2 % o.colors.length], 0.3);
      ctx.stroke();
      const s = at(t * (0.4 + i * 0.15) + i * 2);
      ctx.save();
      ctx.setLineDash([]);
      ctx.fillStyle = o.colors[2 % o.colors.length];
      ctx.shadowColor = o.colors[2 % o.colors.length];
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(s[0], s[1], 2.6, 0, TAU);
      ctx.fill();
      ctx.restore();
    });
    ctx.setLineDash([]);
  };
};

/* 4 ── Hypercube: two nested rotating tesseracts */
const hypercube: Factory = (ctx, w, h, o) => {
  const V: number[][] = [];
  for (let i = 0; i < 16; i++)
    V.push([i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1, i & 8 ? 1 : -1]);
  const E: [number, number, number][] = [];
  for (let i = 0; i < 16; i++)
    for (let j = i + 1; j < 16; j++) {
      const d = i ^ j;
      if (d && (d & (d - 1)) === 0) E.push([i, j, Math.log2(d)]);
    }
  const cx = w / 2,
    cy = h / 2,
    S = Math.min(w, h) * 0.17;
  const rot = (v: number[], a: number, b: number, ang: number) => {
    const c = Math.cos(ang),
      s = Math.sin(ang),
      x = v[a],
      y = v[b];
    v[a] = x * c - y * s;
    v[b] = x * s + y * c;
  };
  return (t) => {
    wipe(ctx, w, h, o);
    glow(ctx, o);
    [
      [1, 1],
      [0.52, -1.7],
    ].forEach(([sc, dir]) => {
      const pts = V.map((v) => {
        const p = [...v],
          tt = t * dir;
        rot(p, 0, 3, tt * 0.35);
        rot(p, 1, 2, tt * 0.23);
        rot(p, 0, 2, tt * 0.17);
        rot(p, 1, 3, tt * 0.11);
        const k = 2.2 / (3 - p[3]);
        const x = p[0] * k,
          y = p[1] * k,
          z = p[2] * k,
          m = 1.6 / (2.4 - z);
        return [
          cx + x * m * S * sc * (1 + Math.sin(t * 0.4) * 0.05),
          cy + y * m * S * sc,
          p[3],
        ];
      });
      ctx.lineWidth = 1;
      ctx.shadowBlur = o.dark ? 12 : 0;
      for (const [a, b, ax] of E) {
        const c = o.colors[ax % o.colors.length];
        ctx.shadowColor = c;
        ctx.strokeStyle = rgba(
          c,
          Math.min(
            1,
            0.35 + ((pts[a][2] + pts[b][2]) / 2 + 1) * 0.3 * o.intensity * 1.5,
          ),
        );
        ctx.beginPath();
        ctx.moveTo(pts[a][0], pts[a][1]);
        ctx.lineTo(pts[b][0], pts[b][1]);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.fillStyle = o.colors[0];
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p[0], p[1], 2, 0, TAU);
        ctx.fill();
      }
    });
  };
};

/* 5 ── Halftone Tide: dot grid swelling with interference waves */
const halftoneTide: Factory = (ctx, w, h, o) => {
  const gap = Math.max(20, Math.round(Math.min(w, h) / 34));
  const cols = Math.ceil(w / gap) + 1,
    rows = Math.ceil(h / gap) + 1,
    n = o.colors.length;
  return (t) => {
    wipe(ctx, w, h, o);
    const s1x = w * (0.5 + 0.35 * Math.sin(t * 0.21)),
      s1y = h * (0.5 + 0.35 * Math.cos(t * 0.17));
    const s2x = w * (0.5 + 0.4 * Math.cos(t * 0.13 + 1)),
      s2y = h * (0.5 + 0.4 * Math.sin(t * 0.19 + 2));
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const x = i * gap,
          y = j * gap;
        const f =
          (Math.sin(Math.hypot(x - s1x, y - s1y) * 0.014 - t * 1.2) +
            Math.sin(Math.hypot(x - s2x, y - s2y) * 0.011 - t * 0.9)) *
            0.25 +
          0.5;
        const r = gap * 0.46 * Math.pow(f, 1.6);
        if (r < 0.4) continue;
        ctx.globalAlpha = Math.min(1, 0.25 + f * o.intensity * 1.3);
        ctx.fillStyle =
          o.colors[Math.min(n - 1, f > 0.8 ? 2 : f > 0.5 ? 1 : 0)];
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
      }
    ctx.globalAlpha = 1;
  };
};

/* 6 ── Harmonograph: slowly precessing Lissajous rosettes */
const harmonograph: Factory = (ctx, w, h, o) => {
  const cx = w / 2,
    cy = h / 2,
    Ay = Math.min(w, h) * 0.38,
    Ax = Math.min(w * 0.4, Ay * 1.5);
  const C = [
    { f: [2, 3.01, 3, 2.005], p: [0, 1.2, 2.1, 0.4] },
    { f: [3, 2.004, 2.01, 3], p: [1, 0.2, 0.5, 2] },
    { f: [1, 2.006, 2, 1.004], p: [2.2, 0.9, 1.4, 0.1] },
  ];
  return (t) => {
    wipe(ctx, w, h, o);
    glow(ctx, o);
    ctx.lineWidth = 0.7;
    C.forEach((c, k) => {
      ctx.strokeStyle = rgba(
        o.colors[k % o.colors.length],
        0.2 + 0.3 * o.intensity,
      );
      ctx.beginPath();
      for (let i = 0; i <= 1800; i++) {
        const u = i * 0.02;
        const x =
          cx +
          Ax *
            (Math.sin(c.f[0] * u + c.p[0] + t * 0.05) * 0.65 +
              Math.sin(c.f[1] * u + c.p[1]) * 0.35);
        const y =
          cy +
          Ay *
            (Math.sin(c.f[2] * u + c.p[2]) * 0.65 +
              Math.sin(c.f[3] * u + c.p[3] + t * 0.04) * 0.35);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    });
  };
};

/* 7 ── Flow Field: generative particle trails through a vector field */
const flowField: Factory = (ctx, w, h, o) => {
  const N = Math.round(Math.min(2200, (w * h) / 900)),
    n = o.colors.length;
  const ps = Array.from({ length: N }, (_, i) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    life: Math.random() * 300,
    c: i % n,
  }));
  const strokes = o.colors.map((c) => rgba(c, 0.2 + 0.4 * o.intensity));
  return (t) => {
    wipe(ctx, w, h, o, o.dark ? 0.05 : 0.07);
    glow(ctx, o);
    ctx.lineWidth = 0.8;
    const paths = o.colors.map(() => new Path2D());
    for (const p of ps) {
      const a =
        (Math.sin(p.x * 0.0035 + t * 0.12) +
          Math.cos(p.y * 0.004 - t * 0.1) +
          Math.sin((p.x + p.y) * 0.0021 + t * 0.07)) *
        1.1;
      const nx = p.x + Math.cos(a) * 1.7,
        ny = p.y + Math.sin(a) * 1.7;
      if (--p.life < 0 || nx < 0 || ny < 0 || nx > w || ny > h) {
        p.x = Math.random() * w;
        p.y = Math.random() * h;
        p.life = 150 + Math.random() * 250;
        continue;
      }
      paths[p.c].moveTo(p.x, p.y);
      paths[p.c].lineTo(nx, ny);
      p.x = nx;
      p.y = ny;
    }
    paths.forEach((P, i) => {
      ctx.strokeStyle = strokes[i];
      ctx.stroke(P);
    });
  };
};

/* 8 ── Plexus Drift: floating nodes linked by proximity */
const plexusDrift: Factory = (ctx, w, h, o) => {
  const N = Math.round(Math.min(90, (w * h) / 14000)),
    link = Math.min(w, h) * 0.22;
  const ns = Array.from({ length: N }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 22,
    vy: (Math.random() - 0.5) * 22,
    z: 0.4 + Math.random() * 0.6,
    ph: Math.random() * TAU,
  }));
  let last = 0;
  return (t) => {
    const dt = Math.min(0.05, Math.max(0, t - last));
    last = t;
    wipe(ctx, w, h, o);
    glow(ctx, o);
    for (const n of ns) {
      n.x += n.vx * dt * n.z;
      n.y += n.vy * dt * n.z;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }
    ctx.lineWidth = 0.7;
    for (let i = 0; i < N; i++)
      for (let j = i + 1; j < N; j++) {
        const d = Math.hypot(ns[i].x - ns[j].x, ns[i].y - ns[j].y);
        if (d > link) continue;
        ctx.strokeStyle = rgba(
          o.colors[(i + j) % o.colors.length],
          (1 - d / link) * 0.6 * o.intensity * 1.4,
        );
        ctx.beginPath();
        ctx.moveTo(ns[i].x, ns[i].y);
        ctx.lineTo(ns[j].x, ns[j].y);
        ctx.stroke();
      }
    for (const n of ns) {
      const r = (1.3 + n.z * 1.8) * (1 + 0.25 * Math.sin(t * 1.5 + n.ph));
      ctx.fillStyle = rgba(o.colors[0], 0.15);
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 3.5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = o.colors[0];
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, TAU);
      ctx.fill();
    }
  };
};

/* 9 ── Spectral Curtains: layered aurora sheets with ray structure */
const spectralCurtains: Factory = (ctx, w, h, o) => (t) => {
  wipe(ctx, w, h, o);
  glow(ctx, o);
  const K = 6;
  for (let k = 0; k < K; k++) {
    const col = o.colors[k % o.colors.length];
    const bottom = (x: number) =>
      h * (0.5 + 0.04 * k) +
      Math.sin((x / w) * (2.2 + k * 0.3) + t * 0.25 + k * 1.7) * h * 0.1 +
      Math.sin((x / w) * 6 + t * 0.4 + k) * h * 0.03;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, rgba(col, 0));
    g.addColorStop(0.35, rgba(col, 0.06 * o.intensity * 2));
    g.addColorStop(0.7, rgba(col, 0.3 * o.intensity * 1.4));
    g.addColorStop(1, rgba(col, 0.35 * o.intensity * 1.4));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    for (let x = w; x >= 0; x -= 6) ctx.lineTo(x, bottom(x));
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = g;
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 5) {
      ctx.globalAlpha =
        0.55 * (0.5 + 0.5 * Math.sin(x * 0.07 + t * 0.9 + k * 3));
      const b = bottom(x),
        len = h * 0.32 * (0.5 + 0.5 * Math.sin(x * 0.031 - t * 0.5 + k));
      ctx.beginPath();
      ctx.moveTo(x, b - len);
      ctx.lineTo(x, b);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
};

/* 10 ── Prism Blades: tilted glass beams with chromatic aberration */
const prismBeams: Factory = (ctx, w, h, o) => {
  const span = Math.hypot(w, h),
    N = 7;
  return (t) => {
    wipe(ctx, w, h, o);
    glow(ctx, o);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-0.35);
    for (let i = 0; i < N; i++) {
      const pos =
        (((i / N + t * 0.012 + Math.sin(t * 0.07 + i) * 0.02) % 1) + 1) % 1;
      const x = (pos - 0.5) * span,
        wd = 26 + (i % 4) * 34;
      const flick = 0.75 + 0.25 * Math.sin(t * 0.8 + i * 2);
      for (let c = 0; c < 3; c++) {
        const ox = (c - 1) * (7 + 4 * Math.sin(t * 0.5 + i)),
          x0 = x + ox - wd / 2;
        const g = ctx.createLinearGradient(x0, 0, x0 + wd, 0);
        const col = o.colors[c % o.colors.length];
        g.addColorStop(0, rgba(col, 0));
        g.addColorStop(0.5, rgba(col, 0.2 * o.intensity * 1.5 * flick));
        g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g;
        ctx.fillRect(x0, -span, wd, span * 2);
      }
      ctx.fillStyle = rgba(o.colors[0], 0.35 * flick);
      ctx.fillRect(x - 0.5, -span, 1, span * 2);
    }
    ctx.restore();
  };
};
/* ───────── helpers for batch 2 ───────── */
const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lowRes = (w: number, h: number, scale: number) => {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.ceil(w / scale));
  c.height = Math.max(1, Math.ceil(h / scale));
  const x = c.getContext("2d")!;
  return {
    c,
    x,
    cw: c.width,
    ch: c.height,
    img: x.createImageData(c.width, c.height),
  };
};

/* 11 ── Ink Bloom: watercolor pigment blooming into wet paper */
const inkBloom: Factory = (ctx, w, h, o) => {
  type B = {
    x: number;
    y: number;
    r: number;
    max: number;
    age: number;
    life: number;
    c: number;
    ph: number;
  };
  const bs: B[] = [];
  const spawn = () =>
    bs.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0,
      max: Math.min(w, h) * (0.18 + Math.random() * 0.22),
      age: 0,
      life: 9 + Math.random() * 7,
      c: Math.floor(Math.random() * o.colors.length),
      ph: Math.random() * TAU,
    });
  for (let i = 0; i < 5; i++) {
    spawn();
    bs[i].age = Math.random() * 6;
  }
  let last = 0,
    acc = 0;
  return (t) => {
    const dt = Math.min(0.1, Math.max(0, t - last));
    last = t;
    acc += dt;
    const k = dt * 60;
    if (acc > 1.6 && bs.length < 12) {
      acc = 0;
      spawn();
    }
    wipe(ctx, w, h, o, Math.min(1, 0.04 * k));
    glow(ctx, o);
    for (let i = bs.length - 1; i >= 0; i--) {
      const b = bs[i];
      b.age += dt;
      const p = b.age / b.life;
      if (p >= 1) {
        bs.splice(i, 1);
        continue;
      }
      b.r = b.max * (1 - Math.pow(1 - p, 3));
      const a =
        Math.sin(Math.PI * Math.min(1, p * 1.15)) * o.intensity * 0.03 * k;
      for (let j = 0; j < 5; j++) {
        const ang = b.ph + j * 1.26 + t * 0.05,
          off = b.r * 0.25,
          rr = b.r * (0.6 + 0.1 * j);
        const x = b.x + Math.cos(ang) * off,
          y = b.y + Math.sin(ang) * off;
        const col = o.colors[b.c];
        const g = ctx.createRadialGradient(x, y, rr * 0.2, x, y, rr);
        g.addColorStop(0, rgba(col, a * 6));
        g.addColorStop(0.7, rgba(col, a * 5));
        g.addColorStop(0.92, rgba(col, a * 9)); // darker pigment edge
        g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, TAU);
        ctx.fill();
      }
    }
  };
};

/* 12 ── Oil & Gesture: bristle brush strokes sweeping across the canvas */
const brushStrokes: Factory = (ctx, w, h, o) => {
  const n = o.colors.length,
    M = 44;
  type Br = { off: number; a: number; lw: number; s0: number; s1: number };
  type St = {
    px: number[];
    py: number[];
    nx: number[];
    ny: number[];
    br: Br[];
    age: number;
    life: number;
    c: number;
    wd: number;
  };
  const make = (): St => {
    const x0 = Math.random() * w * 0.5,
      y0 = Math.random() * h,
      ang = (Math.random() - 0.5) * 1.2;
    const len = w * (0.35 + Math.random() * 0.4);
    const x3 = x0 + Math.cos(ang) * len,
      y3 = y0 + Math.sin(ang) * len;
    const c1x = x0 + len * 0.3,
      c1y = y0 + (Math.random() - 0.5) * h * 0.5;
    const c2x = x0 + len * 0.7,
      c2y = y3 + (Math.random() - 0.5) * h * 0.5;
    const px: number[] = [],
      py: number[] = [],
      nx: number[] = [],
      ny: number[] = [];
    for (let i = 0; i <= M; i++) {
      const s = i / M,
        u = 1 - s;
      px.push(
        u * u * u * x0 +
          3 * u * u * s * c1x +
          3 * u * s * s * c2x +
          s * s * s * x3,
      );
      py.push(
        u * u * u * y0 +
          3 * u * u * s * c1y +
          3 * u * s * s * c2y +
          s * s * s * y3,
      );
      const dx =
        3 * u * u * (c1x - x0) +
        6 * u * s * (c2x - c1x) +
        3 * s * s * (x3 - c2x);
      const dy =
        3 * u * u * (c1y - y0) +
        6 * u * s * (c2y - c1y) +
        3 * s * s * (y3 - c2y);
      const l = Math.hypot(dx, dy) || 1;
      nx.push(-dy / l);
      ny.push(dx / l);
    }
    const br: Br[] = Array.from({ length: 22 }, (_, j) => ({
      off: j / 21 - 0.5 + (Math.random() - 0.5) * 0.04,
      a: 0.25 + Math.random() * 0.5,
      lw: 1 + Math.random() * 2.6,
      s0: Math.random() * 0.08,
      s1: 0.8 + Math.random() * 0.2,
    }));
    return {
      px,
      py,
      nx,
      ny,
      br,
      age: 0,
      life: 8 + Math.random() * 4,
      c: Math.floor(Math.random() * n),
      wd: Math.min(w, h) * (0.05 + Math.random() * 0.07),
    };
  };
  const sts: St[] = [];
  for (let i = 0; i < 4; i++) {
    const s = make();
    s.age = Math.random() * 6;
    sts.push(s);
  }
  let last = 0,
    acc = 0;
  return (t) => {
    const dt = Math.min(0.1, Math.max(0, t - last));
    last = t;
    acc += dt;
    if (acc > 1.8 && sts.length < 7) {
      acc = 0;
      sts.push(make());
    }
    wipe(ctx, w, h, o);
    ctx.lineCap = "round";
    for (let si = sts.length - 1; si >= 0; si--) {
      const s = sts[si];
      s.age += dt;
      if (s.age > s.life) {
        sts.splice(si, 1);
        continue;
      }
      const p = 1 - Math.pow(1 - Math.min(1, s.age / 2.4), 2.2);
      const fade = Math.min(1, (s.life - s.age) / 2.5);
      for (const b of s.br) {
        ctx.strokeStyle = rgba(
          o.colors[s.c],
          Math.min(1, b.a * fade * o.intensity * 1.3),
        );
        ctx.lineWidth = b.lw;
        ctx.beginPath();
        let started = false;
        for (let i = 0; i <= M; i++) {
          const sp = i / M;
          if (sp < b.s0 || sp > Math.min(b.s1, p)) continue;
          const taper = Math.pow(
            Math.sin(Math.PI * Math.min(1, Math.max(0.02, sp))),
            0.5,
          );
          const x = s.px[i] + s.nx[i] * b.off * s.wd * taper,
            y = s.py[i] + s.ny[i] * b.off * s.wd * taper;
          if (started) ctx.lineTo(x, y);
          else {
            ctx.moveTo(x, y);
            started = true;
          }
        }
        ctx.stroke();
      }
    }
  };
};

/* 13 ── Dither Pixel: Bayer-dithered pixel-art plasma */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const ditherField: Factory = (ctx, w, h, o) => {
  const L = lowRes(w, h, 6),
    n = o.colors.length,
    bg = rgb(o.bg),
    k = Math.min(1, o.intensity * 1.3);
  const lv = [
    bg,
    ...o.colors
      .map(rgb)
      .map((p) => p.map((c, i) => Math.round(c * k + bg[i] * (1 - k)))),
  ];
  const d = L.img.data;
  return (t) => {
    for (let y = 0; y < L.ch; y++)
      for (let x = 0; x < L.cw; x++) {
        const nx = x / L.cw,
          ny = y / L.ch;
        let v =
          0.5 +
          0.2 * Math.sin(nx * 7 + t * 0.4) +
          0.2 * Math.sin(ny * 9 - t * 0.3 + nx * 3) +
          0.15 *
            Math.sin(Math.hypot(nx - 0.5, (ny - 0.5) * 0.6) * 14 - t * 0.5);
        v = Math.min(1, Math.max(0, v));
        v = Math.min(1, v * v * 1.5);
        const idx = Math.max(
          0,
          Math.min(
            n,
            Math.floor(v * (n + 1) + BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.5),
          ),
        );
        const c = lv[idx],
          i = (y * L.cw + x) * 4;
        d[i] = c[0];
        d[i + 1] = c[1];
        d[i + 2] = c[2];
        d[i + 3] = 255;
      }
    L.x.putImageData(L.img, 0, 0);
    normal(ctx);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(L.c, 0, 0, w, h);
  };
};

/* 14 ── Stained Glass: drifting Voronoi panes with dark leading */
const stainedGlass: Factory = (ctx, w, h, o) => {
  const L = lowRes(w, h, 5),
    n = o.colors.length,
    pal = o.colors.map(rgb),
    bg = rgb(o.bg);
  const lead = o.dark ? [6, 6, 8] : [28, 28, 34];
  const N = 16,
    a = Math.min(1, 0.35 + o.intensity * 0.7);
  const seeds = Array.from({ length: N }, (_, i) => ({
    bx: Math.random(),
    by: Math.random(),
    fx: 0.1 + Math.random() * 0.25,
    fy: 0.1 + Math.random() * 0.25,
    px: Math.random() * TAU,
    py: Math.random() * TAU,
    c: i % n,
  }));
  const sx = new Float32Array(N),
    sy = new Float32Array(N),
    d = L.img.data;
  return (t) => {
    seeds.forEach((s, i) => {
      sx[i] = (s.bx + 0.12 * Math.sin(t * s.fx + s.px)) * L.cw;
      sy[i] = (s.by + 0.12 * Math.sin(t * s.fy + s.py)) * L.ch;
    });
    for (let y = 0; y < L.ch; y++)
      for (let x = 0; x < L.cw; x++) {
        let d1 = 1e9,
          d2 = 1e9,
          id = 0;
        for (let i = 0; i < N; i++) {
          const dx = x - sx[i],
            dy = y - sy[i],
            dd = dx * dx + dy * dy;
          if (dd < d1) {
            d2 = d1;
            d1 = dd;
            id = i;
          } else if (dd < d2) d2 = dd;
        }
        const r1 = Math.sqrt(d1),
          edge = Math.sqrt(d2) - r1,
          i4 = (y * L.cw + x) * 4;
        let r: number, g: number, b: number;
        if (edge < 0.7) {
          r = lead[0];
          g = lead[1];
          b = lead[2];
        } else {
          const s = seeds[id],
            p = pal[s.c];
          const br =
            (0.45 + 0.55 * (1 - Math.min(1, r1 / (L.cw * 0.12)))) *
            (0.85 + 0.15 * Math.sin(t * 0.8 + id));
          r = bg[0] + (p[0] * br - bg[0]) * a;
          g = bg[1] + (p[1] * br - bg[1]) * a;
          b = bg[2] + (p[2] * br - bg[2]) * a;
        }
        d[i4] = r;
        d[i4 + 1] = g;
        d[i4 + 2] = b;
        d[i4 + 3] = 255;
      }
    L.x.putImageData(L.img, 0, 0);
    normal(ctx);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(L.c, 0, 0, w, h);
  };
};

/* 15 ── Live Pen: a stylus drawing itself, strokes fading as they age */
const livePen: Factory = (ctx, w, h, o) => {
  type Pt = {
    x: number;
    y: number;
    t: number;
    lw: number;
    a: number;
    b: boolean;
  };
  const TR = 9,
    n = o.colors.length;
  const pens = Array.from({ length: 3 }, (_, i) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    hd: Math.random() * TAU,
    ph: Math.random() * TAU,
    c: i % n,
    on: 6 + Math.random() * 6,
    age: Math.random() * 5,
    sp: 90 + Math.random() * 60,
    brk: true,
    pts: [] as Pt[],
  }));
  let last = 0;
  return (t) => {
    const dt = Math.min(0.1, Math.max(0, t - last));
    last = t;
    wipe(ctx, w, h, o);
    glow(ctx, o);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const p of pens) {
      p.age += dt;
      if (p.age > p.on) {
        p.age = 0;
        p.on = 6 + Math.random() * 7;
        p.x = Math.random() * w;
        p.y = Math.random() * h;
        p.hd = Math.random() * TAU;
        p.brk = true;
      } else {
        p.hd +=
          (Math.sin(t * 0.7 + p.ph) +
            Math.sin(t * 1.9 + p.ph * 2.1) * 0.6 +
            Math.sin(t * 0.23 + p.ph * 3)) *
          dt *
          2;
        const nx = p.x + Math.cos(p.hd) * p.sp * dt,
          ny = p.y + Math.sin(p.hd) * p.sp * dt;
        if (nx < 0 || ny < 0 || nx > w || ny > h)
          p.hd = Math.atan2(h / 2 - p.y, w / 2 - p.x) + (Math.random() - 0.5);
        else {
          const pr = 0.5 + 0.5 * Math.sin(t * 1.3 + p.ph * 1.7);
          p.pts.push({
            x: nx,
            y: ny,
            t,
            lw: 0.6 + 2.2 * pr,
            a: 0.35 + 0.5 * pr,
            b: p.brk,
          });
          p.brk = false;
          p.x = nx;
          p.y = ny;
        }
      }
      while (p.pts.length && t - p.pts[0].t > TR) p.pts.shift();
      const P = p.pts;
      for (let i = 1; i < P.length; i += 5) {
        const e = Math.min(P.length - 1, i + 4);
        ctx.beginPath();
        ctx.moveTo(P[i - 1].x, P[i - 1].y);
        for (let j = i; j <= e; j++) {
          if (P[j].b) ctx.moveTo(P[j].x, P[j].y);
          else ctx.lineTo(P[j].x, P[j].y);
        }
        const age = (t - P[e].t) / TR;
        ctx.strokeStyle = rgba(
          o.colors[p.c],
          Math.min(1, P[i].a * Math.pow(1 - age, 1.5) * o.intensity * 1.4),
        );
        ctx.lineWidth = P[i].lw;
        ctx.stroke();
      }
      if (P.length) {
        const q = P[P.length - 1];
        ctx.fillStyle = o.colors[p.c];
        ctx.shadowColor = o.colors[p.c];
        ctx.shadowBlur = o.dark ? 14 : 0;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 2.6, 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  };
};

/* 16 ── Grain Mesh: soft mesh-gradient blobs with animated film grain */
const grainMesh: Factory = (ctx, w, h, o) => {
  const tile = document.createElement("canvas");
  tile.width = tile.height = 160;
  const tc = tile.getContext("2d")!,
    im = tc.createImageData(160, 160);
  for (let i = 0; i < 160 * 160; i++) {
    const v = Math.random() * 255;
    im.data[i * 4] = v;
    im.data[i * 4 + 1] = v;
    im.data[i * 4 + 2] = v;
    im.data[i * 4 + 3] = 255;
  }
  tc.putImageData(im, 0, 0);
  const pat = ctx.createPattern(tile, "repeat")!;
  const R = Math.max(w, h) * 0.55,
    n = o.colors.length;
  let fr = 0,
    ox = 0,
    oy = 0;
  return (t) => {
    wipe(ctx, w, h, o);
    glow(ctx, o);
    for (let i = 0; i < 5; i++) {
      const x = w * (0.5 + 0.4 * Math.sin(t * (0.11 + i * 0.037) + i * 1.9));
      const y = h * (0.5 + 0.4 * Math.cos(t * (0.09 + i * 0.041) + i * 2.7));
      const r = R * (0.7 + 0.3 * Math.sin(t * 0.17 + i));
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(
        0,
        rgba(o.colors[i % n], Math.min(0.9, 0.7 * o.intensity * 1.4)),
      );
      g.addColorStop(1, rgba(o.colors[i % n], 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    if (++fr % 2 === 0) {
      ox = Math.random() * 160;
      oy = Math.random() * 160;
    }
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = 0.4;
    ctx.translate(-ox, -oy);
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, w + 160, h + 160);
    ctx.restore();
  };
};

/* 17 ── Glitch Scan: RGB-split data bursts over scanlines */
const glitchScan: Factory = (ctx, w, h, o) => {
  type G = {
    y: number;
    h: number;
    x: number;
    w: number;
    c: number;
    life: number;
    age: number;
    a: number;
    sh: number;
  };
  const gs: G[] = [],
    n = o.colors.length;
  let last = 0,
    next = 0.4;
  return (t) => {
    const dt = Math.min(0.1, Math.max(0, t - last));
    last = t;
    wipe(ctx, w, h, o);
    glow(ctx, o);
    const by = (((t * 0.08) % 1.3) - 0.15) * h;
    const bg = ctx.createLinearGradient(0, by - 90, 0, by + 90);
    bg.addColorStop(0, rgba(o.colors[0], 0));
    bg.addColorStop(0.5, rgba(o.colors[0], 0.12 * o.intensity * 1.4));
    bg.addColorStop(1, rgba(o.colors[0], 0));
    ctx.fillStyle = bg;
    ctx.fillRect(0, by - 90, w, 180);
    if (t >= next) {
      const burst = 3 + Math.floor(Math.random() * 6),
        y0 = Math.random() * h;
      for (let i = 0; i < burst; i++)
        gs.push({
          y: y0 + (Math.random() - 0.5) * h * 0.3,
          h:
            Math.random() < 0.4
              ? 1 + Math.random() * 2
              : 4 + Math.random() * 50,
          x: Math.random() * w * 0.6,
          w: w * (0.2 + Math.random() * 0.7),
          c: Math.floor(Math.random() * n),
          life: 0.12 + Math.random() * 0.35,
          age: 0,
          a: 0.25 + Math.random() * 0.5,
          sh: (Math.random() - 0.5) * 40,
        });
      next = t + 0.4 + Math.random() * 1.8;
    }
    for (let i = gs.length - 1; i >= 0; i--) {
      const g = gs[i];
      g.age += dt;
      if (g.age > g.life) {
        gs.splice(i, 1);
        continue;
      }
      const k = 1 - g.age / g.life,
        split = 7 * k;
      for (let ch = 0; ch < 3; ch++) {
        ctx.fillStyle = rgba(
          o.colors[(g.c + ch) % n],
          Math.min(1, g.a * k * o.intensity * 1.4),
        );
        ctx.fillRect(g.x + (ch - 1) * split + g.sh * (1 - k), g.y, g.w, g.h);
      }
    }
    normal(ctx);
    ctx.fillStyle = o.dark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.05)";
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
  };
};

/* 18 ── Kaleidoscope: mirrored wedges of drifting shapes */
const kaleidoscope: Factory = (ctx, w, h, o) => {
  const R = Math.hypot(w, h) / 2,
    TW = Math.PI / 6,
    n = o.colors.length;
  const sh = Array.from({ length: 16 }, (_, i) => ({
    ty: i % 4,
    c: i % n,
    sa: 0.15 + Math.random() * 0.4,
    pa: Math.random() * TAU,
    sr: 0.1 + Math.random() * 0.25,
    pr: Math.random() * TAU,
    ss: Math.random() * TAU,
    sp: 0.2 + Math.random() * 0.4,
    rot: Math.random() * TAU,
  }));
  const wedge = (t: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(R, 0);
    ctx.arc(0, 0, R, 0, TW);
    ctx.closePath();
    ctx.clip();
    for (const s of sh) {
      const a = TW * (0.5 + 0.5 * Math.sin(t * s.sa + s.pa));
      const r = R * (0.06 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.sr + s.pr)));
      const x = Math.cos(a) * r,
        y = Math.sin(a) * r;
      const sz = R * (0.025 + 0.06 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ss)));
      const col = o.colors[s.c];
      ctx.fillStyle = rgba(col, Math.min(1, 0.35 * o.intensity * 1.6));
      ctx.strokeStyle = rgba(col, Math.min(1, 0.7 * o.intensity * 1.4));
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (s.ty === 0) ctx.arc(x, y, sz, 0, TAU);
      else if (s.ty === 1) {
        for (let k = 0; k < 3; k++) {
          const q = s.rot + t * 0.3 + (k * TAU) / 3,
            px = x + Math.cos(q) * sz * 1.4,
            py = y + Math.sin(q) * sz * 1.4;
          k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.closePath();
      } else if (s.ty === 2) {
        const q = s.rot + t * 0.4;
        ctx.moveTo(x - Math.cos(q) * sz * 2.5, y - Math.sin(q) * sz * 2.5);
        ctx.lineTo(x + Math.cos(q) * sz * 2.5, y + Math.sin(q) * sz * 2.5);
      } else ctx.arc(x, y, sz * 1.6, 0, TAU);
      if (s.ty >= 2) ctx.stroke();
      else {
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  };
  return (t) => {
    wipe(ctx, w, h, o, 0.35);
    glow(ctx, o);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(t * 0.04);
    for (let k = 0; k < 6; k++) {
      ctx.save();
      ctx.rotate(k * 2 * TW);
      wedge(t);
      ctx.scale(1, -1);
      wedge(t);
      ctx.restore();
    }
    ctx.restore();
  };
};

/* 19 ── Paper Layers: stacked paper-cut waves casting soft shadows */
const paperLayers: Factory = (ctx, w, h, o) => {
  const L = 7,
    n = o.colors.length;
  return (t) => {
    wipe(ctx, w, h, o);
    for (let l = 0; l < L; l++) {
      const k = l / (L - 1),
        base = h * (0.22 + 0.1 * l);
      const col = mix(o.colors[l % n], o.bg, (1 - k) * 0.55 + 0.05);
      const top = new Path2D(),
        fill = new Path2D();
      fill.moveTo(0, h);
      for (let x = 0; x <= w + 10; x += 10) {
        const nx = x / w;
        const y =
          base +
          Math.sin(nx * (2 + l * 0.45) + t * 0.18 * (1 + l * 0.12) + l * 1.7) *
            h *
            0.06 +
          Math.sin(nx * 5.5 - t * 0.12 + l * 2.3) * h * 0.02;
        fill.lineTo(x, y);
        x === 0 ? top.moveTo(x, y) : top.lineTo(x, y);
      }
      fill.lineTo(w + 10, h);
      fill.closePath();
      ctx.save();
      ctx.shadowColor = o.dark ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.22)";
      ctx.shadowBlur = 22;
      ctx.shadowOffsetY = -6;
      ctx.fillStyle = col;
      ctx.fill(fill);
      ctx.restore();
      ctx.strokeStyle = o.dark
        ? "rgba(255,255,255,0.09)"
        : "rgba(255,255,255,0.45)";
      ctx.lineWidth = 1;
      ctx.stroke(top);
    }
  };
};

/* 20 ── Contour Topo: living topographic isolines (marching squares) */
const TOPO_TBL: number[][] = [
  [],
  [3, 2],
  [2, 1],
  [3, 1],
  [0, 1],
  [3, 0, 2, 1],
  [0, 2],
  [3, 0],
  [3, 0],
  [0, 2],
  [0, 1, 3, 2],
  [0, 1],
  [3, 1],
  [2, 1],
  [3, 2],
  [],
];
const contourTopo: Factory = (ctx, w, h, o) => {
  const C = 14,
    cols = Math.ceil(w / C),
    rows = Math.ceil(h / C),
    n = o.colors.length,
    LV = 10,
    W = cols + 1;
  const grid = new Float32Array(W * (rows + 1));
  let px = 0,
    py = 0,
    x0 = 0,
    y0 = 0,
    a = 0,
    b = 0,
    c = 0,
    d = 0,
    lv = 0;
  const edge = (e: number) => {
    if (e === 0) {
      px = x0 + ((lv - a) / (b - a)) * C;
      py = y0;
    } else if (e === 1) {
      px = x0 + C;
      py = y0 + ((lv - b) / (c - b)) * C;
    } else if (e === 2) {
      px = x0 + ((lv - d) / (c - d)) * C;
      py = y0 + C;
    } else {
      px = x0;
      py = y0 + ((lv - a) / (d - a)) * C;
    }
  };
  return (t) => {
    wipe(ctx, w, h, o);
    glow(ctx, o);
    for (let j = 0; j <= rows; j++)
      for (let i = 0; i <= cols; i++) {
        const nx = i / cols,
          ny = j / rows;
        grid[j * W + i] =
          (Math.sin(nx * 5 + t * 0.2) +
            Math.sin(ny * 4 - t * 0.15 + nx * 2) +
            Math.sin((nx + ny) * 6 + t * 0.1) +
            Math.sin(Math.hypot(nx - 0.5, ny - 0.5) * 9 - t * 0.3)) *
            0.125 +
          0.5;
      }
    for (let li = 0; li < LV; li++) {
      lv = 0.12 + li * (0.76 / (LV - 1));
      const P = new Path2D();
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          a = grid[j * W + i];
          b = grid[j * W + i + 1];
          c = grid[(j + 1) * W + i + 1];
          d = grid[(j + 1) * W + i];
          const cs =
            (a > lv ? 8 : 0) |
            (b > lv ? 4 : 0) |
            (c > lv ? 2 : 0) |
            (d > lv ? 1 : 0);
          const seg = TOPO_TBL[cs];
          if (!seg.length) continue;
          x0 = i * C;
          y0 = j * C;
          for (let s = 0; s < seg.length; s += 2) {
            edge(seg[s]);
            P.moveTo(px, py);
            edge(seg[s + 1]);
            P.lineTo(px, py);
          }
        }
      ctx.lineWidth = li % 3 === 0 ? 1.4 : 0.7;
      ctx.strokeStyle = rgba(
        o.colors[li % n],
        Math.min(1, 0.25 + 0.55 * o.intensity),
      );
      ctx.stroke(P);
    }
  };
};

/* ───────── batch 3: clean & creative ───────── */
const ramp = (cs: string[], f: number) => {
  if (cs.length < 2) return cs[0];
  const p = Math.min(1, Math.max(0, f)) * (cs.length - 1);
  const i = Math.min(cs.length - 2, Math.floor(p));
  return mix(cs[i], cs[i + 1], p - i);
};

/* 21 ── Pendulum Wave: dots drifting in and out of phase */
const pendulumWave: Factory = (ctx, w, h, o) => {
  const N = 34,
    T = 48,
    A = h * 0.28,
    cy = h / 2;
  const cols = Array.from({ length: N }, (_, i) => ramp(o.colors, i / (N - 1)));
  return (t) => {
    wipe(ctx, w, h, o, 0.16);
    glow(ctx, o);
    ctx.strokeStyle = rgba(o.colors[0], 0.12);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.06, cy);
    ctx.lineTo(w * 0.94, cy);
    ctx.stroke();
    for (let i = 0; i < N; i++) {
      const x = w * (0.08 + (0.84 * i) / (N - 1));
      const y = cy + A * Math.sin((TAU * (10 + i) * t) / T);
      ctx.strokeStyle = rgba(cols[i], 0.18);
      ctx.beginPath();
      ctx.moveTo(x, cy);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalAlpha = Math.min(1, 0.5 + o.intensity * 0.5);
      ctx.fillStyle = cols[i];
      ctx.beginPath();
      ctx.arc(x, y, 3 + 2.5 * (1 - Math.abs(y - cy) / A), 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  };
};

/* 22 ── Moiré Rings: two ring sets sliding into interference */
const moireRings: Factory = (ctx, w, h, o) => {
  const gap = Math.max(10, Math.min(w, h) / 60),
    maxR = Math.hypot(w, h) / 2 + 100;
  const rings = (cx: number, cy: number, g: number, col: string) => {
    ctx.strokeStyle = rgba(col, 0.2 + 0.35 * o.intensity);
    ctx.beginPath();
    for (let r = g; r < maxR; r += g) {
      ctx.moveTo(cx + r, cy);
      ctx.arc(cx, cy, r, 0, TAU);
    }
    ctx.stroke();
  };
  return (t) => {
    wipe(ctx, w, h, o);
    glow(ctx, o);
    ctx.lineWidth = 0.8;
    const dx = w * 0.1 * Math.cos(t * 0.11),
      dy = h * 0.08 * Math.sin(t * 0.17);
    rings(w / 2 - dx, h / 2 - dy, gap, o.colors[0]);
    rings(w / 2 + dx, h / 2 + dy, gap * 1.03, o.colors[1 % o.colors.length]);
  };
};

/* 23 ── Bokeh Drift: out-of-focus lens discs with bright rims */
const bokehDrift: Factory = (ctx, w, h, o) => {
  const n = o.colors.length;
  const ds = Array.from({ length: 26 }, (_, i) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 20 + Math.random() * Math.min(w, h) * 0.09,
    vx: (Math.random() - 0.3) * 10,
    vy: -(4 + Math.random() * 12),
    c: i % n,
    ph: Math.random() * TAU,
    sp: 0.2 + Math.random() * 0.4,
  }));
  let last = 0;
  return (t) => {
    const dt = Math.min(0.1, Math.max(0, t - last));
    last = t;
    wipe(ctx, w, h, o);
    glow(ctx, o);
    for (const d of ds) {
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      if (d.y < -d.r) {
        d.y = h + d.r;
        d.x = Math.random() * w;
      }
      if (d.x < -d.r) d.x = w + d.r;
      if (d.x > w + d.r) d.x = -d.r;
      const a =
          (0.5 + 0.5 * Math.sin(t * d.sp + d.ph)) * o.intensity * 0.5 + 0.04,
        col = o.colors[d.c];
      const g = ctx.createRadialGradient(d.x, d.y, d.r * 0.4, d.x, d.y, d.r);
      g.addColorStop(0, rgba(col, a * 0.5));
      g.addColorStop(0.8, rgba(col, a * 0.7));
      g.addColorStop(0.94, rgba(col, a * 1.5));
      g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, TAU);
      ctx.fill();
    }
  };
};

/* 24 ── Warp Grid: a fine grid bent by drifting masses */
const warpGrid: Factory = (ctx, w, h, o) => {
  const S = 12,
    cols = Math.ceil(w / S),
    rows = Math.ceil(h / S),
    W = cols + 1;
  const X = new Float32Array(W * (rows + 1)),
    Y = new Float32Array(W * (rows + 1));
  const sg = Math.min(w, h) * 0.16;
  return (t) => {
    wipe(ctx, w, h, o);
    glow(ctx, o);
    const ms = [0, 1, 2].map((i) => ({
      x: w * (0.5 + 0.32 * Math.sin(t * (0.17 + i * 0.05) + i * 2.1)),
      y: h * (0.5 + 0.3 * Math.cos(t * (0.13 + i * 0.07) + i * 1.3)),
    }));
    for (let j = 0; j <= rows; j++)
      for (let i = 0; i <= cols; i++) {
        const px = i * S,
          py = j * S;
        let dx = 0,
          dy = 0;
        for (const m of ms) {
          const ex = m.x - px,
            ey = m.y - py,
            f = Math.exp(-(ex * ex + ey * ey) / (2 * sg * sg));
          dx += ex * f * 0.66;
          dy += ey * f * 0.66;
        }
        X[j * W + i] = px + dx;
        Y[j * W + i] = py + dy;
      }
    const Ph = new Path2D(),
      Pv = new Path2D();
    for (let j = 0; j <= rows; j += 3)
      for (let i = 0; i <= cols; i++) {
        const k = j * W + i;
        i ? Ph.lineTo(X[k], Y[k]) : Ph.moveTo(X[k], Y[k]);
      }
    for (let i = 0; i <= cols; i += 3)
      for (let j = 0; j <= rows; j++) {
        const k = j * W + i;
        j ? Pv.lineTo(X[k], Y[k]) : Pv.moveTo(X[k], Y[k]);
      }
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = rgba(o.colors[0], 0.2 + 0.35 * o.intensity);
    ctx.stroke(Ph);
    ctx.strokeStyle = rgba(
      o.colors[1 % o.colors.length],
      0.2 + 0.35 * o.intensity,
    );
    ctx.stroke(Pv);
    for (const m of ms) {
      const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, sg * 0.6);
      g.addColorStop(
        0,
        rgba(o.colors[2 % o.colors.length], 0.3 * o.intensity * 1.4),
      );
      g.addColorStop(1, rgba(o.colors[2 % o.colors.length], 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(m.x, m.y, sg * 0.6, 0, TAU);
      ctx.fill();
    }
  };
};

/* 25 ── Ridgeline: stacked pulsar-plot waveforms with occlusion */
const ridgeline: Factory = (ctx, w, h, o) => {
  const R = 34,
    x0 = w * 0.14,
    x1 = w * 0.86;
  const cols = Array.from({ length: R }, (_, r) => ramp(o.colors, r / (R - 1)));
  return (t) => {
    wipe(ctx, w, h, o);
    const top = h * 0.2,
      step = (h * 0.68) / R,
      amp = h * 0.12;
    ctx.lineWidth = 1.2;
    ctx.lineJoin = "round";
    for (let r = 0; r < R; r++) {
      const base = top + r * step,
        P = new Path2D();
      P.moveTo(x0, base);
      for (let x = x0; x <= x1; x += 5) {
        const u = (x - w / 2) / ((x1 - x0) / 2),
          env = Math.exp(-u * u * 2.2);
        const nz =
          Math.sin(x * 0.045 + r * 0.8 - t) * 0.5 +
          Math.sin(x * 0.11 - r * 0.3 + t * 0.7) * 0.3 +
          Math.sin(x * 0.02 + t * 0.4 + r * 0.1) * 0.4;
        P.lineTo(x, base - amp * env * Math.pow(Math.abs(nz), 1.5));
      }
      P.lineTo(x1, base);
      const F = new Path2D(P);
      F.lineTo(x1, h);
      F.lineTo(x0, h);
      F.closePath();
      ctx.fillStyle = o.bg;
      ctx.fill(F);
      ctx.strokeStyle = rgba(cols[r], Math.min(1, 0.45 + o.intensity * 0.6));
      ctx.stroke(P);
    }
  };
};

/* 26 ── Sunflower: phyllotaxis spiral that slowly re-tunes its angle */
const phyllotaxis: Factory = (ctx, w, h, o) => {
  const N = 720,
    cx = w / 2,
    cy = h / 2,
    c = (Math.min(w, h) * 0.46) / Math.sqrt(N),
    GA = 2.399963229728653;
  const cols = Array.from({ length: N }, (_, i) => ramp(o.colors, i / (N - 1)));
  return (t) => {
    wipe(ctx, w, h, o);
    glow(ctx, o);
    const d = GA + 0.0008 * Math.sin(t * 0.12),
      rot = t * 0.05,
      k = 1 + 0.03 * Math.sin(t * 0.4);
    for (let i = 1; i < N; i++) {
      const a = i * d + rot,
        r = c * Math.sqrt(i) * k,
        f = i / N;
      ctx.globalAlpha = Math.min(1, 0.35 + 0.65 * o.intensity * (0.4 + f));
      ctx.fillStyle = cols[i];
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(a) * r,
        cy + Math.sin(a) * r,
        0.7 + 2.4 * f * (0.8 + 0.2 * Math.sin(t * 1.2 - i * 0.02)),
        0,
        TAU,
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };
};

/* 27 ── Color Field: soft breathing fields of pure color */
const colorField: Factory = (ctx, w, h, o) => {
  const n = o.colors.length;
  const F = [
    { y: 0.1, hh: 0.27, ph: 0 },
    { y: 0.4, hh: 0.22, ph: 2 },
    { y: 0.67, hh: 0.24, ph: 4 },
  ];
  return (t) => {
    wipe(ctx, w, h, o);
    F.forEach((f, i) => {
      const br = 1 + 0.025 * Math.sin(t * 0.25 + f.ph);
      const fw = w * 0.64 * br,
        fh = h * f.hh * br;
      const cx = w / 2 + Math.sin(t * 0.1 + f.ph) * w * 0.01,
        cy = h * (f.y + f.hh / 2);
      ctx.fillStyle = rgba(o.colors[i % n], 0.08 + 0.1 * o.intensity);
      for (let k = 0; k < 16; k++) {
        const ins = k * Math.min(fw, fh) * 0.028;
        ctx.fillRect(
          cx - fw / 2 + ins,
          cy - fh / 2 + ins,
          fw - ins * 2,
          fh - ins * 2,
        );
      }
    });
  };
};

/* 28 ── Ripple Rain: raindrop rings that interfere on contact */
const rippleRain: Factory = (ctx, w, h, o) => {
  type D = { x: number; y: number; age: number; c: number };
  const n = o.colors.length,
    ds: D[] = [];
  const drop = (age = 0) =>
    ds.push({
      x: w * (0.08 + 0.84 * Math.random()),
      y: h * (0.1 + 0.8 * Math.random()),
      age,
      c: Math.floor(Math.random() * n),
    });
  for (let i = 0; i < 3; i++) drop(i * 2);
  let last = 0,
    next = 0.5;
  return (t) => {
    const dt = Math.min(0.1, Math.max(0, t - last));
    last = t;
    wipe(ctx, w, h, o);
    glow(ctx, o);
    if (t >= next) {
      drop();
      next = t + 0.7 + Math.random() * 1.3;
    }
    for (let i = ds.length - 1; i >= 0; i--) {
      const d = ds[i];
      d.age += dt;
      if (d.age > 7) {
        ds.splice(i, 1);
        continue;
      }
      const f = Math.max(0, 1 - d.age / 7);
      for (let k = 0; k < 4; k++) {
        const r = d.age * 85 - k * 22;
        if (r <= 0) continue;
        ctx.strokeStyle = rgba(
          o.colors[d.c],
          Math.min(1, f * f * (0.7 - k * 0.12) * o.intensity * 1.4),
        );
        ctx.lineWidth = 1.2 - k * 0.2;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, TAU);
        ctx.stroke();
      }
    }
  };
};

/* 29 ── Glyph Field: typographic plasma made of monospace characters */
const glyphField: Factory = (ctx, w, h, o) => {
  const fs = Math.max(14, Math.round(Math.min(w, h) / 34)),
    cw = fs * 0.62,
    ch = fs * 1.3;
  const cols = Math.ceil(w / cw),
    rows = Math.ceil(h / ch);
  const CH = [" ", "·", ".", ":", "-", "=", "+", "*", "#", "%", "@"];
  const pal = Array.from({ length: 8 }, (_, i) =>
    rgba(
      ramp(o.colors, i / 7),
      Math.min(1, 0.25 + 0.75 * o.intensity * (0.4 + i / 7)),
    ),
  );
  return (t) => {
    wipe(ctx, w, h, o);
    ctx.font = `300 ${fs}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    ctx.textBaseline = "top";
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const x = i * cw,
          y = j * ch;
        let v =
          0.5 +
          0.25 *
            Math.sin(
              x * 0.008 + t * 0.6 + Math.sin(y * 0.006 + t * 0.2) * 1.5,
            ) +
          0.22 * Math.sin(y * 0.011 - t * 0.5) +
          0.15 * Math.sin((x + y) * 0.005 + t * 0.3);
        v = Math.min(1, Math.max(0, v));
        const idx = Math.min(CH.length - 1, Math.floor(v * v * CH.length));
        if (idx <= 0) continue;
        ctx.fillStyle = pal[Math.min(7, Math.floor(v * 8))];
        ctx.fillText(CH[idx], x, y);
      }
  };
};

/* 30 ── String Art: the times-table circle, slowly morphing */
const stringArt: Factory = (ctx, w, h, o) => {
  const N = 220,
    B = 8,
    R = Math.min(w, h) * 0.4,
    cx = w / 2,
    cy = h / 2;
  const cols = Array.from({ length: B }, (_, b) => ramp(o.colors, b / (B - 1)));
  return (t) => {
    wipe(ctx, w, h, o);
    glow(ctx, o);
    const m = 2 + 3 * (0.5 - 0.5 * Math.cos(t * 0.06));
    const paths = cols.map(() => new Path2D());
    for (let i = 0; i < N; i++) {
      const a1 = (i / N) * TAU - Math.PI / 2,
        a2 = (((i * m) % N) / N) * TAU - Math.PI / 2,
        P = paths[Math.floor((i / N) * B)];
      P.moveTo(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R);
      P.lineTo(cx + Math.cos(a2) * R, cy + Math.sin(a2) * R);
    }
    ctx.lineWidth = 0.7;
    paths.forEach((P, b) => {
      ctx.strokeStyle = rgba(cols[b], 0.14 + 0.3 * o.intensity);
      ctx.stroke(P);
    });
    ctx.strokeStyle = rgba(o.colors[0], 0.25);
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = rgba(o.colors[0], 0.7);
    for (let i = 0; i < N; i += 4) {
      const a = (i / N) * TAU - Math.PI / 2;
      ctx.fillRect(cx + Math.cos(a) * R - 1, cy + Math.sin(a) * R - 1, 2, 2);
    }
  };
};

const FACTORIES: Record<FuturisticType, Factory> = {
  eventHorizon,
  silkFilaments,
  orbitalGlobe,
  hypercube,
  halftoneTide,
  harmonograph,
  flowField,
  plexusDrift,
  spectralCurtains,
  prismBeams,
  inkBloom,
  brushStrokes,
  ditherField,
  stainedGlass,
  livePen,
  grainMesh,
  glitchScan,
  kaleidoscope,
  paperLayers,
  contourTopo,
  pendulumWave,
  moireRings,
  bokehDrift,
  warpGrid,
  ridgeline,
  phyllotaxis,
  colorField,
  rippleRain,
  glyphField,
  stringArt,
};

interface Props {
  type: FuturisticType;
  colors: string[];
  intensity: number;
  speed: number;
  dark: boolean;
}

export const FuturisticCanvas: React.FC<Props> = ({
  type,
  colors,
  intensity,
  speed,
  dark,
}) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const sp = speed * (reduced ? 0.2 : 1);
    const o: Opts = {
      colors: dark ? colors : colors.map((c) => mix(c, "#14141c", 0.45)),
      intensity,
      dark,
      bg: dark ? "#0a0a0a" : "#f5f5f5",
    };

    let raf = 0,
      frame: Frame = () => {};
    const start = performance.now();

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth,
        h = parent.clientHeight;
      if (!w || !h) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = o.bg;
      ctx.fillRect(0, 0, w, h);
      frame = FACTORIES[type](ctx, w, h, o);
    };
    const loop = (now: number) => {
      frame(((now - start) / 1000) * sp);
      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(setup);
    ro.observe(parent);
    setup();
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [type, colors, intensity, speed, dark]);

  return <canvas ref={ref} className="absolute inset-0 block w-full h-full" />;
};
