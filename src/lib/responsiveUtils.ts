// src/lib/responsiveUtils.ts

export type ScreenSize = 'mobile' | 'tablet' | 'desktop';

export function getScreenSize(): ScreenSize {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function useScreenSize(): ScreenSize {
  if (typeof window === 'undefined') return 'desktop';
  
  const [screenSize, setScreenSize] = React.useState<ScreenSize>(getScreenSize());
  
  React.useEffect(() => {
    const handleResize = () => {
      setScreenSize(getScreenSize());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return screenSize;
}

// React import for the hook
import * as React from 'react';
