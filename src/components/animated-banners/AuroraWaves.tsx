// src/components/animated-banners/AuroraWaves.tsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';

interface AuroraWavesProps {
  colors?: [string, string, string];
  segments?: number;
  layers?: number;
}

export const AuroraWaves: React.FC<AuroraWavesProps> = ({
  colors = ['#00ff88', '#00aaff', '#ff00aa'],
  segments = 50,
  layers = 3
}) => {
  const meshRefs = useRef<THREE.Mesh[]>([]);
  const noise2D = useMemo(() => createNoise2D(), []);
  
  const geometries = useMemo(() => {
    return colors.map((_, layerIndex) => {
      const geometry = new THREE.PlaneGeometry(8, 2, segments, 10);
      return geometry;
    });
  }, [colors, segments]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    meshRefs.current.forEach((mesh, layerIndex) => {
      if (!mesh) return;
      
      const geometry = mesh.geometry as THREE.PlaneGeometry;
      const positionAttr = geometry.attributes.position;
      const positions = positionAttr.array as Float32Array;
      
      const layerOffset = layerIndex * 0.5;
      const speed = 0.3 + layerIndex * 0.1;
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const originalY = ((i / 3) % (segments + 1)) / segments * 2 - 1;
        
        // Create flowing wave pattern
        const wave1 = Math.sin(x * 0.5 + time * speed + layerOffset) * 0.3;
        const wave2 = Math.sin(x * 0.3 - time * speed * 0.7 + layerOffset) * 0.2;
        const noise = noise2D(x * 0.2 + time * 0.1, originalY + layerOffset) * 0.4;
        
        positions[i + 2] = wave1 + wave2 + noise + layerIndex * 0.3;
      }
      
      positionAttr.needsUpdate = true;
      
      // Subtle horizontal drift
      mesh.position.x = Math.sin(time * 0.1 + layerIndex) * 0.2;
    });
  });

  return (
    <>
      {colors.map((color, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) meshRefs.current[i] = el; }}
          position={[0, 0.5 - i * 0.3, -2 + i * 0.5]}
          rotation={[-0.3, 0, 0]}
        >
          <planeGeometry args={[8, 2, segments, 10]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.4 - i * 0.1}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
      
      {/* Star dust particles */}
      <StarDust count={100} />
    </>
  );
};

const StarDust: React.FC<{ count: number }> = ({ count }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.PointsMaterial;
      material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
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
        size={0.02}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
