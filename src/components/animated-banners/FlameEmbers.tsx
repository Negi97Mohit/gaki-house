// src/components/animated-banners/FlameEmbers.tsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FlameEmbersProps {
  count?: number;
  colorPrimary?: string;
  colorSecondary?: string;
}

export const FlameEmbers: React.FC<FlameEmbersProps> = ({
  count = 300,
  colorPrimary = '#ff4400',
  colorSecondary = '#ffaa00'
}) => {
  const embersRef = useRef<THREE.Points>(null);
  
  const { positions, colors, speeds, phases, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    const sizes = new Float32Array(count);
    
    const color1 = new THREE.Color(colorPrimary);
    const color2 = new THREE.Color(colorSecondary);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Start at bottom, spread horizontally
      positions[i3] = (Math.random() - 0.5) * 4;
      positions[i3 + 1] = -1 + Math.random() * 3;
      positions[i3 + 2] = (Math.random() - 0.5) * 1;
      
      // Random speeds
      speeds[i] = 0.5 + Math.random() * 1.5;
      phases[i] = Math.random() * Math.PI * 2;
      sizes[i] = 0.02 + Math.random() * 0.04;
      
      // Color gradient based on height
      const heightFactor = (positions[i3 + 1] + 1) / 4;
      const mixedColor = color1.clone().lerp(color2, heightFactor);
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }
    
    return { positions, colors, speeds, phases, sizes };
  }, [count, colorPrimary, colorSecondary]);

  useFrame((state) => {
    if (!embersRef.current) return;
    
    const time = state.clock.elapsedTime;
    const positionAttr = embersRef.current.geometry.attributes.position;
    const colorAttr = embersRef.current.geometry.attributes.color;
    const posArray = positionAttr.array as Float32Array;
    const colorArray = colorAttr.array as Float32Array;
    
    const color1 = new THREE.Color(colorPrimary);
    const color2 = new THREE.Color(colorSecondary);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Rise up with flickering
      posArray[i3 + 1] += speeds[i] * 0.01;
      posArray[i3] += Math.sin(time * 2 + phases[i]) * 0.01;
      posArray[i3 + 2] += Math.cos(time * 1.5 + phases[i]) * 0.005;
      
      // Reset when too high
      if (posArray[i3 + 1] > 2) {
        posArray[i3 + 1] = -1;
        posArray[i3] = (Math.random() - 0.5) * 4;
        posArray[i3 + 2] = (Math.random() - 0.5) * 1;
      }
      
      // Update color based on height
      const heightFactor = (posArray[i3 + 1] + 1) / 3;
      const alpha = 1 - Math.pow(heightFactor, 2);
      const mixedColor = color1.clone().lerp(color2, heightFactor);
      colorArray[i3] = mixedColor.r * alpha;
      colorArray[i3 + 1] = mixedColor.g * alpha;
      colorArray[i3 + 2] = mixedColor.b * alpha;
    }
    
    positionAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
  });

  return (
    <>
      <points ref={embersRef}>
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
          size={0.03}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      
      {/* Core flame glow */}
      <mesh position={[0, -0.5, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial
          color={colorPrimary}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Ambient fire light */}
      <pointLight
        position={[0, 0, 0]}
        color={colorPrimary}
        intensity={3}
        distance={8}
      />
    </>
  );
};
