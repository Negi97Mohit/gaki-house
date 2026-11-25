import type { Factory } from "./types";
import { TAU, rgba, mix, wipe, glow, normal, rgb, lowRes, ramp, clamp01, smooth, rr, heart, star } from "./helpers";

export const bounceArcs: Factory = (ctx, w, h, o) => {
    const n = o.colors.length,
        fy = h * 0.82,
        bw = w * 0.15,
        M = Math.ceil((w * 1.1) / bw),
        B = 4;
    const pk = (k: number) =>
        h * (0.22 + (0.3 * (((k * 2654435761) >>> 0) % 100)) / 100);
    const balls = Array.from({ length: B }, (_, i) => ({
        off: (i * M) / B,
        sp: 0.55 + i * 0.07,
        c: i % n,
    }));
    const at = (u: number): [number, number] => {
        const uu = ((u % M) + M) % M,
            k = Math.floor(uu),
            f = uu - k;
        return [k * bw + f * bw - w * 0.05, fy - 4 * pk(k) * f * (1 - f)];
    };
    return (t) => {
        wipe(ctx, w, h, o);
        glow(ctx, o);
        ctx.strokeStyle = rgba(o.colors[0], 0.18);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, fy);
        ctx.lineTo(w, fy);
        ctx.stroke();
        for (const b of balls) {
            const u = t * b.sp + b.off,
                col = o.colors[b.c];
            for (let j = 22; j >= 0; j--) {
                const [x, y] = at(u - j * 0.018),
                    a = 1 - j / 23;
                ctx.fillStyle = rgba(
                    col,
                    a * a * 0.8 * Math.min(1, o.intensity * 1.4),
                );
                ctx.beginPath();
                ctx.arc(x, y, 2 + a * 5, 0, TAU);
                ctx.fill();
            }
            const [x] = at(u);
            ctx.fillStyle = rgba(col, 0.2);
            ctx.beginPath();
            ctx.ellipse(x, fy + 4, 10, 3, 0, 0, TAU);
            ctx.fill();
        }
    };
};

/* 42 ── Floodlights: stadium night lights sweeping the pitch */
export const floodlights: Factory = (ctx, w, h, o) => {
    const n = o.colors.length,
        xs = [0.12, 0.38, 0.62, 0.88];
    return (t) => {
        wipe(ctx, w, h, o);
        glow(ctx, o);
        xs.forEach((fx, i) => {
            const lx = w * fx,
                ly = h * 0.02,
                tx = w * (0.5 + 0.4 * Math.sin(t * 0.3 + i * 1.7)),
                col = o.colors[i % n];
            const th = Math.atan2(-(tx - lx), h - ly),
                len = Math.hypot(tx - lx, h - ly) * 1.15,
                half = 0.11 + 0.02 * Math.sin(t * 0.5 + i);
            ctx.save();
            ctx.translate(lx, ly);
            ctx.rotate(th);
            const g = ctx.createLinearGradient(0, 0, 0, len);
            g.addColorStop(0, rgba(col, Math.min(1, 0.4 * o.intensity * 1.4)));
            g.addColorStop(1, rgba(col, 0));
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-Math.tan(half) * len, len);
            ctx.lineTo(Math.tan(half) * len, len);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            ctx.fillStyle = rgba(col, 0.9);
            for (let a = 0; a < 6; a++)
                ctx.fillRect(
                    lx - 12 + (a % 3) * 10,
                    ly + Math.floor(a / 3) * 8,
                    4,
                    4,
                );
        });
        ctx.strokeStyle = rgba(o.colors[0], 0.16);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(w / 2, h * 0.95, w * 0.14, h * 0.06, 0, 0, TAU);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w / 2, h * 0.89);
        ctx.lineTo(w / 2, h);
        ctx.stroke();
    };
};

/* 43 ── Runway: a catwalk in perspective with a roaming spotlight */
export const runway: Factory = (ctx, w, h, o) => {
    const vx = w / 2,
        vy = h * 0.4,
        hw = w * 0.34,
        n = o.colors.length;
    const c0 = o.colors[0],
        c1 = o.colors[1 % n],
        c2 = o.colors[2 % n];
    return (t) => {
        wipe(ctx, w, h, o);
        glow(ctx, o);
        const bg = ctx.createRadialGradient(vx, vy, 0, vx, vy, h * 0.5);
        bg.addColorStop(0, rgba(c1, Math.min(1, 0.28 * o.intensity * 1.4)));
        bg.addColorStop(1, rgba(c1, 0));
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(c0, 0.45);
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(vx - hw, h);
        ctx.moveTo(vx, vy);
        ctx.lineTo(vx + hw, h);
        ctx.stroke();
        ctx.save();
        ctx.setLineDash([10, 14]);
        ctx.strokeStyle = rgba(c0, 0.18);
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(vx, h);
        ctx.stroke();
        ctx.restore();
        const fr = (t * 0.22) % 1;
        for (let k = 0; k < 15; k++) {
            const z = (k + fr) / 15,
                y = vy + (h - vy) * z * z,
                half = ((y - vy) / (h - vy)) * hw;
            ctx.strokeStyle = rgba(c0, 0.06 + 0.35 * z);
            ctx.beginPath();
            ctx.moveTo(vx - half, y);
            ctx.lineTo(vx + half, y);
            ctx.stroke();
            ctx.fillStyle = rgba(c2, 0.2 + 0.6 * z);
            ctx.beginPath();
            ctx.arc(vx - half, y, 1.5 + 3 * z, 0, TAU);
            ctx.arc(vx + half, y, 1.5 + 3 * z, 0, TAU);
            ctx.fill();
        }
        const zs = 0.42 + 0.4 * (0.5 + 0.5 * Math.sin(t * 0.35)),
            ys = vy + (h - vy) * zs * zs,
            rx = ((ys - vy) / (h - vy)) * hw * 1.2;
        const cone = ctx.createLinearGradient(0, 0, 0, ys);
        cone.addColorStop(0, rgba(c0, 0));
        cone.addColorStop(1, rgba(c0, Math.min(1, 0.25 * o.intensity * 1.4)));
        ctx.fillStyle = cone;
        ctx.beginPath();
        ctx.moveTo(vx - rx * 0.4, 0);
        ctx.lineTo(vx + rx * 0.4, 0);
        ctx.lineTo(vx + rx, ys);
        ctx.lineTo(vx - rx, ys);
        ctx.closePath();
        ctx.fill();
        ctx.save();
        ctx.translate(vx, ys);
        ctx.scale(1, 0.18);
        const pool = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
        pool.addColorStop(0, rgba(c0, Math.min(1, 0.6 * o.intensity * 1.4)));
        pool.addColorStop(1, rgba(c0, 0));
        ctx.fillStyle = pool;
        ctx.beginPath();
        ctx.arc(0, 0, rx, 0, TAU);
        ctx.fill();
        ctx.restore();
    };
};

