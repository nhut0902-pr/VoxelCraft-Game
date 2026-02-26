import { useFrame } from '@react-three/fiber';
import { useStore } from '../hooks/useStore';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

const Particle = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocity = useMemo(() => new THREE.Vector3(
    (Math.random() - 0.5) * 10,
    Math.random() * 10,
    (Math.random() - 0.5) * 10
  ), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.position.add(velocity.clone().multiplyScalar(delta));
    velocity.y -= 9.81 * delta; // Gravity
    meshRef.current.rotation.x += delta * 5;
    meshRef.current.rotation.z += delta * 5;
    
    // Fade out
    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.opacity -= delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial color="#ff4400" transparent />
    </mesh>
  );
};

export const Explosions = () => {
  const explosions = useStore((state) => state.explosions);

  return (
    <>
      {explosions.map((exp) => (
        <group key={exp.id}>
          {/* Flash effect */}
          <pointLight position={exp.pos} intensity={10} color="#ffaa00" distance={10} decay={2} />
          {/* Fragments */}
          {Array.from({ length: 20 }).map((_, i) => (
            <Particle key={`${exp.id}-${i}`} position={exp.pos} />
          ))}
        </group>
      ))}
    </>
  );
};
