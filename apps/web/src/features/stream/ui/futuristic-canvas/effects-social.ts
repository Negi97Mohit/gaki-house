import type { Factory } from "./types";
import { TAU, rgba, mix, wipe, glow, normal, rgb, lowRes, ramp, clamp01, smooth, rr, heart, star } from "./helpers";

/* 31 ── Chat Cascade: anonymous chat bubbles drifting up the screen */
export const chatCascade: Factory = (ctx, w, h, o) => {
    type M = {
        x: number;
        y: number;
        w: number;
        lines: number[];
        c: number;
        sp: number;
        ph: number;
    };
    const n = o.colors.length;
    const mk = (y: number): M => ({
        x: w * (0.08 + Math.random() * 0.7),
        y,
        w: Math.min(w * 0.4, 140 + Math.random() * 220),
        lines: Array.from(
            { length: 1 + Math.floor(Math.random() * 2) },
            () => 0.4 + Math.random() * 0.6,
        ),
        c: Math.floor(Math.random() * n),
        sp: 18 + Math.random() * 26,
        ph: Math.random() * TAU,
    });
    const ms = Array.from({ length: 16 }, () => mk(Math.random() * h));
    let last = 0;
    return (t) => {
        const dt = Math.min(0.1, Math.max(0, t - last));
        last = t;
        wipe(ctx, w, h, o);
        for (const m of ms) {
            m.y -= m.sp * dt;
            if (m.y < -80) Object.assign(m, mk(h + 40 + Math.random() * 80));
            const col = o.colors[m.c],
                bh = 22 + m.lines.length * 14,
                x = m.x + Math.sin(t * 0.4 + m.ph) * 8;
            ctx.globalAlpha =
                clamp01(Math.min(m.y, h - m.y) / (h * 0.2)) *
                Math.min(1, 0.3 + o.intensity * 0.7);
            rr(ctx, x, m.y, m.w, bh, 14);
            ctx.fillStyle = rgba(col, 0.14);
            ctx.fill();
            ctx.strokeStyle = rgba(col, 0.55);
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = col;
            ctx.beginPath();
            ctx.arc(x + 16, m.y + bh / 2, 6, 0, TAU);
            ctx.fill();
            ctx.fillStyle = rgba(col, 0.55);
            m.lines.forEach((l, i) => {
                rr(ctx, x + 32, m.y + 11 + i * 14, (m.w - 48) * l, 5, 2.5);
                ctx.fill();
            });
        }
        ctx.globalAlpha = 1;
    };
};

