// src/shared/constants/color-presets.ts

/**
 * Curated solid color palette for the centralized color picker
 */
export const SOLID_COLOR_PRESETS = [
    '#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA',
    '#ADB5BD', '#6C757D', '#495057', '#343A40', '#212529',
    '#000000', '#FF6B6B', '#EE5A6F', '#F06595', '#CC5DE8',
    '#845EF7', '#5C7CFA', '#339AF0', '#22B8CF', '#20C997',
    '#51CF66', '#94D82D', '#FCC419', '#FF922B', '#FF6B35',
];

/**
 * Beautiful gradient presets with modern color combinations
 */
export const GRADIENT_PRESETS = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    'linear-gradient(135deg, #f77062 0%, #fe5196 100%)',
];

/**
 * Gradient direction presets (in degrees)
 */
export const GRADIENT_DIRECTIONS = [
    { label: '→', value: 90, name: 'Right' },
    { label: '↘', value: 135, name: 'Bottom Right' },
    { label: '↓', value: 180, name: 'Down' },
    { label: '↙', value: 225, name: 'Bottom Left' },
    { label: '←', value: 270, name: 'Left' },
    { label: '↖', value: 315, name: 'Top Left' },
    { label: '↑', value: 0, name: 'Up' },
    { label: '↗', value: 45, name: 'Top Right' },
];

/**
 * Gradient pattern types
 */
export type GradientPatternType = 
    | 'linear'
    | 'radial'
    | 'conic'
    | 'repeating-linear'
    | 'repeating-radial'
    | 'diagonal-stripes'
    | 'horizontal-stripes'
    | 'vertical-stripes'
    | 'mesh'
    | 'spotlight';

export interface GradientPattern {
    id: GradientPatternType;
    label: string;
    icon: string;
    generator: (colors: string[], angle: number, options?: GradientOptions) => string;
}

export interface GradientOptions {
    spread?: number;
    position?: string;
    intensity?: number;
}

/**
 * Generate gradient based on pattern type
 */
export const GRADIENT_PATTERNS: GradientPattern[] = [
    {
        id: 'linear',
        label: 'Linear',
        icon: '▬',
        generator: (colors, angle) => {
            const stops = colors.map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`).join(', ');
            return `linear-gradient(${angle}deg, ${stops})`;
        }
    },
    {
        id: 'radial',
        label: 'Radial',
        icon: '◉',
        generator: (colors, _, options) => {
            const position = options?.position || 'center';
            const stops = colors.map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`).join(', ');
            return `radial-gradient(circle at ${position}, ${stops})`;
        }
    },
    {
        id: 'conic',
        label: 'Conic',
        icon: '◐',
        generator: (colors, angle, options) => {
            const position = options?.position || 'center';
            const stops = colors.map((c, i) => `${c} ${(i / (colors.length - 1)) * 360}deg`).join(', ');
            return `conic-gradient(from ${angle}deg at ${position}, ${stops})`;
        }
    },
    {
        id: 'repeating-linear',
        label: 'Repeating',
        icon: '≡',
        generator: (colors, angle, options) => {
            const spread = options?.spread || 20;
            const stops = colors.map((c, i) => `${c} ${i * spread}px, ${c} ${(i + 1) * spread}px`).join(', ');
            return `repeating-linear-gradient(${angle}deg, ${stops})`;
        }
    },
    {
        id: 'repeating-radial',
        label: 'Ripple',
        icon: '◎',
        generator: (colors, _, options) => {
            const spread = options?.spread || 20;
            const position = options?.position || 'center';
            const stops = colors.map((c, i) => `${c} ${i * spread}px, ${c} ${(i + 1) * spread}px`).join(', ');
            return `repeating-radial-gradient(circle at ${position}, ${stops})`;
        }
    },
    {
        id: 'diagonal-stripes',
        label: 'Diagonal',
        icon: '▧',
        generator: (colors, angle, options) => {
            const spread = options?.spread || 10;
            return `repeating-linear-gradient(${angle}deg, ${colors[0]} 0px, ${colors[0]} ${spread}px, ${colors[1] || colors[0]} ${spread}px, ${colors[1] || colors[0]} ${spread * 2}px)`;
        }
    },
    {
        id: 'horizontal-stripes',
        label: 'H-Stripes',
        icon: '☰',
        generator: (colors, _, options) => {
            const spread = options?.spread || 10;
            return `repeating-linear-gradient(0deg, ${colors[0]} 0px, ${colors[0]} ${spread}px, ${colors[1] || colors[0]} ${spread}px, ${colors[1] || colors[0]} ${spread * 2}px)`;
        }
    },
    {
        id: 'vertical-stripes',
        label: 'V-Stripes',
        icon: '|||',
        generator: (colors, _, options) => {
            const spread = options?.spread || 10;
            return `repeating-linear-gradient(90deg, ${colors[0]} 0px, ${colors[0]} ${spread}px, ${colors[1] || colors[0]} ${spread}px, ${colors[1] || colors[0]} ${spread * 2}px)`;
        }
    },
    {
        id: 'mesh',
        label: 'Mesh',
        icon: '▦',
        generator: (colors, angle) => {
            // Create a mesh-like gradient with multiple overlays using rgba for proper alpha
            const c1 = colors[0];
            const c2 = colors[1] || colors[0];
            // Parse hex to rgba with 50% opacity for overlay
            const hexToRgba = (hex: string, alpha: number) => {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            };
            return `linear-gradient(${angle}deg, ${c1} 0%, transparent 50%, ${c2} 100%), linear-gradient(${angle + 90}deg, ${hexToRgba(c2, 0.5)} 0%, transparent 50%, ${hexToRgba(c1, 0.5)} 100%)`;
        }
    },
    {
        id: 'spotlight',
        label: 'Spotlight',
        icon: '◯',
        generator: (colors, _, options) => {
            const position = options?.position || 'center';
            const intensity = options?.intensity || 0.7;
            return `radial-gradient(ellipse at ${position}, ${colors[0]} 0%, ${colors[1] || colors[0]} ${intensity * 100}%, ${colors[2] || colors[1] || colors[0]} 100%)`;
        }
    },
];