/* 44 ── Satin Drape: slow-moving silk folds with specular sheen */
export const satinDrape: Factory = (ctx, w, h, o) => {
    const n = o.colors.length,
        c0 = o.colors[0],
        c1 = o.colors[1 % n];
    const stops = [mix(c0, "#000000", 0.6), c0, c1, mix(c1, "#ffffff", 0.55)];
    const lut = Array.from({ length: 64 }, (_, i) => ramp(stops, i / 63));
    return (t) => {
        wipe(ctx, w, h, o);
        for (let x = 0; x < w; x += 3) {
            const ph =
                x * 0.012 +
                Math.sin(x * 0.004 + t * 0.3) * 2.2 +
                Math.sin(x * 0.011 - t * 0.2) * 0.8;
            const b = 0.5 + 0.5 * Math.sin(ph * 2.3),
                v = clamp01(b * 0.85 + Math.pow(b, 10) * 0.35);
            ctx.fillStyle = lut[Math.floor(v * 63)];
            ctx.fillRect(x, 0, 3, h);
        }
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, rgba(o.bg, 0.75));
        g.addColorStop(0.35, rgba(o.bg, 0));
        g.addColorStop(0.7, rgba(o.bg, 0));
        g.addColorStop(1, rgba(o.bg, 0.6));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
    };
};

/* 45 ── Pattern Paper: dashed stitch lines and seam allowances */
export const stitchPattern: Factory = (ctx, w, h, o) => {
    const M = 7,
        n = o.colors.length;
    return (t) => {
        wipe(ctx, w, h, o);
        ctx.lineCap = "round";
        for (let i = 0; i < M; i++) {
            const col = o.colors[i % n],
                base = h * (0.15 + (0.7 * i) / (M - 1)),
                P = new Path2D();
            for (let x = 0; x <= w + 10; x += 10) {
                const y =
                    base +
                    Math.sin(x * 0.004 + t * 0.2 + i) * h * 0.06 +
                    Math.sin(x * 0.011 - t * 0.15 + i * 2) * h * 0.02;
                x === 0 ? P.moveTo(x, y) : P.lineTo(x, y);
            }
            ctx.setLineDash([9, 7]);
            ctx.lineDashOffset = -t * 20 * (i % 2 ? 1 : -1);
            ctx.lineWidth = 1.4;
            ctx.strokeStyle = rgba(col, Math.min(1, 0.3 + 0.5 * o.intensity));
            ctx.stroke(P);
            ctx.save();
            ctx.translate(0, 14);
            ctx.setLineDash([2, 6]);
            ctx.lineWidth = 1;
            ctx.strokeStyle = rgba(col, 0.2);
            ctx.stroke(P);
            ctx.restore();
        }
        ctx.setLineDash([]);
        const gx = w * 0.93,
            y0 = h * 0.2,
            y1 = h * 0.8;
        ctx.strokeStyle = rgba(o.colors[0], 0.35);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gx, y0);
        ctx.lineTo(gx, y1);
        ctx.moveTo(gx - 5, y0 + 10);
        ctx.lineTo(gx, y0);
        ctx.lineTo(gx + 5, y0 + 10);
        ctx.moveTo(gx - 5, y1 - 10);
        ctx.lineTo(gx, y1);
        ctx.lineTo(gx + 5, y1 - 10);
        ctx.stroke();
    };
};

