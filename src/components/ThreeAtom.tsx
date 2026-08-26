/**
 * 3D 分子/原子装饰组件（修复类型错误版）
 */
"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Torus, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// 类型定义
interface NucleusProps {
  color: string;
  position: [number, number, number];
  size?: number;
  emissiveIntensity?: number;
}

interface OrbitRingProps {
  radius: number;
  color: string;
  speed: number;
  baseTilt: number;
  offset?: number;
}

interface ElectronProps {
  radius: number;
  speed: number;
  offset: number;
  color: string;
  trailLength?: number;
}

interface SatelliteProps {
  radius: number;
  speed: number;
  offset: number;
  color: string;
  size?: number;
}

// 原子核
function Nucleus({ color, position, size = 0.12, emissiveIntensity = 1.2 }: NucleusProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(1);
  useFrame((state) => {
    if (meshRef.current) {
      scaleRef.current = 1 + Math.sin(state.clock.getElapsedTime() * 1.5 + position[0]) * 0.03;
      meshRef.current.scale.set(scaleRef.current, scaleRef.current, scaleRef.current);
      meshRef.current.rotation.x += 0.001;
      meshRef.current.rotation.y += 0.002;
    }
  });
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.12}
          metalness={0.9}
          clearcoat={0.8}
          clearcoatRoughness={0.15}
          transparent
          opacity={0.98}
        />
      </Sphere>
    </group>
  );
}

// 轨道环
function OrbitRing({ radius, color, speed, baseTilt, offset = 0 }: OrbitRingProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const axisOffset = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const dynamicTilt = baseTilt + Math.sin(time * speed * 0.2 + offset) * 0.15;
      const rotX = Math.sin(time * speed * 0.3 + offset + axisOffset.current) * dynamicTilt;
      const rotZ = Math.cos(time * speed * 0.2 + offset * 0.7 + axisOffset.current) * dynamicTilt * 0.6;
      meshRef.current.rotation.x = rotX;
      meshRef.current.rotation.z = rotZ;
      meshRef.current.rotation.y += 0.008;
    }
  });

  return (
    <Torus ref={meshRef} args={[radius, 0.004, 8, 48]}>
      <meshPhysicalMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        transparent
        opacity={0.3}
        roughness={0.2}
        metalness={0.8}
      />
    </Torus>
  );
}

// ★ 电子：拖尾明显可见（使用 Points 和 BufferAttribute）
function Electron({ radius, speed, offset, color, trailLength = 60 }: ElectronProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);
  const positions = useRef(new Float32Array(trailLength * 3));
  const colors = useRef(new Float32Array(trailLength * 4)); // RGBA
  const index = useRef(0);
  const initialized = useRef(false);

  const initTrail = (x: number, y: number, z: number) => {
    const baseCol = new THREE.Color(color);
    for (let i = 0; i < trailLength; i++) {
      positions.current[i * 3] = x;
      positions.current[i * 3 + 1] = y;
      positions.current[i * 3 + 2] = z;
      const alpha = 1 - i / trailLength;
      colors.current[i * 4] = baseCol.r;
      colors.current[i * 4 + 1] = baseCol.g;
      colors.current[i * 4 + 2] = baseCol.b;
      colors.current[i * 4 + 3] = alpha * 0.9;
    }
    if (trailRef.current) {
      trailRef.current.geometry.attributes.position.needsUpdate = true;
      trailRef.current.geometry.attributes.color.needsUpdate = true;
    }
    initialized.current = true;
  };

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * speed + offset;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    const y = Math.sin(t * 0.8 + offset) * radius * 0.1;
    meshRef.current.position.set(x, y, z);

    if (!initialized.current) {
      initTrail(x, y, z);
    }

    // 更新拖尾：新点插入头部，其他后移
    const pos = positions.current;
    for (let i = trailLength - 1; i > 0; i--) {
      pos[i * 3] = pos[(i - 1) * 3];
      pos[i * 3 + 1] = pos[(i - 1) * 3 + 1];
      pos[i * 3 + 2] = pos[(i - 1) * 3 + 2];
    }
    pos[0] = x;
    pos[1] = y;
    pos[2] = z;

    // 更新颜色（渐变）
    const baseCol = new THREE.Color(color);
    const colArr = colors.current;
    for (let i = 0; i < trailLength; i++) {
      const alpha = 1 - i / trailLength;
      colArr[i * 4] = baseCol.r;
      colArr[i * 4 + 1] = baseCol.g;
      colArr[i * 4 + 2] = baseCol.b;
      colArr[i * 4 + 3] = alpha * 0.9;
    }

    if (trailRef.current) {
      trailRef.current.geometry.attributes.position.needsUpdate = true;
      trailRef.current.geometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    <>
      <Sphere ref={meshRef} args={[0.06, 12, 12]}>
        <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={6} roughness={0} metalness={0} />
      </Sphere>
      <Points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors.current, 4]} />
        </bufferGeometry>
        <PointMaterial
          size={0.15}
          vertexColors
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </Points>
    </>
  );
}

