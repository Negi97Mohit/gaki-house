import type { Ctx, Opts } from "./types";

export const TAU = Math.PI * 2;
export const rgba = (hex: string, a: number) => {
    const n = parseInt(hex.slice(1, 7), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
export const mix = (hex: string, to: string, k: number) => {
    const a = parseInt(hex.slice(1, 7), 16),
        b = parseInt(to.slice(1, 7), 16);
    const ch = (s: number) =>
        Math.round(((a >> s) & 255) * (1 - k) + ((b >> s) & 255) * k);
    return (
        "#" +
        [16, 8, 0].map((s) => ch(s).toString(16).padStart(2, "0")).join("")
    );
};
export const wipe = (ctx: Ctx, w: number, h: number, o: Opts, a = 1) => {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = rgba(o.bg, a);
    ctx.fillRect(0, 0, w, h);
};
export const glow = (ctx: Ctx, o: Opts) => {
    ctx.globalCompositeOperation = o.dark ? "lighter" : "multiply";
};
export const normal = (ctx: Ctx) => {
    ctx.globalCompositeOperation = "source-over";
};

export const rgb = (hex: string): [number, number, number] => {
    const n = parseInt(hex.slice(1, 7), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const lowRes = (w: number, h: number, scale: number) => {
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

export const ramp = (cs: string[], f: number) => {
    if (cs.length < 2) return cs[0];
    const p = Math.min(1, Math.max(0, f)) * (cs.length - 1);
    const i = Math.min(cs.length - 2, Math.floor(p));
    return mix(cs[i], cs[i + 1], p - i);
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (v: number) => v * v * (3 - 2 * v);
export const rr = (
    ctx: Ctx,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
) => {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
};
export const heart = (ctx: Ctx, x: number, y: number, s: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.35);
    ctx.bezierCurveTo(
        x - s,
        y - s * 0.2,
        x - s * 0.55,
        y - s * 0.95,
        x,
        y - s * 0.45,
    );
    ctx.bezierCurveTo(
        x + s * 0.55,
        y - s * 0.95,
        x + s,
        y - s * 0.2,
        x,
        y + s * 0.35,
    );
    ctx.closePath();
};
export const star = (ctx: Ctx, x: number, y: number, r: number) => {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5,
            rad = i % 2 ? r * 0.45 : r;
        i
            ? ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad)
            : ctx.moveTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    ctx.closePath();
};
