import type { Factory } from "./types";
import { TAU, rgba, mix, wipe, glow, normal, rgb, lowRes, ramp, clamp01, smooth, rr, heart, star } from "./helpers";

/* 11 ── Ink Bloom: watercolor pigment blooming into wet paper */
export const inkBloom: Factory = (ctx, w, h, o) => {
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
                Math.sin(Math.PI * Math.min(1, p * 1.15)) *
                o.intensity *
                0.03 *
                k;
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
export const brushStrokes: Factory = (ctx, w, h, o) => {
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
export const ditherField: Factory = (ctx, w, h, o) => {
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
                        Math.sin(
                            Math.hypot(nx - 0.5, (ny - 0.5) * 0.6) * 14 -
                                t * 0.5,
                        );
                v = Math.min(1, Math.max(0, v));
                v = Math.min(1, v * v * 1.5);
                const idx = Math.max(
                    0,
                    Math.min(
                        n,
                        Math.floor(
                            v * (n + 1) +
                                BAYER[(y & 3) * 4 + (x & 3)] / 16 -
                                0.5,
                        ),
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
export const stainedGlass: Factory = (ctx, w, h, o) => {
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
export const livePen: Factory = (ctx, w, h, o) => {
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
                    p.hd =
                        Math.atan2(h / 2 - p.y, w / 2 - p.x) +
                        (Math.random() - 0.5);
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
                    Math.min(
                        1,
                        P[i].a * Math.pow(1 - age, 1.5) * o.intensity * 1.4,
                    ),
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
export const grainMesh: Factory = (ctx, w, h, o) => {
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
            const x =
                w * (0.5 + 0.4 * Math.sin(t * (0.11 + i * 0.037) + i * 1.9));
            const y =
                h * (0.5 + 0.4 * Math.cos(t * (0.09 + i * 0.041) + i * 2.7));
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
export const glitchScan: Factory = (ctx, w, h, o) => {
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
                ctx.fillRect(
                    g.x + (ch - 1) * split + g.sh * (1 - k),
                    g.y,
                    g.w,
                    g.h,
                );
            }
        }
        normal(ctx);
        ctx.fillStyle = o.dark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.05)";
        for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    };
};

/* 18 ── Kaleidoscope: mirrored wedges of drifting shapes */
export const kaleidoscope: Factory = (ctx, w, h, o) => {
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
            const r =
                R * (0.06 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.sr + s.pr)));
            const x = Math.cos(a) * r,
                y = Math.sin(a) * r;
            const sz =
                R * (0.025 + 0.06 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ss)));
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
                ctx.moveTo(
                    x - Math.cos(q) * sz * 2.5,
                    y - Math.sin(q) * sz * 2.5,
                );
                ctx.lineTo(
                    x + Math.cos(q) * sz * 2.5,
                    y + Math.sin(q) * sz * 2.5,
                );
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
export const paperLayers: Factory = (ctx, w, h, o) => {
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
                    Math.sin(
                        nx * (2 + l * 0.45) +
                            t * 0.18 * (1 + l * 0.12) +
                            l * 1.7,
                    ) *
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
export const contourTopo: Factory = (ctx, w, h, o) => {
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
                        Math.sin(
                            Math.hypot(nx - 0.5, ny - 0.5) * 9 - t * 0.3,
                        )) *
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