/**
 * Radial position presets
 */
export const RADIAL_POSITIONS = [
    { label: '↖', value: 'top left' },
    { label: '↑', value: 'top center' },
    { label: '↗', value: 'top right' },
    { label: '←', value: 'center left' },
    { label: '◉', value: 'center' },
    { label: '→', value: 'center right' },
    { label: '↙', value: 'bottom left' },
    { label: '↓', value: 'bottom center' },
    { label: '↘', value: 'bottom right' },
];

/**
 * Parse a gradient string to extract its components
 */
export function parseGradient(gradient: string): {
    type: GradientPatternType;
    colors: string[];
    angle: number;
    position?: string;
} {
    const defaultResult = { type: 'linear' as GradientPatternType, colors: ['#667eea', '#764ba2'], angle: 135 };
    
    if (!gradient || !gradient.includes('gradient')) return defaultResult;
    
    // Extract colors
    const colorRegex = /#[0-9a-f]{6}|#[0-9a-f]{3}|rgba?\([^)]+\)|hsla?\([^)]+\)/gi;
    const colors = gradient.match(colorRegex) || defaultResult.colors;
    
    // Determine type
    let type: GradientPatternType = 'linear';
    if (gradient.startsWith('radial')) type = 'radial';
    else if (gradient.startsWith('conic')) type = 'conic';
    else if (gradient.startsWith('repeating-linear')) type = 'repeating-linear';
    else if (gradient.startsWith('repeating-radial')) type = 'repeating-radial';
    
    // Extract angle
    const angleMatch = gradient.match(/(\d+)deg/);
    const angle = angleMatch ? parseInt(angleMatch[1]) : 135;
    
    // Extract position for radial/conic
    const positionMatch = gradient.match(/at\s+([^,)]+)/);
    const position = positionMatch ? positionMatch[1].trim() : 'center';
    
    return { type, colors, angle, position };
}

/**
 * Generate a gradient string from components
 */
export function generateGradient(
    type: GradientPatternType,
    colors: string[],
    angle: number,
    options?: GradientOptions
): string {
    const pattern = GRADIENT_PATTERNS.find(p => p.id === type);
    if (!pattern) {
        // Fallback to linear
        const stops = colors.map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`).join(', ');
        return `linear-gradient(${angle}deg, ${stops})`;
    }
    return pattern.generator(colors, angle, options);
}