/* 46 ── Arcade Light: an arcade whose sun-patches slide across the floor */
export const archLight: Factory = (ctx, w, h, o) => {
    const n = o.colors.length,
        A = 5,
        aw = w * 0.12,
        pw = w * 0.06,
        total = A * aw + (A + 1) * pw,
        x0 = (w - total) / 2 + pw;
    const fy = h * 0.72,
        spring = h * 0.3;
    const c0 = o.colors[0],
        c1 = o.colors[1 % n],
        c2 = o.colors[2 % n];
    const arch = (x: number) => {
        ctx.beginPath();
        ctx.moveTo(x, fy);
        ctx.lineTo(x, spring);
        ctx.arc(x + aw / 2, spring, aw / 2, Math.PI, 0);
        ctx.lineTo(x + aw, fy);
    };
    return (t) => {
        wipe(ctx, w, h, o);
        const shift = 0.9 * Math.sin(t * 0.12) * (h - fy) * 1.6;
        ctx.lineWidth = 1.2;
        for (let i = 0; i < A; i++) {
            const x = x0 + i * (aw + pw);
            const sky = ctx.createLinearGradient(0, spring - aw / 2, 0, fy);
            sky.addColorStop(0, rgba(c2, 0.18));
            sky.addColorStop(1, rgba(c2, 0.02));
            arch(x);
            ctx.fillStyle = sky;
            ctx.fill();
            ctx.strokeStyle = rgba(c0, 0.55);
            ctx.stroke();
            ctx.strokeStyle = rgba(c0, 0.22);
            ctx.beginPath();
            ctx.arc(x + aw / 2, spring, aw / 2 + 7, Math.PI, 0);
            ctx.stroke();
            const gp = ctx.createLinearGradient(0, fy, 0, h);
            gp.addColorStop(0, rgba(c1, Math.min(1, 0.38 * o.intensity * 1.4)));
            gp.addColorStop(1, rgba(c1, 0));
            ctx.fillStyle = gp;
            ctx.beginPath();
            ctx.moveTo(x, fy);
            ctx.lineTo(x + aw, fy);
            ctx.lineTo(x + aw + shift, h);
            ctx.lineTo(x + shift, h);
            ctx.closePath();
            ctx.fill();
        }
        ctx.strokeStyle = rgba(c0, 0.3);
        ctx.beginPath();
        ctx.moveTo(0, fy);
        ctx.lineTo(w, fy);
        ctx.stroke();
    };
};

/* 47 ── Iso City: breathing isometric blocks */
export const isoBlocks: Factory = (ctx, w, h, o) => {
    const G = 11,
        tw = Math.min(w * 0.9, h * 1.6) / G,
        th = tw / 2,
        cx = w / 2,
        cy = h * 0.5 - (G * th) / 2 + th * 1.5;
    const poly = (pts: number[][], fill: string) => {
        ctx.beginPath();
        pts.forEach((p, i) =>
            i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]),
        );
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.stroke();
    };
    return (t) => {
        wipe(ctx, w, h, o);
        ctx.lineWidth = 0.8;
        ctx.lineJoin = "round";
        ctx.strokeStyle = rgba(o.colors[0], 0.35);
        for (let s = 0; s < 2 * G - 1; s++)
            for (let i = 0; i < G; i++) {
                const j = s - i;
                if (j < 0 || j >= G) continue;
                const f =
                    0.5 +
                    0.5 *
                        Math.sin(
                            i * 0.7 +
                                j * 0.5 +
                                t * 0.5 +
                                Math.sin(i * 0.3 - j * 0.9 + t * 0.2) * 2,
                        );
                const hg = th * (0.3 + 3.2 * f * f),
                    x = cx + ((i - j) * tw) / 2,
                    y = cy + ((i + j) * th) / 2,
                    base = ramp(o.colors, f);
                poly(
                    [
                        [x - tw / 2, y + th / 2 - hg],
                        [x, y + th - hg],
                        [x, y + th],
                        [x - tw / 2, y + th / 2],
                    ],
                    mix(base, "#000000", 0.45),
                );
                poly(
                    [
                        [x + tw / 2, y + th / 2 - hg],
                        [x, y + th - hg],
                        [x, y + th],
                        [x + tw / 2, y + th / 2],
                    ],
                    mix(base, "#000000", 0.65),
                );
                poly(
                    [
                        [x, y - hg],
                        [x + tw / 2, y + th / 2 - hg],
                        [x, y + th - hg],
                        [x - tw / 2, y + th / 2 - hg],
                    ],
                    mix(base, o.bg, 0.15),
                );
            }
    };
};