/* 32 ── Viewer Pulse: a live viewer-count chart with raid spikes */
export const viewerPulse: Factory = (ctx, w, h, o) => {
    const N = 180,
        STEP = 0.07,
        vs: number[] = [];
    let v = 0.3,
        spike = 0,
        acc = 0,
        last = 0;
    const push = () => {
        v += (Math.random() - 0.5) * 0.05 + (0.35 - v) * 0.02;
        if (Math.random() < 0.015) spike = 0.3 + Math.random() * 0.25;
        spike *= 0.93;
        vs.push(clamp01(v + spike));
        if (vs.length > N + 1) vs.shift();
    };
    for (let i = 0; i < N + 1; i++) push();
    const x0 = w * 0.06,
        x1 = w * 0.94,
        yb = h * 0.78,
        H = h * 0.45;
    const c0 = o.colors[0],
        c1 = o.colors[1 % o.colors.length];
    return (t) => {
        const dt = Math.min(0.1, Math.max(0, t - last));
        last = t;
        acc += dt;
        while (acc > STEP) {
            acc -= STEP;
            push();
        }
        wipe(ctx, w, h, o);
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(c1, 0.14);
        ctx.setLineDash([3, 7]);
        for (let g = 0; g <= 4; g++) {
            const y = yb - (H * g) / 4;
            ctx.beginPath();
            ctx.moveTo(x0, y);
            ctx.lineTo(x1, y);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        const px = (i: number) => x0 + (x1 - x0) * ((i - acc / STEP) / N);
        const P = new Path2D();
        vs.forEach((s, i) => {
            const x = Math.max(x0, px(i)),
                y = yb - s * H;
            i ? P.lineTo(x, y) : P.moveTo(x, y);
        });
        const lx = px(vs.length - 1),
            ly = yb - vs[vs.length - 1] * H;
        const F = new Path2D(P);
        F.lineTo(lx, yb);
        F.lineTo(x0, yb);
        F.closePath();
        const g = ctx.createLinearGradient(0, yb - H, 0, yb);
        g.addColorStop(0, rgba(c0, 0.4 * o.intensity * 1.4));
        g.addColorStop(1, rgba(c0, 0));
        ctx.fillStyle = g;
        ctx.fill(F);
        ctx.lineWidth = 2;
        ctx.strokeStyle = rgba(c0, 0.95);
        ctx.shadowColor = c0;
        ctx.shadowBlur = o.dark ? 12 : 0;
        ctx.stroke(P);
        ctx.shadowBlur = 0;
        const f = (t * 1.2) % 1;
        ctx.fillStyle = c0;
        ctx.beginPath();
        ctx.arc(lx, ly, 4, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = rgba(c0, 1 - f);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(lx, ly, 4 + f * 14, 0, TAU);
        ctx.stroke();
        const fl = (t * 1.5) % 1;
        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.arc(x0, h * 0.16, 5, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = rgba(c1, 1 - fl);
        ctx.beginPath();
        ctx.arc(x0, h * 0.16, 5 + fl * 10, 0, TAU);
        ctx.stroke();
        rr(ctx, x0 + 18, h * 0.16 - 3, 54, 6, 3);
        ctx.fillStyle = rgba(c1, 0.5);
        ctx.fill();
    };
};

/* 33 ── Hearts Live: reactions floating up from the corner */
export const heartsFloat: Factory = (ctx, w, h, o) => {
    type P = {
        x: number;
        x0: number;
        y: number;
        s: number;
        sp: number;
        ph: number;
        wa: number;
        c: number;
        k: number;
        age: number;
    };
    const n = o.colors.length,
        ps: P[] = [];
    let last = 0,
        acc = 0;
    const spawn = () => {
        const x0 = w * (0.72 + 0.2 * Math.random());
        ps.push({
            x: x0,
            x0,
            y: h + 30,
            s: 12 + Math.random() * 22,
            sp: 70 + Math.random() * 80,
            ph: Math.random() * TAU,
            wa: 20 + Math.random() * 40,
            c: Math.floor(Math.random() * n),
            k: Math.random() < 0.7 ? 0 : Math.random() < 0.5 ? 1 : 2,
            age: 0,
        });
    };
    return (t) => {
        const dt = Math.min(0.1, Math.max(0, t - last));
        last = t;
        acc += dt * 7;
        while (acc > 1 && ps.length < 70) {
            acc -= 1;
            spawn();
        }
        acc = Math.min(acc, 2);
        wipe(ctx, w, h, o);
        for (let i = ps.length - 1; i >= 0; i--) {
            const p = ps[i];
            p.age += dt;
            p.y -= p.sp * dt;
            p.x = p.x0 + Math.sin(p.age * 1.6 + p.ph) * p.wa;
            if (p.y < -40) {
                ps.splice(i, 1);
                continue;
            }
            const s = p.s * smooth(clamp01(p.age / 0.4));
            ctx.globalAlpha = Math.min(
                1,
                clamp01(p.y / (h * 0.25)) * (0.35 + o.intensity * 0.7),
            );
            ctx.fillStyle = o.colors[p.c];
            ctx.shadowColor = o.colors[p.c];
            ctx.shadowBlur = o.dark ? 16 : 0;
            if (p.k === 0) heart(ctx, p.x, p.y, s);
            else if (p.k === 1) star(ctx, p.x, p.y, s * 0.8);
            else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, s * 0.35, 0, TAU);
            }
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    };
};

/* 34 ── Hype Train: light capsules racing along slanted rails */
export const hypeTrain: Factory = (ctx, w, h, o) => {
    const span = Math.hypot(w, h),
        L = 9,
        n = o.colors.length;
    type C = {
        x: number;
        len: number;
        sp: number;
        c: number;
        y: number;
        hh: number;
    };
    const cs: C[] = [];
    for (let i = 0; i < L; i++)
        for (let k = 0; k < 2; k++)
            cs.push({
                x: (Math.random() - 0.5) * span,
                len: 80 + Math.random() * 240,
                sp: 120 + Math.random() * 320,
                c: (i + k) % n,
                y: (i / (L - 1) - 0.5) * h * 1.15,
                hh: 3 + Math.random() * 5,
            });
    let last = 0;
    return (t) => {
        const dt = Math.min(0.1, Math.max(0, t - last));
        last = t;
        wipe(ctx, w, h, o);
        glow(ctx, o);
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(-0.16);
        for (const c of cs) {
            c.x += c.sp * dt;
            if (c.x - c.len > span / 2) {
                c.x = -span / 2 - Math.random() * span * 0.3;
                c.len = 80 + Math.random() * 240;
            }
            const col = o.colors[c.c];
            const g = ctx.createLinearGradient(c.x - c.len, 0, c.x, 0);
            g.addColorStop(0, rgba(col, 0));
            g.addColorStop(1, rgba(col, Math.min(1, 0.8 * o.intensity * 1.3)));
            ctx.fillStyle = g;
            rr(ctx, c.x - c.len, c.y - c.hh / 2, c.len, c.hh, c.hh / 2);
            ctx.fill();
            ctx.fillStyle = col;
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.hh * 0.7, 0, TAU);
            ctx.fill();
        }
        ctx.restore();
        normal(ctx);
        const pr = (t % 24) / 24,
            bw = Math.min(w * 0.34, 420),
            bx = (w - bw) / 2,
            by = h * 0.92;
        rr(ctx, bx, by, bw, 5, 2.5);
        ctx.fillStyle = rgba(o.colors[0], 0.15);
        ctx.fill();
        rr(ctx, bx, by, Math.max(5, bw * pr), 5, 2.5);
        ctx.fillStyle = o.colors[0];
        ctx.fill();
    };
};

/* 35 ── Multi-Stream: stream tiles that reflow between layouts */
const LAYOUTS: number[][][] = [
    [
        [0, 0, 0.5, 0.5],
        [0.5, 0, 0.5, 0.5],
        [0, 0.5, 0.5, 0.5],
        [0.5, 0.5, 0.5, 0.5],
    ],
    [
        [0, 0, 0.66, 1],
        [0.66, 0, 0.34, 0.33],
        [0.66, 0.33, 0.34, 0.34],
        [0.66, 0.67, 0.34, 0.33],
    ],
    [
        [0, 0, 1, 0.62],
        [0, 0.62, 0.34, 0.38],
        [0.34, 0.62, 0.33, 0.38],
        [0.67, 0.62, 0.33, 0.38],
    ],
    [
        [0, 0, 0.25, 1],
        [0.25, 0, 0.25, 1],
        [0.5, 0, 0.25, 1],
        [0.75, 0, 0.25, 1],
    ],
];

/* 36 ── Pixel Invaders: a marching 8-bit formation */
const SPR: number[][][] = [
    [
        [0x18, 0x3c, 0x7e, 0xdb, 0xff, 0x24, 0x5a, 0xa5],
        [0x18, 0x3c, 0x7e, 0xdb, 0xff, 0x5a, 0x81, 0x42],
    ],
    [
        [0x24, 0x24, 0x7e, 0xdb, 0xff, 0xff, 0xa5, 0x24],
        [0x24, 0x24, 0xff, 0xdb, 0xff, 0x7e, 0x24, 0x42],
    ],
    [
        [0x3c, 0x7e, 0xff, 0x99, 0xff, 0x66, 0xc3, 0x81],
        [0x3c, 0x7e, 0xff, 0x99, 0xff, 0x24, 0x42, 0x24],
    ],
];
export const pixelInvaders: Factory = (ctx, w, h, o) => {
    const p = Math.max(3, Math.round(Math.min(w, h) / 150)),
        cols = 11,
        rows = 5,
        cw = p * 14,
        fw = cols * cw,
        n = o.colors.length;
    const types = [0, 1, 1, 2, 2];
    return (t) => {
        wipe(ctx, w, h, o);
        const step = Math.floor(t * 1.5),
            fr = step & 1,
            tri = Math.abs((step % 24) / 12 - 1);
        const amp = Math.max(0, ((w - fw) / 2) * 0.85),
            ox = (tri * 2 - 1) * amp,
            oy = (Math.floor(step / 24) % 5) * p * 5;
        const bx = (w - fw) / 2 + cw * 0.3,
            by = h * 0.12;
        ctx.globalAlpha = Math.min(1, 0.35 + o.intensity * 0.6);
        for (let r = 0; r < rows; r++) {
            const bits = SPR[types[r]][fr];
            ctx.fillStyle = o.colors[r % n];
            for (let c = 0; c < cols; c++) {
                const x = bx + ox + c * cw,
                    y = by + oy + r * p * 12;
                for (let py = 0; py < 8; py++)
                    for (let pxl = 0; pxl < 8; pxl++)
                        if (bits[py] & (0x80 >> pxl))
                            ctx.fillRect(x + pxl * p, y + py * p, p, p);
            }
        }
        ctx.fillStyle = o.colors[0];
        const cx = w / 2 + Math.sin(t * 0.8) * w * 0.3,
            cy = h * 0.9;
        ctx.fillRect(cx - 6 * p, cy, 12 * p, 2 * p);
        ctx.fillRect(cx - 4 * p, cy - 2 * p, 8 * p, 2 * p);
        ctx.fillRect(cx - p, cy - 4 * p, 2 * p, 2 * p);
        const bt = (t % 1.1) / 1.1,
            fx = w / 2 + Math.sin(Math.floor(t / 1.1) * 1.1 * 0.8) * w * 0.3;
        ctx.fillStyle = o.colors[1 % n];
        ctx.fillRect(fx - p / 2, cy - 4 * p - bt * h * 0.75, p, p * 3);
        ctx.globalAlpha = 1;
    };
};

/* 37 ── Radar Sweep: tactical HUD radar with decaying blips */
export const radarSweep: Factory = (ctx, w, h, o) => {
    const cx = w / 2,
        cy = h / 2,
        R = Math.min(w, h) * 0.42,
        n = o.colors.length;
    const blips = Array.from({ length: 10 }, () => ({
        a: Math.random() * TAU,
        r: 0.2 + Math.random() * 0.75,
        va: (Math.random() - 0.5) * 0.05,
        c: Math.floor(Math.random() * n),
    }));
    return (t) => {
        wipe(ctx, w, h, o);
        glow(ctx, o);
        ctx.strokeStyle = rgba(o.colors[0], 0.22);
        ctx.lineWidth = 1;
        for (let i = 1; i <= 4; i++) {
            ctx.beginPath();
            ctx.arc(cx, cy, (R * i) / 4, 0, TAU);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(cx - R, cy);
        ctx.lineTo(cx + R, cy);
        ctx.moveTo(cx, cy - R);
        ctx.lineTo(cx, cy + R);
        ctx.stroke();
        for (let d = 0; d < 360; d += 10) {
            const a = (d * Math.PI) / 180,
                l = d % 30 === 0 ? 10 : 5;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
            ctx.lineTo(cx + Math.cos(a) * (R + l), cy + Math.sin(a) * (R + l));
            ctx.stroke();
        }
        const sw = t * 0.9;
        for (let i = 0; i < 48; i++) {
            const a0 = sw - i * 0.02;
            ctx.fillStyle = rgba(
                o.colors[0],
                (1 - i / 48) * 0.22 * o.intensity * 1.4,
            );
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, R, a0 - 0.02, a0);
            ctx.closePath();
            ctx.fill();
        }
        ctx.strokeStyle = rgba(o.colors[0], 0.9);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(sw) * R, cy + Math.sin(sw) * R);
        ctx.stroke();
        for (const b of blips) {
            const a = b.a + b.va * t,
                behind = (((sw - a) % TAU) + TAU) % TAU,
                br = Math.max(0.12, 1 - behind / (TAU * 0.9));
            const x = cx + Math.cos(a) * b.r * R,
                y = cy + Math.sin(a) * b.r * R,
                col = o.colors[b.c];
            ctx.fillStyle = rgba(col, br);
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, TAU);
            ctx.fill();
            if (behind < 0.6) {
                ctx.strokeStyle = rgba(col, 1 - behind / 0.6);
                ctx.beginPath();
                ctx.arc(x, y, 3 + behind * 22, 0, TAU);
                ctx.stroke();
            }
        }
    };
};

