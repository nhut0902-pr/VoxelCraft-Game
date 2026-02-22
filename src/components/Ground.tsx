import { useStore } from '../hooks/useStore';

export const Ground = () => {
  const addCube = useStore((state) => state.addCube);
  const buildMode = useStore((state) => state.buildMode);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.5, 0]}
      onClick={(e) => {
        e.stopPropagation();
        if (buildMode === 'remove') return;
        const { x, y, z } = e.point;
        addCube(Math.round(x), Math.round(y), Math.round(z));
      }}
    >
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial color="#4a7a39" />
    </mesh>
  );
};