// 小卫星
function Satellite({ radius, speed, offset, color, size = 0.025 }: SatelliteProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime() * speed + offset;
      meshRef.current.position.x = Math.cos(t) * radius;
      meshRef.current.position.z = Math.sin(t) * radius;
      meshRef.current.position.y = Math.sin(t * 0.6 + offset) * radius * 0.15;
      meshRef.current.rotation.x += 0.02;
      meshRef.current.rotation.y += 0.03;
    }
  });
  return (
    <Sphere ref={meshRef} args={[size, 8, 8]}>
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.3} metalness={0.5} />
    </Sphere>
  );
}

// 粒子星云
function ParticleNebula() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1200;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const r = 0.8 + Math.random() * 3.2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    const hue = (i / count + 0.6) % 1;
    const c = new THREE.Color().setHSL(hue, 0.85, 0.65);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
    sizes[i] = 0.01 + Math.random() * 0.03;
    phases[i] = Math.random() * Math.PI * 2;
  }

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.004;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.002) * 0.05;
      const sizesAttr = pointsRef.current.geometry.attributes.size as THREE.BufferAttribute;
      if (sizesAttr) {
        const array = sizesAttr.array as Float32Array;
        for (let i = 0; i < count; i++) {
          const pulse = 0.7 + 0.3 * Math.sin(state.clock.getElapsedTime() * 0.3 + phases[i]);
          array[i] = (0.01 + Math.random() * 0.03) * pulse;
        }
        sizesAttr.needsUpdate = true;
      }
    }
  });

  return (
    <Points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <PointMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </Points>
  );
}

export default function ThreeAtom() {
  return (
    <div className="molecule-container h-full w-full overflow-hidden rounded-2xl">
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 20 }}
        className="h-full w-full"
        style={{ display: 'block', background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[1.2, 1.2, 2]} intensity={0.8} color="#7c5cff" />
        <pointLight position={[-1.2, -0.8, 2]} intensity={0.5} color="#38e1ff" />
        <pointLight position={[0, 0, 3]} intensity={0.2} color="#ff5c8a" />

        <Nucleus color="#7c5cff" position={[0, 0, 0]} size={0.12} emissiveIntensity={2.0} />
        <Nucleus color="#38e1ff" position={[0.6, 0.04, 0.3]} size={0.05} />
        <Nucleus color="#ff5c8a" position={[-0.45, -0.08, 0.4]} size={0.048} />
        <Nucleus color="#b4ff39" position={[0.04, 0.5, -0.3]} size={0.045} />
        <Nucleus color="#ff9f5c" position={[-0.35, 0.32, -0.4]} size={0.042} />
        <Nucleus color="#00ffcc" position={[0.4, -0.32, -0.15]} size={0.042} />
        <Nucleus color="#ff00ff" position={[-0.25, -0.38, 0.25]} size={0.04} />

        <OrbitRing radius={0.9} color="#38e1ff" speed={1.0} baseTilt={0.3} offset={0} />
        <OrbitRing radius={1.1} color="#ff5c8a" speed={0.7} baseTilt={0.5} offset={1.2} />
        <OrbitRing radius={1.3} color="#b4ff39" speed={0.5} baseTilt={0.7} offset={0.8} />
        <OrbitRing radius={1.5} color="#7c5cff" speed={0.4} baseTilt={0.9} offset={0.3} />

        <Electron radius={0.9} speed={1.5} offset={0} color="#38e1ff" trailLength={60} />
        <Electron radius={0.9} speed={1.5} offset={Math.PI} color="#38e1ff" trailLength={60} />
        <Electron radius={1.1} speed={1.0} offset={0.3} color="#ff5c8a" trailLength={60} />
        <Electron radius={1.1} speed={1.0} offset={Math.PI + 0.3} color="#ff5c8a" trailLength={60} />
        <Electron radius={1.3} speed={0.7} offset={0.7} color="#b4ff39" trailLength={60} />
        <Electron radius={1.3} speed={0.7} offset={Math.PI + 0.7} color="#b4ff39" trailLength={60} />
        <Electron radius={1.5} speed={0.5} offset={0.4} color="#7c5cff" trailLength={60} />
        <Electron radius={1.5} speed={0.5} offset={Math.PI + 0.4} color="#7c5cff" trailLength={60} />

        <Satellite radius={1.6} speed={0.3} offset={0} color="#38e1ff" size={0.025} />
        <Satellite radius={1.6} speed={0.3} offset={Math.PI * 0.7} color="#ff5c8a" size={0.025} />
        <Satellite radius={1.8} speed={0.25} offset={1.2} color="#b4ff39" size={0.02} />

        <ParticleNebula />

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          autoRotate
          autoRotateSpeed={0.15}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.25}
          minDistance={1.5}
          maxDistance={5}
          zoomSpeed={0.5}
        />
      </Canvas>

      
    </div>
  );
}