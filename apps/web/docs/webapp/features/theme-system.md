# Theme System

→ Back to [Index](../../INDEX.md) | [Features](./README.md)

---

## Overview

The theme system provides **multiple visual themes**, dark/light mode, and **custom Google Fonts** — all persisted via Zustand.

## Feature Module

```
src/features/theme/
└── (useThemeStore, ThemeProvider)
```

## Theme Store

The `useThemeStore` (Zustand with persistence) manages:

| State | Type | Options |
|---|---|---|
| `theme` | string | `default`, `ocean`, `forest`, `sunset` |
| `mode` | string | `dark`, `light` |
| `fontFamily` | string | Any Google Font name |

## Theme Application

`ThemeInitializer` in `App.tsx` applies the theme on every change:

```typescript
function ThemeInitializer() {
  const theme = useThemeStore(s => s.theme);
  const mode = useThemeStore(s => s.mode);
  const fontFamily = useThemeStore(s => s.fontFamily);
  
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-default', 'theme-ocean', 'theme-forest', 'theme-sunset', 'dark', 'light');
    root.classList.add(`theme-${theme}`);
    if (mode === 'dark') root.classList.add('dark');
  }, [theme, mode]);
  
  useEffect(() => {
    // Dynamically load Google Font
    if (fontFamily && fontFamily !== 'geist-sans') {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@300;400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }
    document.documentElement.style.fontFamily = `"${fontFamily}", system-ui, sans-serif`;
  }, [fontFamily]);
}
```

## CSS Architecture

Theme variables are defined in `src/index.css`:

```css
:root {
  /* Default theme */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... more CSS custom properties */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode overrides */
}

.theme-ocean { /* ocean palette */ }
.theme-forest { /* forest palette */ }
.theme-sunset { /* sunset palette */ }
```

All UI components use these CSS variables via Tailwind classes (e.g., `bg-background`, `text-primary`), making theme switching instantaneous.

## Font System

→ Source: [fonts.ts](file:///c:/Users/Dell/Desktop/gaki/src/lib/fonts.ts)

The font registry provides 100+ Google Font names organized by style category for use in caption styling and text overlays.
