// src/components/layouts/dynamic/ParticleDissolveLayout.tsx
import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture, ScrollControls, useScroll, Text } from "@react-three/drei";
import * as THREE from "three";
import { CanvasSectionState } from "@/types/caption";

// --- 1. The Particle Shader ---
const ParticleShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector3(0, 0, 0) },
    uTexture: { value: null },
    uResolution: { value: new THREE.Vector2(1, 1) },
  },
  vertexShader: `
    uniform float uTime;
    uniform vec3 uMouse;
    attribute vec3 initialPosition;
    attribute float random;
    varying vec2 vUv;
    varying float vDistance;

    void main() {
      vUv = uv;
      vec3 pos = initialPosition;
      
      // Calculate distance from mouse (in world space)
      float d = distance(uMouse.xy, pos.xy);
      
      // Dispersion Logic
      // If mouse is close, push particles away based on "random" attribute
      float radius = 2.0;
      if(d < radius) {
        float force = (radius - d) / radius;
        vec3 dir = normalize(pos - uMouse);
        pos += dir * force * 3.0 * random; // Explode outward
        pos.z += force * 5.0 * random;     // Also pop forward
      }

      // Gentle floating
      pos.y += sin(uTime + random * 10.0) * 0.05;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = (4.0 * random + 2.0) * (10.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
      
      vDistance = d;
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    varying vec2 vUv;
    varying float vDistance;

    void main() {
      vec4 texColor = texture2D(uTexture, vUv);
      
      // Circular particle shape
      vec2 coord = gl_PointCoord - vec2(0.5);
      if(length(coord) > 0.5) discard;

      // Glow when disturbed
      float glow = smoothstep(2.0, 0.0, vDistance);
      vec3 finalColor = mix(texColor.rgb, vec3(1.0, 1.0, 1.0), glow * 0.5);

      gl_FragColor = vec4(finalColor, texColor.a);
    }
  `,
};

// --- 2. The Particle Image Component ---
const ParticleImage = ({
  section,
  position,
}: {
  section: CanvasSectionState;
  position: [number, number, number];
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Use placeholder texture or real content
  const texture = useTexture(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
  );

  // Generate Particles
  const { positions, uvs, randoms } = useMemo(() => {
    const count = 64 * 64; // 4096 particles per image
    const positions = new Float32Array(count * 3);
    const uvs = new Float32Array(count * 2);
    const randoms = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Grid arrangement
      const x = (i % 64) / 64;
      const y = Math.floor(i / 64) / 64;

      // Center the grid
      positions[i * 3] = (x - 0.5) * 4;
      positions[i * 3 + 1] = (y - 0.5) * 3;
      positions[i * 3 + 2] = 0;

      uvs[i * 2] = x;
      uvs[i * 2 + 1] = y;

      randoms[i] = Math.random();
    }
    return { positions, uvs, randoms };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;

      // Map mouse to world space (roughly)
      const mouseX = (state.mouse.x * state.viewport.width) / 2;
      const mouseY = (state.mouse.y * state.viewport.height) / 2;

      // Adjust for this object's position
      material.uniforms.uMouse.value.set(
        mouseX - position[0],
        mouseY - position[1],
        0
      );
    }
  });

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-initialPosition" // Custom attribute for shader
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-uv"
          count={uvs.length / 2}
          array={uvs}
          itemSize={2}
        />
        <bufferAttribute
          attach="attributes-random"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        args={[ParticleShaderMaterial]}
        uniforms-uTexture-value={texture}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// --- 3. Main Layout ---
export const ParticleDissolveLayout: React.FC<{
  sections: CanvasSectionState[];
}> = ({ sections }) => {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 8] }}>
        <color attach="background" args={["#000"]} />

        <ScrollControls pages={sections.length} damping={0.2}>
          {/* Custom Scroll Container */}
          <group>
            {sections.map((section, i) => (
              <ParticleImage
                key={section.id}
                section={section}
                position={[0, -i * 4 + 2, 0]}
              />
            ))}
          </group>
        </ScrollControls>
      </Canvas>

      <div className="absolute bottom-8 right-8 text-white/40 text-xs font-mono">
        /// ATOMIC_DISPERSION_MODE
      </div>
    </div>
  );
};
