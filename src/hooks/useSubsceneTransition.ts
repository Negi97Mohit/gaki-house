// src/hooks/useSubsceneTransition.ts
import { useRef, useCallback, useEffect } from 'react';
import { animate, createTimeline } from 'animejs';

interface TransitionOptions {
  duration?: number;
  easing?: string;
  onComplete?: () => void;
}

export const useSubsceneTransition = (containerRef: React.RefObject<HTMLElement>) => {
  const isTransitioning = useRef(false);

  const fadeTransition = useCallback((options: TransitionOptions = {}) => {
    const { duration = 300, easing = 'easeInOutQuad', onComplete } = options;
    
    if (!containerRef.current || isTransitioning.current) return;
    
    isTransitioning.current = true;
    
    animate(containerRef.current, {
      opacity: [1, 0, 1],
      duration,
      easing,
      complete: () => {
        isTransitioning.current = false;
        onComplete?.();
      }
    });
  }, [containerRef]);

  const slideTransition = useCallback((direction: 'left' | 'right' | 'up' | 'down' = 'right', options: TransitionOptions = {}) => {
    const { duration = 400, easing = 'easeOutExpo', onComplete } = options;
    
    if (!containerRef.current || isTransitioning.current) return;
    
    isTransitioning.current = true;
    
    const translateProp = direction === 'left' || direction === 'right' ? 'translateX' : 'translateY';
    const startValue = direction === 'right' || direction === 'down' ? '100%' : '-100%';
    
    animate(containerRef.current, {
      [translateProp]: [startValue, '0%'],
      opacity: [0, 1],
      duration,
      easing,
      complete: () => {
        isTransitioning.current = false;
        onComplete?.();
      }
    });
  }, [containerRef]);

  const scaleTransition = useCallback((options: TransitionOptions = {}) => {
    const { duration = 350, easing = 'easeOutBack', onComplete } = options;
    
    if (!containerRef.current || isTransitioning.current) return;
    
    isTransitioning.current = true;
    
    animate(containerRef.current, {
      scale: [0.9, 1],
      opacity: [0, 1],
      duration,
      easing,
      complete: () => {
        isTransitioning.current = false;
        onComplete?.();
      }
    });
  }, [containerRef]);

  const glitchTransition = useCallback((options: TransitionOptions = {}) => {
    const { duration = 500, onComplete } = options;
    
    if (!containerRef.current || isTransitioning.current) return;
    
    isTransitioning.current = true;
    
    const timeline = createTimeline({
      onComplete: () => {
        isTransitioning.current = false;
        onComplete?.();
      }
    });
    
    timeline
      .add(containerRef.current, {
        translateX: [-5, 5, -3, 3, 0],
        opacity: [0.7, 1, 0.8, 1],
        duration: duration * 0.3,
        easing: 'steps(4)'
      })
      .add(containerRef.current, {
        filter: ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'hue-rotate(0deg)'],
        duration: duration * 0.2,
        easing: 'linear'
      }, '-=100')
      .add(containerRef.current, {
        scale: [1.02, 1],
        duration: duration * 0.5,
        easing: 'easeOutElastic(1, 0.5)'
      });
  }, [containerRef]);

  const wipeTransition = useCallback((direction: 'horizontal' | 'vertical' = 'horizontal', options: TransitionOptions = {}) => {
    const { duration = 400, easing = 'easeInOutQuad', onComplete } = options;
    
    if (!containerRef.current || isTransitioning.current) return;
    
    isTransitioning.current = true;
    
    const clipPath = direction === 'horizontal' 
      ? ['inset(0 100% 0 0)', 'inset(0 0 0 0)']
      : ['inset(100% 0 0 0)', 'inset(0 0 0 0)'];
    
    animate(containerRef.current, {
      clipPath,
      duration,
      easing,
      complete: () => {
        isTransitioning.current = false;
        onComplete?.();
      }
    });
  }, [containerRef]);

  return {
    fadeTransition,
    slideTransition,
    scaleTransition,
    glitchTransition,
    wipeTransition,
    isTransitioning: isTransitioning.current
  };
};

export default useSubsceneTransition;
