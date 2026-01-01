// src/shared/lib/color-utils.ts

/**
 * Check if a string is a gradient
 */
export function isGradient(value: string): boolean {
    return value.includes('gradient');
}

/**
 * Parse RGB/RGBA color string to components
 */
export function parseRgba(color: string): { r: number; g: number; b: number; a: number } | null {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return null;

    return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: match[4] ? parseFloat(match[4]) : 1,
    };
}

/**
 * Convert RGB to HEX
 */
export function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

/**
 * Convert HEX to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Add alpha to a color
 */
export function addAlpha(color: string, alpha: number): string {
    if (color.startsWith('#')) {
        const rgb = hexToRgb(color);
        if (rgb) {
            return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
        }
    }
    return color;
}

/**
 * Create a linear gradient string
 */
export function createLinearGradient(colors: string[], angle: number = 90): string {
    const stops = colors.map((color, i) => {
        const percent = (i / (colors.length - 1)) * 100;
        return `${color} ${percent}%`;
    }).join(', ');

    return `linear-gradient(${angle}deg, ${stops})`;
}

/**
 * Create a radial gradient string
 */
export function createRadialGradient(colors: string[]): string {
    const stops = colors.map((color, i) => {
        const percent = (i / (colors.length - 1)) * 100;
        return `${color} ${percent}%`;
    }).join(', ');

    return `radial-gradient(circle, ${stops})`;
}

/**
 * Extract colors from a gradient string
 */
export function extractGradientColors(gradient: string): string[] {
    const colorRegex = /#[0-9a-f]{6}|#[0-9a-f]{3}|rgba?\([^)]+\)/gi;
    return gradient.match(colorRegex) || [];
}
