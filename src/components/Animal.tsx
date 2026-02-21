import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Euler, Group } from 'three';

export const Animal = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<Group>(null);
  const [targetPos, setTargetPos] = useState(new Vector3(...position));
  const [currentPos, setCurrentPos] = useState(new Vector3(...position));
  const [rotation, setRotation] = useState(new Euler(0, 0, 0));

  useEffect(() => {
    const interval = setInterval(() => {
      const newX = position[0] + (Math.random() - 0.5) * 20;
      const newZ = position[2] + (Math.random() - 0.5) * 20;
      setTargetPos(new Vector3(newX, position[1], newZ));
    }, 5000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, [position]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Move towards target
    const dir = new Vector3().subVectors(targetPos, currentPos);
    if (dir.length() > 0.1) {
      dir.normalize().multiplyScalar(1 * delta);
      const nextPos = currentPos.clone().add(dir);
      setCurrentPos(nextPos);
      meshRef.current.position.copy(nextPos);

      // Rotate towards movement
      const angle = Math.atan2(dir.x, dir.z);
      meshRef.current.rotation.y = angle;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.8, 0.6, 1.2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.8, 0.7]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Legs */}
      <mesh position={[0.3, 0.1, 0.4]}>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.3, 0.1, 0.4]}>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.3, 0.1, -0.4]}>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.3, 0.1, -0.4]}>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
};
