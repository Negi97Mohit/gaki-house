// src/components/layouts/HybridGridScene.tsx
import React, { useRef, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGridMotionFrame } from "@/hooks/useGridMotion";
import {
  GRID_VERTEX_BASE,
  LIQUID_FRAGMENT,
  VOGUE_FRAGMENT,
} from "@/lib/webgl/shaders/gridShaders";

interface HybridGridSceneProps {
  effectType: "vogue" | "liquid" | "origami" | "void";
}

export const HybridGridScene: React.FC<HybridGridSceneProps> = ({
  effectType,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  // Create shader material based on active effect
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: GRID_VERTEX_BASE,
      fragmentShader:
        effectType === "liquid" ? LIQUID_FRAGMENT : VOGUE_FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uScrollVelocity: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(viewport.width, viewport.height),
        },
        uColor: { value: new THREE.Color("#0a0a0a") },
      },
      wireframe: effectType === "origami",
      transparent: true,
    });
  }, [effectType, viewport]);

  // Sync uniforms with motion engine
  useGridMotionFrame((state) => {
    if (meshRef.current) {
      const uniforms = (meshRef.current.material as THREE.ShaderMaterial)
        .uniforms;
      uniforms.uTime.value = state.time;
      uniforms.uMouse.value.copy(state.mouse);
      uniforms.uScrollVelocity.value = state.velocity;
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 64, 64]} />{" "}
      {/* High segment count for vertex displacement */}
      <primitive object={material} attach="material" />
    </mesh>
  );
};
