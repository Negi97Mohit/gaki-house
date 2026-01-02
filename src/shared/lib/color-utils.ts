// src/shared/lib/color-utils.ts

/**
 * Check if a string is a gradient
 */
export function isGradient(value: string): boolean {
    if (!value) return false;
    return value.includes('gradient');
}

/**
 * Check if a color is transparent
 */
export function isTransparent(value: string): boolean {
    if (!value) return false;
    return value === 'transparent' || 
           value.includes('transparent') || 
           value.endsWith('0)') ||
           value === 'rgba(0,0,0,0)' ||
           value === 'rgba(0, 0, 0, 0)';
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
        const hex = Math.max(0, Math.min(255, x)).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

/**
 * Convert HEX to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    // Handle shorthand hex (#fff)
    let normalizedHex = hex.replace('#', '');
    if (normalizedHex.length === 3) {
        normalizedHex = normalizedHex.split('').map(c => c + c).join('');
    }
    
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalizedHex);
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
    if (!color) return `rgba(0, 0, 0, ${alpha})`;
    
    if (color.startsWith('#')) {
        const rgb = hexToRgb(color);
        if (rgb) {
            return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
        }
    }
    
    // Handle existing rgba
    if (color.startsWith('rgba')) {
        return color.replace(/[\d.]+\)$/, `${alpha})`);
    }
    
    // Handle rgb
    if (color.startsWith('rgb(')) {
        return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }
    
    return color;
}

/**
 * Parse any color format to hex
 */
export function toHex(color: string): string {
    if (!color) return '#000000';
    
    // Already hex
    if (color.startsWith('#')) {
        return color.substring(0, 7);
    }
    
    // RGB/RGBA
    const rgba = parseRgba(color);
    if (rgba) {
        return rgbToHex(rgba.r, rgba.g, rgba.b);
    }
    
    return '#000000';
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

/**
 * Get contrasting text color (black or white) for a background
 */
export function getContrastColor(backgroundColor: string): string {
    if (isGradient(backgroundColor) || isTransparent(backgroundColor)) {
        return '#000000';
    }
    
    const rgb = hexToRgb(toHex(backgroundColor));
    if (!rgb) return '#000000';
    
    // Calculate relative luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Lighten a hex color by a percentage
 */
export function lighten(hex: string, percent: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    const factor = percent / 100;
    return rgbToHex(
        Math.round(rgb.r + (255 - rgb.r) * factor),
        Math.round(rgb.g + (255 - rgb.g) * factor),
        Math.round(rgb.b + (255 - rgb.b) * factor)
    );
}

/**
 * Darken a hex color by a percentage
 */
export function darken(hex: string, percent: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    const factor = 1 - percent / 100;
    return rgbToHex(
        Math.round(rgb.r * factor),
        Math.round(rgb.g * factor),
        Math.round(rgb.b * factor)
    );
}

/**
 * Get the correct CSS property for a color/gradient value
 * Use 'background' for gradients, 'backgroundColor' for solid colors
 */
export function getBackgroundStyle(color: string): React.CSSProperties {
    if (!color) return {};
    if (isGradient(color)) {
        return { background: color };
    }
    return { backgroundColor: color };
}