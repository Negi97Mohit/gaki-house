// src/hooks/useGridMotion.ts
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface GridMotionState {
  mouse: THREE.Vector2; // Normalized -1 to 1
  velocity: number; // Scroll velocity
  scroll: number; // Absolute scroll position
  time: number;
}

// Singleton state to share across components without context overhead
const motionState: GridMotionState = {
  mouse: new THREE.Vector2(0, 0),
  velocity: 0,
  scroll: 0,
  time: 0,
};

export const useGridMotion = () => {
  const lastScroll = useRef(0);
  const lastTime = useRef(0);

  useEffect(() => {
    const updateMouse = (e: MouseEvent) => {
      // Normalize mouse to -1..1
      motionState.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      motionState.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const updateScroll = () => {
      const currentScroll = window.scrollY;
      const now = performance.now();
      const dt = Math.max(1, now - lastTime.current);

      // Calculate velocity
      const delta = currentScroll - lastScroll.current;
      // Dampened velocity
      motionState.velocity = delta / dt;
      motionState.scroll = currentScroll;

      lastScroll.current = currentScroll;
      lastTime.current = now;
    };

    window.addEventListener("mousemove", updateMouse);
    window.addEventListener("scroll", updateScroll);

    return () => {
      window.removeEventListener("mousemove", updateMouse);
      window.removeEventListener("scroll", updateScroll);
    };
  }, []);

  return motionState;
};

// Hook to access motion inside R3F components
export const useGridMotionFrame = (
  callback?: (state: GridMotionState, delta: number) => void
) => {
  useFrame((state, delta) => {
    motionState.time += delta;
    // Decay velocity
    motionState.velocity *= 0.95;

    if (callback) {
      callback(motionState, delta);
    }
  });

  return motionState;
};