/* 48 ── Blueprint: a floor plan drafting itself, wall by wall */
export const blueprintDraft: Factory = (ctx, w, h, o) => {
    type Sg = {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        d: number;
        dur: number;
        k: number;
    };
    type Dr = { x: number; y: number; r: number; d: number };
    const n = o.colors.length,
        CY = 26;
    let segs: Sg[] = [],
        doors: Dr[] = [],
        cyc = -1;
    const pw = Math.min(w * 0.7, h * 1.2),
        ph = Math.min(h * 0.6, pw * 0.68),
        px = (w - pw) / 2,
        py = (h - ph) / 2 - h * 0.02;
    const grid = new Path2D();
    for (let x = 0; x <= w; x += 24) {
        grid.moveTo(x, 0);
        grid.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += 24) {
        grid.moveTo(0, y);
        grid.lineTo(w, y);
    }
    const gen = () => {
        segs = [];
        doors = [];
        const W = (
            x1: number,
            y1: number,
            x2: number,
            y2: number,
            d: number,
            dur: number,
            k = 0,
        ) => segs.push({ x1, y1, x2, y2, d, dur, k });
        W(px, py, px + pw, py, 0, 1.6);
        W(px + pw, py, px + pw, py + ph, 0.4, 1.6);
        W(px + pw, py + ph, px, py + ph, 0.8, 1.6);
        W(px, py + ph, px, py, 1.2, 1.6);
        const split = (
            x: number,
            y: number,
            ww: number,
            hh: number,
            depth: number,
            d: number,
        ) => {
            if (depth >= 4 || ww < pw * 0.16 || hh < ph * 0.2) return;
            const vert = ww > hh * (0.9 + Math.random() * 0.4),
                f = 0.36 + Math.random() * 0.28,
                dw = Math.min(34, Math.min(ww, hh) * 0.18);
            if (vert) {
                const sx = x + ww * f;
                W(sx, y, sx, y + hh, d, 1.2);
                doors.push({
                    x: sx,
                    y: y + hh * (0.2 + Math.random() * 0.5),
                    r: dw,
                    d: d + 1.1,
                });
                split(x, y, ww * f, hh, depth + 1, d + 1.2);
                split(sx, y, ww * (1 - f), hh, depth + 1, d + 1.5);
            } else {
                const sy = y + hh * f;
                W(x, sy, x + ww, sy, d, 1.2);
                doors.push({
                    x: x + ww * (0.2 + Math.random() * 0.5),
                    y: sy,
                    r: dw,
                    d: d + 1.1,
                });
                split(x, y, ww, hh * f, depth + 1, d + 1.2);
                split(x, sy, ww, hh * (1 - f), depth + 1, d + 1.5);
            }
        };
        split(px, py, pw, ph, 0, 2);
        W(px, py + ph + 34, px + pw, py + ph + 34, 10, 1.4, 1);
        W(px, py + ph + 26, px, py + ph + 42, 10.5, 0.5, 1);
        W(px + pw, py + ph + 26, px + pw, py + ph + 42, 10.5, 0.5, 1);
        W(px - 34, py, px - 34, py + ph, 11, 1.4, 1);
        W(px - 42, py, px - 26, py, 11.5, 0.5, 1);
        W(px - 42, py + ph, px - 26, py + ph, 11.5, 0.5, 1);
        W(px + pw / 2, py - 26, px + pw / 2, py + ph + 26, 12, 1.6, 2);
    };
    return (t) => {
        const cy = Math.floor(t / CY);
        if (cy !== cyc) {
            cyc = cy;
            gen();
        }
        const c = t % CY,
            fade = clamp01((CY - c) / 3);
        wipe(ctx, w, h, o);
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(o.colors[1 % n], 0.07);
        ctx.stroke(grid);
        ctx.globalAlpha = fade;
        ctx.lineCap = "round";
        for (const s of segs) {
            const p = smooth(clamp01((c - s.d) / s.dur));
            if (p <= 0) continue;
            if (s.k === 0) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = rgba(o.colors[0], 0.95);
                ctx.setLineDash([]);
            } else if (s.k === 1) {
                ctx.lineWidth = 1;
                ctx.strokeStyle = rgba(o.colors[2 % n], 0.7);
                ctx.setLineDash([]);
            } else {
                ctx.lineWidth = 1;
                ctx.strokeStyle = rgba(o.colors[1 % n], 0.5);
                ctx.setLineDash([14, 5, 2, 5]);
            }
            ctx.beginPath();
            ctx.moveTo(s.x1, s.y1);
            ctx.lineTo(s.x1 + (s.x2 - s.x1) * p, s.y1 + (s.y2 - s.y1) * p);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = rgba(o.colors[1 % n], 0.8);
        for (const d of doors) {
            const p = smooth(clamp01((c - d.d) / 0.8));
            if (p <= 0) continue;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x + d.r, d.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, (p * Math.PI) / 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    };
};

/* 49 ── LiDAR: a scan front revealing a point-cloud cityscape */
export const lidarScan: Factory = (ctx, w, h, o) => {
    const GX = 110,
        GZ = 48,
        hy = h * 0.36;
    const cols = Array.from({ length: 8 }, (_, i) => ramp(o.colors, i / 7));
    const pts: { x: number; y: number; z: number; sz: number; ci: number }[] =
        [];
    for (let j = 0; j < GZ; j++)
        for (let i = 0; i < GX; i++) {
            const xn = (i / (GX - 1)) * 2 - 1,
                z = j / (GZ - 1);
            const blocks =
                Math.floor(
                    (Math.sin(xn * 9 + 1) * Math.sin(z * 13 + xn * 2) + 1) *
                        2.2,
                ) / 2.2;
            const e =
                0.06 * Math.sin(xn * 5 + z * 3) +
                0.2 * blocks * (0.4 + 0.6 * Math.abs(xn));
            const s = 1 / (0.5 + z * 1.1);
            pts.push({
                x: w / 2 + xn * w * 0.28 * s,
                y: hy + (s - 0.55) * h * 0.3 - e * h * 0.35 * s,
                z,
                sz: 1 + 1.2 * s,
                ci: Math.min(7, Math.floor(clamp01(e / 0.25) * 7)),
            });
        }
    return (t) => {
        wipe(ctx, w, h, o);
        glow(ctx, o);
        const zs = 1.1 - ((t * 0.18) % 1.4);
        for (const p of pts) {
            const d = p.z - zs;
            const a = d < 0 ? 0.03 : 0.1 + 0.9 * Math.exp(-d * 4.5);
            ctx.globalAlpha = Math.min(1, a * o.intensity * 1.5);
            ctx.fillStyle = cols[p.ci];
            ctx.fillRect(p.x, p.y, p.sz, p.sz);
        }
        ctx.globalAlpha = 1;
        if (zs >= 0 && zs <= 1) {
            const s = 1 / (0.5 + zs * 1.1),
                y = hy + (s - 0.55) * h * 0.3;
            ctx.strokeStyle = rgba(o.colors[0], 0.5);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(w * 0.1, y);
            ctx.lineTo(w * 0.9, y);
            ctx.stroke();
        }
    };
};

/* 50 ── Golden Ratio: the φ rectangle and its spiral, drawn square by square */
export const goldenSpiral: Factory = (ctx, w, h, o) => {
    const PHI = (1 + Math.sqrt(5)) / 2,
        n = o.colors.length,
        STEPS = 11,
        CYC = 22;
    const H0 = Math.min(h * 0.74, (w * 0.7) / PHI);
    type Sq = {
        x: number;
        y: number;
        s: number;
        a0: number;
        a1: number;
        cx: number;
        cy: number;
        ccw: boolean;
    };
    const sqs: Sq[] = [];
    let rx = (w - H0 * PHI) / 2,
        ry = (h - H0) / 2,
        rw = H0 * PHI,
        rh = H0;
    for (let k = 0; k < STEPS; k++) {
        const d = k % 4;
        let x = rx,
            y = ry,
            s: number;
        if (d === 0) {
            s = rh;
            rx += s;
            rw -= s;
        } else if (d === 1) {
            s = rw;
            ry += s;
            rh -= s;
        } else if (d === 2) {
            s = rh;
            x = rx + rw - s;
            rw -= s;
        } else {
            s = rw;
            y = ry + rh - s;
            rh -= s;
        }
        let sx: number,
            sy: number,
            ex: number,
            ey: number,
            cx: number,
            cy: number;
        if (d === 0) {
            sx = x;
            sy = y + s;
            ex = x + s;
            ey = y;
            cx = x + s;
            cy = y + s;
        } else if (d === 1) {
            sx = x;
            sy = y;
            ex = x + s;
            ey = y + s;
            cx = x;
            cy = y + s;
        } else if (d === 2) {
            sx = x + s;
            sy = y;
            ex = x;
            ey = y + s;
            cx = x;
            cy = y;
        } else {
            sx = x + s;
            sy = y + s;
            ex = x;
            ey = y;
            cx = x + s;
            cy = y;
        }
        const a0 = Math.atan2(sy - cy, sx - cx);
        let df = Math.atan2(ey - cy, ex - cx) - a0;
        while (df > Math.PI) df -= TAU;
        while (df < -Math.PI) df += TAU;
        sqs.push({ x, y, s, a0, a1: a0 + df, cx, cy, ccw: df < 0 });
    }
    return (t) => {
        wipe(ctx, w, h, o);
        const c = t % CYC,
            fade = clamp01((CYC - c) / 3);
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(Math.sin(t * 0.1) * 0.04);
        ctx.scale(1 + 0.01 * Math.sin(t * 0.3), 1 + 0.01 * Math.sin(t * 0.3));
        ctx.translate(-w / 2, -h / 2);
        sqs.forEach((q, k) => {
            const p = smooth(clamp01((c - k * 0.75) / 0.9)) * fade;
            if (p <= 0) return;
            const col = o.colors[k % n];
            ctx.globalAlpha = p;
            ctx.fillStyle = rgba(col, 0.1 * o.intensity * 1.4);
            ctx.fillRect(q.x, q.y, q.s, q.s);
            ctx.strokeStyle = rgba(col, 0.45);
            ctx.lineWidth = 1;
            ctx.strokeRect(q.x, q.y, q.s, q.s);
            ctx.strokeStyle = rgba(col, 0.95);
            ctx.lineWidth = 2;
            ctx.shadowColor = col;
            ctx.shadowBlur = o.dark ? 10 : 0;
            ctx.beginPath();
            ctx.arc(q.cx, q.cy, q.s, q.a0, q.a0 + (q.a1 - q.a0) * p, q.ccw);
            ctx.stroke();
            ctx.shadowBlur = 0;
        });
        ctx.restore();
        ctx.globalAlpha = 1;
    };
};
/* ───────── batch 5: heavy hitters ───────── */

/* 51 ── Turing Bloom: Gray-Scott reaction-diffusion growing coral patterns */
export const turingBloom: Factory = (ctx, w, h, o) => {
    const sc = Math.max(6, Math.ceil(Math.sqrt((w * h) / 36000))),
        L = lowRes(w, h, sc),
        W = L.cw,
        H = L.ch,
        N = W * H;
    let A = new Float32Array(N).fill(1),
        B = new Float32Array(N),
        A2 = new Float32Array(N),
        B2 = new Float32Array(N);
    const F = 0.0545,
        K = 0.062,
        Da = 1,
        Db = 0.5;
    const seed = (cx: number, cy: number, r: number) => {
        for (let y = -r; y <= r; y++)
            for (let x = -r; x <= r; x++) {
                const i = ((cy + y + H) % H) * W + ((cx + x + W) % W);
                B[i] = 1;
                A[i] = 0.3;
            }
    };
    const rnd = () =>
        seed(Math.floor(Math.random() * W), Math.floor(Math.random() * H), 3);
    const step = () => {
        for (let y = 0; y < H; y++) {
            const ym = ((y - 1 + H) % H) * W,
                y0 = y * W,
                yp = ((y + 1) % H) * W;
            for (let x = 0; x < W; x++) {
                const xm = (x - 1 + W) % W,
                    xp = (x + 1) % W,
                    i = y0 + x,
                    a = A[i],
                    b = B[i];
                const la =
                    -a +
                    0.2 * (A[y0 + xm] + A[y0 + xp] + A[ym + x] + A[yp + x]) +
                    0.05 * (A[ym + xm] + A[ym + xp] + A[yp + xm] + A[yp + xp]);
                const lb =
                    -b +
                    0.2 * (B[y0 + xm] + B[y0 + xp] + B[ym + x] + B[yp + x]) +
                    0.05 * (B[ym + xm] + B[ym + xp] + B[yp + xm] + B[yp + xp]);
                const abb = a * b * b;
                A2[i] = a + Da * la - abb + F * (1 - a);
                B2[i] = b + Db * lb + abb - (K + F) * b;
            }
        }
        [A, A2] = [A2, A];
        [B, B2] = [B2, B];
    };
    for (let i = 0; i < 20; i++) rnd();
    for (let s = 0; s < 150; s++) step();
    const bg = rgb(o.bg),
        k = Math.min(1, o.intensity * 1.3);
    const lut = Array.from({ length: 256 }, (_, i) => {
        const a = clamp01(i / 150) * k,
            c = rgb(ramp(o.colors, i / 255));
        return [
            bg[0] + (c[0] - bg[0]) * a,
            bg[1] + (c[1] - bg[1]) * a,
            bg[2] + (c[2] - bg[2]) * a,
        ];
    });
    const d = L.img.data;
    let lastSeed = 0;
    return (t) => {
        if (t - lastSeed > 3) {
            lastSeed = t;
            rnd();
        }
        for (let s = 0; s < 6; s++) step();
        for (let i = 0; i < N; i++) {
            const c = lut[Math.floor(clamp01(B[i] * 2.4) * 255)],
                p = i * 4;
            d[p] = c[0];
            d[p + 1] = c[1];
            d[p + 2] = c[2];
            d[p + 3] = 255;
        }
        L.x.putImageData(L.img, 0, 0);
        normal(ctx);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(L.c, 0, 0, w, h);
    };
};

/* 52 ── Spectrum Halo: beat-driven radial equalizer with burst particles */
export const radialSpectrum: Factory = (ctx, w, h, o) => {
    const cx = w / 2,
        cy = h / 2,
        R = Math.min(w, h) * 0.2,
        B = 120,
        n = o.colors.length;
    const sm = new Float32Array(B);
    const cols = Array.from({ length: B }, (_, i) =>
        ramp(o.colors, Math.abs((i / B) * 2 - 1)),
    );
    type Pa = { a: number; r: number; v: number; life: number; c: number };
    const parts: Pa[] = [];
    let last = 0,
        lastBeat = -1;
    return (t) => {
        const dt = Math.min(0.1, Math.max(0, t - last));
        last = t;
        wipe(ctx, w, h, o);
        glow(ctx, o);
        const kick = Math.exp(-((t * 2) % 1) * 6),
            bi = Math.floor(t * 2);
        if (bi !== lastBeat) {
            lastBeat = bi;
            for (let k = 0; k < 10; k++)
                parts.push({
                    a: Math.random() * TAU,
                    r: R * 1.15,
                    v: 120 + Math.random() * 180,
                    life: 1,
                    c: Math.floor(Math.random() * n),
                });
        }
        const dg = ctx.createRadialGradient(
            cx,
            cy,
            0,
            cx,
            cy,
            R * (0.9 + 0.15 * kick),
        );
        dg.addColorStop(
            0,
            rgba(o.colors[0], Math.min(1, 0.3 * o.intensity * 1.4)),
        );
        dg.addColorStop(1, rgba(o.colors[0], 0));
        ctx.fillStyle = dg;
        ctx.beginPath();
        ctx.arc(cx, cy, R * (0.9 + 0.15 * kick), 0, TAU);
        ctx.fill();
        ctx.lineCap = "round";
        const lw = ((TAU * R) / B) * 0.55;
        for (let i = 0; i < B; i++) {
            const fi = Math.abs((i / B) * 2 - 1),
                ang = (i / B) * TAU - Math.PI / 2;
            const tg =
                0.12 +
                kick * 0.55 * Math.pow(1 - fi, 2) +
                0.25 * Math.abs(Math.sin(t * 3 + fi * 9)) * (0.4 + fi * 0.6) +
                0.18 * Math.abs(Math.sin(t * 5.3 + i * 0.37)) * fi;
            sm[i] += (tg - sm[i]) * Math.min(1, dt * 14);
            const len = sm[i] * R * 1.6,
                c = Math.cos(ang),
                s = Math.sin(ang);
            ctx.lineWidth = lw;
            ctx.strokeStyle = rgba(
                cols[i],
                Math.min(1, 0.45 + o.intensity * 0.6),
            );
            ctx.beginPath();
            ctx.moveTo(cx + c * R * 1.04, cy + s * R * 1.04);
            ctx.lineTo(cx + c * (R * 1.04 + len), cy + s * (R * 1.04 + len));
            ctx.stroke();
            ctx.strokeStyle = rgba(cols[i], 0.25);
            ctx.beginPath();
            ctx.moveTo(cx + c * R * 0.96, cy + s * R * 0.96);
            ctx.lineTo(
                cx + c * (R * 0.96 - len * 0.3),
                cy + s * (R * 0.96 - len * 0.3),
            );
            ctx.stroke();
        }
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = rgba(o.colors[0], 0.8);
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, TAU);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(o.colors[1 % n], 0.5);
        ctx.beginPath();
        for (let i = 0; i <= 180; i++) {
            const a = (i / 180) * TAU,
                r =
                    R * 0.78 +
                    Math.sin(a * 6 + t * 3) * R * 0.04 * (0.4 + kick) +
                    Math.sin(a * 11 - t * 2) * R * 0.02;
            i
                ? ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
                : ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.stroke();
        for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i];
            p.r += p.v * dt;
            p.life -= dt * 0.7;
            if (p.life <= 0) {
                parts.splice(i, 1);
                continue;
            }
            ctx.fillStyle = rgba(o.colors[p.c], p.life);
            ctx.beginPath();
            ctx.arc(
                cx + Math.cos(p.a) * p.r,
                cy + Math.sin(p.a) * p.r,
                1 + p.life * 2.5,
                0,
                TAU,
            );
            ctx.fill();
        }
    };
};

