// src/components/animated-banners/VTuberFrame.tsx
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingGemsProps {
  count?: number;
  color?: string;
}

export const FloatingGems: React.FC<FloatingGemsProps> = ({
  count = 8,
  color = '#ff69b4'
}) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const gemPositions = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 2 + Math.random() * 0.5;
      return {
        x: Math.cos(angle) * radius,
        y: (Math.random() - 0.5) * 1.5,
        z: Math.sin(angle) * radius,
        scale: 0.1 + Math.random() * 0.1,
        phase: Math.random() * Math.PI * 2
      };
    });
  }, [count]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    groupRef.current.rotation.y = time * 0.1;
    
    groupRef.current.children.forEach((child, i) => {
      const gem = gemPositions[i];
      child.position.y = gem.y + Math.sin(time * 2 + gem.phase) * 0.2;
      child.rotation.y = time + gem.phase;
      child.rotation.z = Math.sin(time * 0.5 + gem.phase) * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {gemPositions.map((pos, i) => (
        <mesh
          key={i}
          position={[pos.x, pos.y, pos.z]}
          scale={pos.scale}
        >
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
      
      {/* Central glow */}
      <pointLight position={[0, 0, 0]} color={color} intensity={1} distance={5} />
    </group>
  );
};

interface StarSparklesProps {
  count?: number;
}

export const StarSparkles: React.FC<StarSparklesProps> = ({ count = 30 }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const { positions, phases } = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.5 + Math.random() * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      phases[i] = Math.random() * Math.PI * 2;
    }
    
    return { positions, phases };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.elapsedTime;
    const material = pointsRef.current.material as THREE.PointsMaterial;
    
    // Twinkle effect
    material.opacity = 0.6 + Math.sin(time * 3) * 0.3;
    pointsRef.current.rotation.y = time * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#fffacd"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// 2D Frame overlay component for use outside Canvas
export const VTuberFrameOverlay: React.FC<{
  primaryColor?: string;
  secondaryColor?: string;
}> = ({
  primaryColor = '#ff69b4',
  secondaryColor = '#87ceeb'
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Corner decorations */}
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
        <motion.div
          key={corner}
          className={`absolute w-16 h-16 ${corner.includes('top') ? 'top-2' : 'bottom-2'} ${corner.includes('left') ? 'left-2' : 'right-2'}`}
          animate={{
            scale: [1, 1.1, 1],
            rotate: corner.includes('right') ? [0, 5, 0] : [0, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id={`gradient-${corner}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={primaryColor} />
                <stop offset="100%" stopColor={secondaryColor} />
              </linearGradient>
            </defs>
            <path
              d={corner.includes('left') 
                ? (corner.includes('top') ? 'M0,50 L0,0 L50,0' : 'M0,50 L0,100 L50,100')
                : (corner.includes('top') ? 'M50,0 L100,0 L100,50' : 'M50,100 L100,100 L100,50')
              }
              stroke={`url(#gradient-${corner})`}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
      ))}
      
      {/* Floating hearts/stars */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          style={{
            left: `${15 + i * 18}%`,
            top: '-20px',
            color: i % 2 === 0 ? primaryColor : secondaryColor,
          }}
          animate={{
            y: [0, 10, 0],
            opacity: [0.5, 1, 0.5],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        >
          {i % 2 === 0 ? '✦' : '♡'}
        </motion.div>
      ))}
    </div>
  );
};
