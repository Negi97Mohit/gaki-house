// src/components/animated-banners/CrystalPrism.tsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CrystalPrismProps {
  color?: string;
  size?: number;
}

export const CrystalPrism: React.FC<CrystalPrismProps> = ({
  color = '#ffffff',
  size = 1
}) => {
  const mainCrystalRef = useRef<THREE.Mesh>(null);
  const shardsGroupRef = useRef<THREE.Group>(null);
  
  const shardPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 1.5 + Math.random() * 0.5;
      positions.push([
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 1.5,
        Math.sin(angle) * radius
      ]);
    }
    return positions;
  }, []);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (mainCrystalRef.current) {
      mainCrystalRef.current.rotation.y = time * 0.2;
      mainCrystalRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
    }
    
    if (shardsGroupRef.current) {
      shardsGroupRef.current.rotation.y = -time * 0.1;
      shardsGroupRef.current.children.forEach((shard, i) => {
        shard.rotation.y = time * 0.5 + i;
        shard.rotation.z = Math.sin(time * 0.3 + i * 0.5) * 0.3;
        shard.position.y = shardPositions[i][1] + Math.sin(time * 0.5 + i) * 0.2;
      });
    }
  });

  const crystalMaterial = useMemo(() => (
    <meshPhysicalMaterial
      color={color}
      metalness={0}
      roughness={0}
      transmission={0.9}
      thickness={1}
      ior={2.4}
      transparent
      opacity={0.9}
    />
  ), [color]);

  return (
    <>
      {/* Main crystal */}
      <mesh ref={mainCrystalRef} scale={size}>
        <octahedronGeometry args={[0.8, 0]} />
        {crystalMaterial}
      </mesh>
      
      {/* Inner glow */}
      <mesh scale={size * 0.6}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Orbiting shards */}
      <group ref={shardsGroupRef}>
        {shardPositions.map((pos, i) => (
          <mesh key={i} position={pos} scale={0.15 + Math.random() * 0.1}>
            <octahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial
              color={color}
              metalness={0}
              roughness={0}
              transmission={0.8}
              thickness={0.5}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}
      </group>
      
      {/* Light rays */}
      <pointLight position={[0, 0, 0]} color={color} intensity={2} distance={5} />
    </>
  );
};