/* 53 ── Liquid Light: glossy metaballs with soft halos and bright rims */
export const liquidMetaballs: Factory = (ctx, w, h, o) => {
    const L = lowRes(w, h, 5),
        N = 8,
        bg = rgb(o.bg),
        k = Math.min(1, o.intensity * 1.3);
    const lut = Array.from({ length: 256 }, (_, i) =>
        rgb(ramp(o.colors, i / 255)),
    );
    const m = Math.min(L.cw, L.ch);
    const bs = Array.from({ length: N }, () => ({
        fx: 0.08 + Math.random() * 0.18,
        fy: 0.08 + Math.random() * 0.18,
        px: Math.random() * TAU,
        py: Math.random() * TAU,
        r2: Math.pow(m * (0.07 + Math.random() * 0.07), 2),
    }));
    const X = new Float32Array(N),
        Y = new Float32Array(N),
        d = L.img.data;
    return (t) => {
        bs.forEach((b, i) => {
            X[i] =
                L.cw *
                (0.5 +
                    0.3 * Math.sin(t * b.fx + b.px) +
                    0.1 * Math.sin(t * b.fx * 2.3 + b.py));
            Y[i] =
                L.ch *
                (0.5 +
                    0.3 * Math.sin(t * b.fy + b.py) +
                    0.1 * Math.cos(t * b.fy * 1.9 + b.px));
        });
        for (let y = 0; y < L.ch; y++)
            for (let x = 0; x < L.cw; x++) {
                let s = 0;
                for (let q = 0; q < N; q++) {
                    const dx = x - X[q],
                        dy = y - Y[q];
                    s += bs[q].r2 / (dx * dx + dy * dy + 1);
                }
                let r: number, g: number, b: number;
                if (s < 1) {
                    const a = clamp01((s - 0.3) / 0.7),
                        c = lut[Math.floor(a * 128)],
                        al = a * a * 0.4 * k;
                    r = bg[0] + (c[0] - bg[0]) * al;
                    g = bg[1] + (c[1] - bg[1]) * al;
                    b = bg[2] + (c[2] - bg[2]) * al;
                } else {
                    const c =
                            lut[128 + Math.floor(clamp01((s - 1) / 2.5) * 127)],
                        rim = clamp01((1.3 - s) / 0.3) * 0.55;
                    r = bg[0] + (c[0] - bg[0]) * k;
                    g = bg[1] + (c[1] - bg[1]) * k;
                    b = bg[2] + (c[2] - bg[2]) * k;
                    r += (255 - r) * rim;
                    g += (255 - g) * rim;
                    b += (255 - b) * rim;
                }
                const p = (y * L.cw + x) * 4;
                d[p] = r;
                d[p + 1] = g;
                d[p + 2] = b;
                d[p + 3] = 255;
            }
        L.x.putImageData(L.img, 0, 0);
        normal(ctx);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(L.c, 0, 0, w, h);
    };
};