/* 38 ── Checkered Flag: a racing floor rushing toward the viewer */
export const checkerRun: Factory = (ctx, w, h, o) => {
    const n = o.colors.length,
        hy = h * 0.42,
        K = (h - hy) * 0.35,
        C = 18,
        RN = 28;
    const c0 = o.colors[0],
        c1 = o.colors[1 % n],
        c2 = o.colors[2 % n];
    return (t) => {
        wipe(ctx, w, h, o);
        const g = ctx.createLinearGradient(0, hy - h * 0.3, 0, hy);
        g.addColorStop(0, rgba(c2, 0));
        g.addColorStop(1, rgba(c2, Math.min(1, 0.4 * o.intensity * 1.3)));
        ctx.fillStyle = g;
        ctx.fillRect(0, hy - h * 0.3, w, h * 0.3);
        const s = t * 1.6,
            fl = Math.floor(s),
            fr = s - fl;
        for (let k = 0; k < RN; k++) {
            const d0 = Math.max(0.3, k + 0.3 - fr),
                d1 = k + 1.3 - fr;
            if (d1 <= 0.3) continue;
            const u0 = K / d0,
                u1 = K / d1,
                y0 = hy + u0,
                y1 = hy + u1,
                fade = Math.pow(1 - clamp01(d0 / RN), 1.4);
            for (let c = 0; c < C; c++) {
                const a = (c - C / 2) * 1.15,
                    b = (c + 1 - C / 2) * 1.15,
                    odd = (k + fl + c) & 1;
                ctx.fillStyle = rgba(
                    odd ? c0 : c1,
                    Math.min(1, (odd ? 0.55 : 0.18) * o.intensity * 1.4 * fade),
                );
                ctx.beginPath();
                ctx.moveTo(w / 2 + a * u0, y0);
                ctx.lineTo(w / 2 + b * u0, y0);
                ctx.lineTo(w / 2 + b * u1, y1);
                ctx.lineTo(w / 2 + a * u1, y1);
                ctx.closePath();
                ctx.fill();
            }
        }
    };
};

