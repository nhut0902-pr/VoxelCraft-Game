import { useStore } from '../hooks/useStore';
import { useSounds } from '../hooks/useSounds';

export const Ground = () => {
  const addCube = useStore((state) => state.addCube);
  const buildMode = useStore((state) => state.buildMode);
  const { playSound } = useSounds();

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -2.5, 0]} // Lowered to be below the generated terrain
      onClick={(e) => {
        e.stopPropagation();
        if (buildMode === 'remove') return;
        const { x, y, z } = e.point;
        // When clicking the bedrock, place a block on top of it
        addCube(Math.round(x), -2, Math.round(z));
        playSound('place');
      }}
    >
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial color="#222" />
    </mesh>
  );
};