/* 54 ── Torus Knot: a tumbling 3D wireframe tube with depth-shaded strokes */
export const torusKnot: Factory = (ctx, w, h, o) => {
    const S = 260,
        Q = 12,
        P = 2,
        QQ = 3,
        scale = Math.min(w, h) * 0.17,
        cx = w / 2,
        cy = h / 2;
    const curve = (u: number): number[] => {
        const r = Math.cos(QQ * u) + 2;
        return [r * Math.cos(P * u), r * Math.sin(P * u), -Math.sin(QQ * u)];
    };
    const V = new Float32Array(S * Q * 3);
    for (let i = 0; i < S; i++) {
        const u = (i / S) * TAU,
            c = curve(u),
            c2 = curve(u + 0.01);
        let T = [c2[0] - c[0], c2[1] - c[1], c2[2] - c[2]];
        const tl = Math.hypot(T[0], T[1], T[2]);
        T = T.map((v) => v / tl);
        let Nn = [T[1], -T[0], 0]; // T × z
        const nl = Math.hypot(Nn[0], Nn[1], Nn[2]) || 1;
        Nn = Nn.map((v) => v / nl);
        const Bn = [
            T[1] * Nn[2] - T[2] * Nn[1],
            T[2] * Nn[0] - T[0] * Nn[2],
            T[0] * Nn[1] - T[1] * Nn[0],
        ];
        for (let q = 0; q < Q; q++) {
            const a = (q / Q) * TAU,
                ca = Math.cos(a) * 0.42,
                sa = Math.sin(a) * 0.42,
                k = (i * Q + q) * 3;
            V[k] = c[0] + Nn[0] * ca + Bn[0] * sa;
            V[k + 1] = c[1] + Nn[1] * ca + Bn[1] * sa;
            V[k + 2] = c[2] + Nn[2] * ca + Bn[2] * sa;
        }
    }
    const PX = new Float32Array(S * Q),
        PY = new Float32Array(S * Q),
        PZ = new Float32Array(S * Q);
    const bc = [0, 1, 2].map((b) => ramp(o.colors, b / 2));
    return (t) => {
        wipe(ctx, w, h, o);
        glow(ctx, o);
        const ay = t * 0.3,
            ax = 0.6 + 0.2 * Math.sin(t * 0.2),
            az = t * 0.1;
        const cyA = Math.cos(ay),
            syA = Math.sin(ay),
            cxA = Math.cos(ax),
            sxA = Math.sin(ax),
            czA = Math.cos(az),
            szA = Math.sin(az);
        for (let i = 0; i < S * Q; i++) {
            let x = V[i * 3],
                y = V[i * 3 + 1],
                z = V[i * 3 + 2];
            let x1 = x * cyA + z * syA,
                z1 = -x * syA + z * cyA;
            const y1 = y * cxA - z1 * sxA,
                z2 = y * sxA + z1 * cxA;
            const x2 = x1 * czA - y1 * szA,
                y2 = x1 * szA + y1 * czA;
            const pr = 1 / (1 - z2 * 0.07);
            PX[i] = cx + x2 * scale * pr;
            PY[i] = cy + y2 * scale * pr;
            PZ[i] = z2;
        }
        const paths = [new Path2D(), new Path2D(), new Path2D()];
        const seg = (a: number, b: number) => {
            const bk = Math.min(
                2,
                Math.max(0, Math.floor(((PZ[a] + PZ[b]) / 2 + 3) / 2)),
            );
            paths[bk].moveTo(PX[a], PY[a]);
            paths[bk].lineTo(PX[b], PY[b]);
        };
        for (let i = 0; i < S; i++) {
            const ni = (i + 1) % S;
            for (let q = 0; q < Q; q++) {
                seg(i * Q + q, ni * Q + q);
                if (i % 5 === 0) seg(i * Q + q, i * Q + ((q + 1) % Q));
            }
        }
        const widths = [0.5, 0.8, 1.2],
            alphas = [0.18, 0.4, 0.85];
        for (let b = 0; b < 3; b++) {
            ctx.lineWidth = widths[b];
            ctx.strokeStyle = rgba(
                bc[b],
                Math.min(1, alphas[b] * (0.5 + o.intensity)),
            );
            ctx.stroke(paths[b]);
        }
    };
};

