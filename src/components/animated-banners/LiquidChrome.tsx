// src/components/animated-banners/LiquidChrome.tsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MeshDistortMaterial } from '@react-three/drei';

interface LiquidChromeProps {
  color?: string;
  speed?: number;
  distort?: number;
}

export const LiquidChrome: React.FC<LiquidChromeProps> = ({
  color = '#888888',
  speed = 2,
  distort = 0.4
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const mesh2Ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.2;
      meshRef.current.rotation.y = time * 0.1;
    }
    
    if (mesh2Ref.current) {
      mesh2Ref.current.rotation.x = Math.cos(time * 0.15) * 0.3;
      mesh2Ref.current.rotation.y = -time * 0.08;
    }
  });

  return (
    <>
      {/* Main chrome blob */}
      <mesh ref={meshRef} position={[0, 0, 0]} scale={1.5}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          metalness={1}
          roughness={0.1}
          distort={distort}
          speed={speed}
        />
      </mesh>
      
      {/* Secondary blob */}
      <mesh ref={mesh2Ref} position={[1.5, 0.5, -0.5]} scale={0.7}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          metalness={1}
          roughness={0.15}
          distort={distort * 0.8}
          speed={speed * 1.2}
        />
      </mesh>
      
      {/* Accent blob */}
      <mesh position={[-1.2, -0.3, 0.3]} scale={0.5}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          metalness={1}
          roughness={0.05}
          distort={distort * 0.6}
          speed={speed * 0.8}
        />
      </mesh>
      
      {/* Environment lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, -5, 5]} intensity={0.5} color="#4488ff" />
    </>
  );
};
