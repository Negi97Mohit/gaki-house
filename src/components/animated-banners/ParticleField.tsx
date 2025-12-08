// src/components/animated-banners/ParticleField.tsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';

interface ParticleFieldProps {
  count?: number;
  speed?: number;
  noiseScale?: number;
  size?: number;
  color?: string;
  colorVariant?: string;
  spread?: [number, number, number];
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 500,
  speed = 0.3,
  noiseScale = 0.5,
  size = 0.02,
  color = '#a855f7',
  colorVariant = '#3b82f6',
  spread = [4, 2, 2]
}) => {
  const meshRef = useRef<THREE.Points>(null);
  const noise3D = useMemo(() => createNoise3D(), []);
  
  const { positions, colors, velocities, originalPositions } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);
    
    const color1 = new THREE.Color(color);
    const color2 = new THREE.Color(colorVariant);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Distribute particles in an ellipsoid
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random());
      
      positions[i3] = r * Math.sin(phi) * Math.cos(theta) * spread[0];
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * spread[1];
      positions[i3 + 2] = r * Math.cos(phi) * spread[2];
      
      originalPositions[i3] = positions[i3];
      originalPositions[i3 + 1] = positions[i3 + 1];
      originalPositions[i3 + 2] = positions[i3 + 2];
      
      // Random velocities
      velocities[i3] = (Math.random() - 0.5) * speed;
      velocities[i3 + 1] = (Math.random() - 0.5) * speed;
      velocities[i3 + 2] = (Math.random() - 0.5) * speed;
      
      // Interpolate colors
      const mixFactor = Math.random();
      const mixedColor = color1.clone().lerp(color2, mixFactor);
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }
    
    return { positions, colors, velocities, originalPositions };
  }, [count, color, colorVariant, spread, speed]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    const positionAttr = meshRef.current.geometry.attributes.position;
    const posArray = positionAttr.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Apply noise-based movement
      const noiseX = noise3D(
        originalPositions[i3] * noiseScale + time * 0.2,
        originalPositions[i3 + 1] * noiseScale,
        time * 0.1
      );
      const noiseY = noise3D(
        originalPositions[i3 + 1] * noiseScale,
        originalPositions[i3 + 2] * noiseScale + time * 0.2,
        time * 0.1 + 100
      );
      const noiseZ = noise3D(
        originalPositions[i3 + 2] * noiseScale + time * 0.2,
        originalPositions[i3] * noiseScale,
        time * 0.1 + 200
      );
      
      posArray[i3] = originalPositions[i3] + noiseX * 0.5;
      posArray[i3 + 1] = originalPositions[i3 + 1] + noiseY * 0.5 + Math.sin(time * speed + i) * 0.1;
      posArray[i3 + 2] = originalPositions[i3 + 2] + noiseZ * 0.3;
    }
    
    positionAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