/* 55 ── Shape Morph: 1,400 particles flowing between outlines in a wave */
export const shapeMorph: Factory = (ctx, w, h, o) => {
    const N = 1400,
        cx = w / 2,
        cy = h / 2,
        R = Math.min(w, h) * 0.26,
        HOLD = 4;
    const starV = Array.from({ length: 11 }, (_, k): [number, number] => {
        const a = -Math.PI / 2 + (k * Math.PI) / 5,
            r = k % 2 ? 0.45 : 1;
        return [Math.cos(a) * r, Math.sin(a) * r];
    });
    const sq: [number, number][] = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
        [-1, -1],
    ];
    const shapes: ((u: number) => [number, number])[] = [
        (u) => [Math.cos(u * TAU), Math.sin(u * TAU)],
        (u) => {
            const p = u * 4,
                s = Math.floor(p),
                f = p - s;
            return [
                sq[s][0] + (sq[s + 1][0] - sq[s][0]) * f,
                sq[s][1] + (sq[s + 1][1] - sq[s][1]) * f,
            ];
        },
        (u) => {
            const a = u * TAU;
            return [
                (16 * Math.pow(Math.sin(a), 3)) / 17,
                -(
                    13 * Math.cos(a) -
                    5 * Math.cos(2 * a) -
                    2 * Math.cos(3 * a) -
                    Math.cos(4 * a)
                ) / 17,
            ];
        },
        (u) => {
            const p = u * 10,
                s = Math.floor(p),
                f = p - s;
            return [
                starV[s][0] + (starV[s + 1][0] - starV[s][0]) * f,
                starV[s][1] + (starV[s + 1][1] - starV[s][1]) * f,
            ];
        },
        (u) => {
            const a = u * TAU,
                d = 1 + Math.sin(a) ** 2;
            return [
                (Math.cos(a) / d) * 1.4,
                ((Math.sin(a) * Math.cos(a)) / d) * 1.4,
            ];
        },
        (u) => {
            const a = u * TAU * 3;
            return [u * Math.cos(a), u * Math.sin(a)];
        },
        (u) => {
            const a = u * TAU,
                r = 0.55 + 0.45 * Math.cos(5 * a);
            return [r * Math.cos(a), r * Math.sin(a)];
        },
    ];
    const S = shapes.length;
    const TX = shapes.map((f) =>
        Float32Array.from({ length: N }, (_, i) => f(i / N)[0]),
    );
    const TY = shapes.map((f) =>
        Float32Array.from({ length: N }, (_, i) => f(i / N)[1]),
    );
    const cols = Array.from({ length: N }, (_, i) =>
        ramp(o.colors, i / (N - 1)),
    );
    const ps = Array.from({ length: N }, (_, i) => ({
        x: cx + (Math.random() - 0.5) * R * 2,
        y: cy + (Math.random() - 0.5) * R * 2,
        d: (i / N) * 1.2,
    }));
    let last = 0;
    return (t) => {
        const dt = Math.min(0.1, Math.max(0, t - last));
        last = t;
        wipe(ctx, w, h, o, 0.22);
        glow(ctx, o);
        const rot = t * 0.08,
            cr = Math.cos(rot),
            sr = Math.sin(rot),
            kk = 1 - Math.exp(-dt * 4);
        ctx.globalAlpha = Math.min(1, 0.4 + o.intensity * 0.7);
        for (let i = 0; i < N; i++) {
            const p = ps[i],
                idx = ((Math.floor((t - p.d) / HOLD) % S) + S) % S;
            const sx = TX[idx][i],
                sy = TY[idx][i];
            const tx = cx + (sx * cr - sy * sr) * R + Math.sin(t * 1.7 + i) * 2,
                ty = cy + (sx * sr + sy * cr) * R + Math.cos(t * 1.3 + i) * 2;
            const dx = tx - p.x,
                dy = ty - p.y;
            p.x += dx * kk - dy * kk * 0.35;
            p.y += dy * kk + dx * kk * 0.35;
            ctx.fillStyle = cols[i];
            ctx.fillRect(p.x, p.y, 1.8, 1.8);
        }
        ctx.globalAlpha = 1;
    };
};

