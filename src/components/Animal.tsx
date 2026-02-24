import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import { useStore, CharacterType } from '../hooks/useStore';

export const Animal = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<Group>(null);
  const targetPos = useRef(new Vector3(...position));
  const currentPos = useRef(new Vector3(...position));
  
  // Randomly assign a character type to each NPC for variety
  const npcType = useMemo(() => {
    const types: CharacterType[] = ['steve', 'alex', 'robot', 'ninja', 'astronaut'];
    return types[Math.floor(Math.random() * types.length)];
  }, []);

  const colors = {
    steve: '#2196f3',
    alex: '#ff9800',
    robot: '#9e9e9e',
    ninja: '#212121',
    astronaut: '#eeeeee'
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newX = position[0] + (Math.random() - 0.5) * 40;
      const newZ = position[2] + (Math.random() - 0.5) * 40;
      targetPos.current.set(newX, position[1], newZ);
    }, 3000 + Math.random() * 7000);

    return () => clearInterval(interval);
  }, [position]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Move towards target
    const dir = new Vector3().subVectors(targetPos.current, currentPos.current);
    if (dir.length() > 0.1) {
      dir.normalize().multiplyScalar(2 * delta); // Slightly faster
      currentPos.current.add(dir);
      meshRef.current.position.copy(currentPos.current);

      // Rotate towards movement
      const angle = Math.atan2(dir.x, dir.z);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, angle, 0.1);
    }
    
    // Bobbing animation
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 5) * 0.05;
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.4]} />
        <meshStandardMaterial color={colors[npcType]} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color={colors[npcType]} />
      </mesh>
      {/* Arms */}
      <mesh position={[0.4, 0.5, 0]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={colors[npcType]} />
      </mesh>
      <mesh position={[-0.4, 0.5, 0]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={colors[npcType]} />
      </mesh>
      {/* Legs */}
      <mesh position={[0.15, 0.1, 0]}>
        <boxGeometry args={[0.25, 0.4, 0.25]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-0.15, 0.1, 0]}>
        <boxGeometry args={[0.25, 0.4, 0.25]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
};

import * as THREE from 'three';