/* 39 ── Loot Drop: rarity-colored light pillars with rising shards */
export const lootPillars: Factory = (ctx, w, h, o) => {
    const n = o.colors.length,
        fy = h * 0.78,
        P = 5;
    return (t) => {
        wipe(ctx, w, h, o);
        glow(ctx, o);
        for (let i = 0; i < P; i++) {
            const px = w * (0.14 + (0.72 * i) / (P - 1)),
                col = o.colors[i % n],
                wb =
                    Math.min(w * 0.07, 90) *
                    (0.9 + 0.1 * Math.sin(t * 1.3 + i));
            const g = ctx.createLinearGradient(0, fy, 0, 0);
            g.addColorStop(0, rgba(col, Math.min(1, 0.5 * o.intensity * 1.4)));
            g.addColorStop(1, rgba(col, 0));
            ctx.fillStyle = g;
            ctx.fillRect(px - wb / 2, 0, wb, fy);
            const g2 = ctx.createLinearGradient(0, fy, 0, 0);
            g2.addColorStop(0, rgba(col, 0.8));
            g2.addColorStop(0.7, rgba(col, 0));
            ctx.fillStyle = g2;
            ctx.fillRect(px - wb * 0.09, 0, wb * 0.18, fy);
            ctx.save();
            ctx.translate(px, fy);
            ctx.scale(1, 0.25);
            const bg = ctx.createRadialGradient(0, 0, 0, 0, 0, wb * 1.4);
            bg.addColorStop(0, rgba(col, 0.55));
            bg.addColorStop(1, rgba(col, 0));
            ctx.fillStyle = bg;
            ctx.beginPath();
            ctx.arc(0, 0, wb * 1.4, 0, TAU);
            ctx.fill();
            ctx.restore();
            for (let j = 0; j < 9; j++) {
                const ph = (j / 9 + t * (0.08 + 0.02 * (j % 3)) + i * 0.13) % 1;
                const x = px + Math.sin(ph * 7 + j + i) * wb * 0.55,
                    y = fy - ph * fy * 0.9,
                    s = 2 + (j % 3);
                ctx.save();
                ctx.globalAlpha = Math.sin(ph * Math.PI);
                ctx.translate(x, y);
                ctx.rotate(Math.PI / 4);
                ctx.fillStyle = col;
                ctx.fillRect(-s, -s, s * 2, s * 2);
                ctx.restore();
            }
        }
        normal(ctx);
        ctx.strokeStyle = rgba(o.colors[0], 0.15);
        ctx.beginPath();
        ctx.moveTo(0, fy);
        ctx.lineTo(w, fy);
        ctx.stroke();
    };
};

