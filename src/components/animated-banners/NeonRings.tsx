// src/components/animated-banners/NeonRings.tsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NeonRingsProps {
  colors?: [string, string, string];
  rotationSpeed?: number;
}

export const NeonRings: React.FC<NeonRingsProps> = ({
  colors = ['#00ffff', '#ff00ff', '#00ff88'],
  rotationSpeed = 0.5
}) => {
  const group1Ref = useRef<THREE.Group>(null);
  const group2Ref = useRef<THREE.Group>(null);
  const group3Ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (group1Ref.current) {
      group1Ref.current.rotation.x = time * rotationSpeed * 0.3;
      group1Ref.current.rotation.y = time * rotationSpeed * 0.5;
    }
    if (group2Ref.current) {
      group2Ref.current.rotation.x = -time * rotationSpeed * 0.4;
      group2Ref.current.rotation.z = time * rotationSpeed * 0.3;
    }
    if (group3Ref.current) {
      group3Ref.current.rotation.y = time * rotationSpeed * 0.6;
      group3Ref.current.rotation.z = -time * rotationSpeed * 0.2;
    }
  });

  const createRingMaterial = (color: string) => (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={2}
      transparent
      opacity={0.8}
      side={THREE.DoubleSide}
    />
  );

  return (
    <>
      {/* Large outer ring */}
      <group ref={group1Ref}>
        <mesh>
          <torusGeometry args={[2, 0.02, 16, 100]} />
          {createRingMaterial(colors[0])}
        </mesh>
        {/* Ring glow effect */}
        <mesh>
          <torusGeometry args={[2, 0.08, 16, 100]} />
          <meshBasicMaterial
            color={colors[0]}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Medium ring */}
      <group ref={group2Ref}>
        <mesh>
          <torusGeometry args={[1.5, 0.015, 16, 80]} />
          {createRingMaterial(colors[1])}
        </mesh>
        <mesh>
          <torusGeometry args={[1.5, 0.06, 16, 80]} />
          <meshBasicMaterial
            color={colors[1]}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Small inner ring */}
      <group ref={group3Ref}>
        <mesh>
          <torusGeometry args={[1, 0.01, 16, 60]} />
          {createRingMaterial(colors[2])}
        </mesh>
        <mesh>
          <torusGeometry args={[1, 0.04, 16, 60]} />
          <meshBasicMaterial
            color={colors[2]}
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </>
  );
};
