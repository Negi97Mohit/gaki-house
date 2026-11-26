import type { Factory } from "./types";
import { TAU, rgba, mix, wipe, glow, normal, rgb, lowRes, ramp, clamp01, smooth, rr, heart, star } from "./helpers";

/* 21 ── Pendulum Wave: dots drifting in and out of phase */
export const pendulumWave: Factory = (ctx, w, h, o) => {
    const N = 34,
        T = 48,
        A = h * 0.28,
        cy = h / 2;
    const cols = Array.from({ length: N }, (_, i) =>
        ramp(o.colors, i / (N - 1)),
    );
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
export const moireRings: Factory = (ctx, w, h, o) => {
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
        rings(
            w / 2 + dx,
            h / 2 + dy,
            gap * 1.03,
            o.colors[1 % o.colors.length],
        );
    };
};

/* 23 ── Bokeh Drift: out-of-focus lens discs with bright rims */
export const bokehDrift: Factory = (ctx, w, h, o) => {
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
                    (0.5 + 0.5 * Math.sin(t * d.sp + d.ph)) *
                        o.intensity *
                        0.5 +
                    0.04,
                col = o.colors[d.c];
            const g = ctx.createRadialGradient(
                d.x,
                d.y,
                d.r * 0.4,
                d.x,
                d.y,
                d.r,
            );
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
export const warpGrid: Factory = (ctx, w, h, o) => {
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
export const ridgeline: Factory = (ctx, w, h, o) => {
    const R = 34,
        x0 = w * 0.14,
        x1 = w * 0.86;
    const cols = Array.from({ length: R }, (_, r) =>
        ramp(o.colors, r / (R - 1)),
    );
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
            ctx.strokeStyle = rgba(
                cols[r],
                Math.min(1, 0.45 + o.intensity * 0.6),
            );
            ctx.stroke(P);
        }
    };
};

/* 26 ── Sunflower: phyllotaxis spiral that slowly re-tunes its angle */
export const phyllotaxis: Factory = (ctx, w, h, o) => {
    const N = 720,
        cx = w / 2,
        cy = h / 2,
        c = (Math.min(w, h) * 0.46) / Math.sqrt(N),
        GA = 2.399963229728653;
    const cols = Array.from({ length: N }, (_, i) =>
        ramp(o.colors, i / (N - 1)),
    );
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
            ctx.globalAlpha = Math.min(
                1,
                0.35 + 0.65 * o.intensity * (0.4 + f),
            );
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
export const colorField: Factory = (ctx, w, h, o) => {
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
export const rippleRain: Factory = (ctx, w, h, o) => {
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
export const glyphField: Factory = (ctx, w, h, o) => {
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
                            x * 0.008 +
                                t * 0.6 +
                                Math.sin(y * 0.006 + t * 0.2) * 1.5,
                        ) +
                    0.22 * Math.sin(y * 0.011 - t * 0.5) +
                    0.15 * Math.sin((x + y) * 0.005 + t * 0.3);
                v = Math.min(1, Math.max(0, v));
                const idx = Math.min(
                    CH.length - 1,
                    Math.floor(v * v * CH.length),
                );
                if (idx <= 0) continue;
                ctx.fillStyle = pal[Math.min(7, Math.floor(v * 8))];
                ctx.fillText(CH[idx], x, y);
            }
    };
};

/* 30 ── String Art: the times-table circle, slowly morphing */
export const stringArt: Factory = (ctx, w, h, o) => {
    const N = 220,
        B = 8,
        R = Math.min(w, h) * 0.4,
        cx = w / 2,
        cy = h / 2;
    const cols = Array.from({ length: B }, (_, b) =>
        ramp(o.colors, b / (B - 1)),
    );
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
            ctx.fillRect(
                cx + Math.cos(a) * R - 1,
                cy + Math.sin(a) * R - 1,
                2,
                2,
            );
        }
    };
};
/* ───────── batch 4: platforms, sport, vogue, architecture ───────── */