/* 40 ── Track & Field: runners lapping an athletics oval */
export const trackLanes: Factory = (ctx, w, h, o) => {
    const LN = 8,
        U = Math.min(h, w * 0.6),
        r0 = U * 0.13,
        gap = U * 0.032,
        rOut = r0 + (LN - 1) * gap;
    const L = Math.min(w * 0.5, Math.max(0, w * 0.9 - 2 * rOut)),
        cx = w / 2,
        cy = h / 2;
    const per = (r: number) => 2 * L + 2 * Math.PI * r;
    const pos = (s0: number, r: number): [number, number] => {
        const P = per(r),
            arc = Math.PI * r;
        let s = ((s0 % P) + P) % P;
        if (s < L) return [cx - L / 2 + s, cy - r];
        s -= L;
        if (s < arc) {
            const a = -Math.PI / 2 + s / r;
            return [cx + L / 2 + Math.cos(a) * r, cy + Math.sin(a) * r];
        }
        s -= arc;
        if (s < L) return [cx + L / 2 - s, cy + r];
        s -= L;
        const a = Math.PI / 2 + s / r;
        return [cx - L / 2 + Math.cos(a) * r, cy + Math.sin(a) * r];
    };
    const lanes = Array.from({ length: LN }, (_, i) => {
        const r = r0 + i * gap,
            P = per(r);
        const path = new Path2D();
        path.moveTo(cx - L / 2, cy - r);
        path.lineTo(cx + L / 2, cy - r);
        path.arc(cx + L / 2, cy, r, -Math.PI / 2, Math.PI / 2);
        path.lineTo(cx - L / 2, cy + r);
        path.arc(cx - L / 2, cy, r, Math.PI / 2, (3 * Math.PI) / 2);
        path.closePath();
        return {
            r,
            P,
            path,
            T: 13 + i * 0.35,
            ph: Math.random(),
            col: ramp(o.colors, i / (LN - 1)),
        };
    });
    return (t) => {
        wipe(ctx, w, h, o);
        glow(ctx, o);
        ctx.lineWidth = 1;
        for (const l of lanes) {
            ctx.strokeStyle = rgba(l.col, 0.2);
            ctx.stroke(l.path);
        }
        ctx.strokeStyle = rgba(o.colors[0], 0.5);
        ctx.beginPath();
        ctx.moveTo(cx, cy - rOut - 4);
        ctx.lineTo(cx, cy - r0 + 4);
        ctx.stroke();
        for (const l of lanes) {
            const s = (t / l.T + l.ph) * l.P;
            for (let j = 14; j >= 0; j--) {
                const [x, y] = pos(s - j * 9, l.r),
                    f = 1 - j / 15;
                ctx.fillStyle = rgba(
                    l.col,
                    f * f * Math.min(1, o.intensity * 1.4),
                );
                ctx.beginPath();
                ctx.arc(x, y, 1.5 + f * 3, 0, TAU);
                ctx.fill();
            }
        }
    };
};

/* 41 ── Slam Arc: long-exposure ball bounces with strobing trails */
