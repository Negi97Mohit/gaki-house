import type { Factory } from "./types";
import { TAU, rgba, mix, wipe, glow, normal, rgb, lowRes, ramp, clamp01, smooth, rr, heart, star } from "./helpers";

/* 1 ── Event Horizon: lensed accretion disk around a black hole */
export const eventHorizon: Factory = (ctx, w, h, o) => {
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
export const silkFilaments: Factory = (ctx, w, h, o) => (t) => {
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
                    ((k - 0.5) *
                        h *
                        0.6 *
                        Math.sin(nx * 2.4 + t * 0.35 + k * 1.5) +
                        h * 0.12 * Math.sin(nx * 5 - t * 0.5 + k * 3));
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
};

/* 3 ── Orbital Atlas: wireframe globe, dotted orbits, satellites */
export const orbitalGlobe: Factory = (ctx, w, h, o) => {
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
export const hypercube: Factory = (ctx, w, h, o) => {
    const V: number[][] = [];
    for (let i = 0; i < 16; i++)
        V.push([
            i & 1 ? 1 : -1,
            i & 2 ? 1 : -1,
            i & 4 ? 1 : -1,
            i & 8 ? 1 : -1,
        ]);
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
                        0.35 +
                            ((pts[a][2] + pts[b][2]) / 2 + 1) *
                                0.3 *
                                o.intensity *
                                1.5,
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
export const halftoneTide: Factory = (ctx, w, h, o) => {
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
                        Math.sin(
                            Math.hypot(x - s2x, y - s2y) * 0.011 - t * 0.9,
                        )) *
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
export const harmonograph: Factory = (ctx, w, h, o) => {
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
export const flowField: Factory = (ctx, w, h, o) => {
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
export const plexusDrift: Factory = (ctx, w, h, o) => {
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
export const spectralCurtains: Factory = (ctx, w, h, o) => (t) => {
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
                len =
                    h * 0.32 * (0.5 + 0.5 * Math.sin(x * 0.031 - t * 0.5 + k));
            ctx.beginPath();
            ctx.moveTo(x, b - len);
            ctx.lineTo(x, b);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
};

/* 10 ── Prism Blades: tilted glass beams with chromatic aberration */
export const prismBeams: Factory = (ctx, w, h, o) => {
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
                (((i / N + t * 0.012 + Math.sin(t * 0.07 + i) * 0.02) % 1) +
                    1) %
                1;
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
