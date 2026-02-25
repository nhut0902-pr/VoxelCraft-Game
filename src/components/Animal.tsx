import { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import { useStore, CharacterType } from '../hooks/useStore';
import { Html } from '@react-three/drei';

export const Animal = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<Group>(null);
  const targetPos = useRef(new Vector3(...position));
  const currentPos = useRef(new Vector3(...position));
  
  // Randomly assign a character type to each NPC for variety
  const npcType = useMemo(() => {
    const types: CharacterType[] = ['steve', 'alex', 'robot', 'ninja', 'astronaut'];
    return types[Math.floor(Math.random() * types.length)];
  }, []);

  const npcName = useMemo(() => {
    const names = ['Miner Tom', 'Builder Bob', 'Explorer Sam', 'Farmer Joe', 'Crafty Sue'];
    return names[Math.floor(Math.random() * names.length)];
  }, []);

  const [chat, setChat] = useState('');

  useEffect(() => {
    const chatInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const messages = ['Hello!', 'Nice day!', 'Building something?', 'Watch out for TNT!', 'I love this world.'];
        setChat(messages[Math.floor(Math.random() * messages.length)]);
        setTimeout(() => setChat(''), 3000);
      }
    }, 10000);
    return () => clearInterval(chatInterval);
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

  const [isClose, setIsClose] = useState(false);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const distToPlayer = currentPos.current.distanceTo(state.camera.position);
    const isVisible = distToPlayer < 35;
    const closeEnough = distToPlayer < 12;

    if (isClose !== closeEnough) setIsClose(closeEnough);

    const { weather } = useStore.getState();
    const weatherSpeedFactor = weather === 'clear' ? 1 : weather === 'rain' ? 0.6 : 0.3;
    
    // Move towards target
    const dir = new Vector3().subVectors(targetPos.current, currentPos.current);
    if (dir.length() > 0.1) {
      dir.normalize().multiplyScalar(2 * delta * weatherSpeedFactor); 
      currentPos.current.add(dir);
      meshRef.current.position.copy(currentPos.current);

      // Rotate towards movement
      const angle = Math.atan2(dir.x, dir.z);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, angle, 0.1);
    }
    
    // Bobbing animation
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 5 * weatherSpeedFactor) * 0.05;
    
    meshRef.current.visible = isVisible;
  });

  return (
    <group ref={meshRef} position={position}>
      {(isClose || chat) && (
        <Html position={[0, 1.6, 0]} center distanceFactor={10}>
          <div className="flex flex-col items-center gap-1 pointer-events-none">
            {chat && (
              <div className="bg-white text-slate-900 px-2 py-1 rounded-lg text-[8px] font-bold shadow-lg animate-bounce whitespace-nowrap">
                {chat}
              </div>
            )}
            <div className="bg-black/60 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter whitespace-nowrap border border-white/20">
              {npcName}
            </div>
          </div>
        </Html>
      )}
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
