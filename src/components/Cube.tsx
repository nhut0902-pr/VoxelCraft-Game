import { useStore, BlockType } from '../hooks/useStore';
import { useState } from 'react';
import { Edges } from '@react-three/drei';

const blockColors: Record<BlockType, string> = {
  dirt: '#5d4037',
  grass: '#4caf50',
  glass: '#e1f5fe',
  wood: '#795548',
  log: '#3e2723',
  cobblestone: '#616161',
};

export const Cube = ({ position, type }: { position: [number, number, number], type: BlockType }) => {
  const [hover, setHover] = useState<number | null>(null);
  const addCube = useStore((state) => state.addCube);
  const removeCube = useStore((state) => state.removeCube);
  const buildMode = useStore((state) => state.buildMode);

  return (
    <mesh
      position={position}
      onPointerMove={(e) => {
        e.stopPropagation();
        setHover(Math.floor(e.faceIndex! / 2));
      }}
      onPointerOut={() => {
        setHover(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        const clickedFace = Math.floor(e.faceIndex! / 2);
        const isTouch = (e.nativeEvent as any).pointerType === 'touch';

        if (e.button === 0 || isTouch) { 
            if (e.altKey || buildMode === 'remove') {
                removeCube(position[0], position[1], position[2]);
                return;
            }
            
            const [cx, cy, cz] = position;
            if (clickedFace === 0) addCube(cx + 1, cy, cz);
            else if (clickedFace === 1) addCube(cx - 1, cy, cz);
            else if (clickedFace === 2) addCube(cx, cy + 1, cz);
            else if (clickedFace === 3) addCube(cx, cy - 1, cz);
            else if (clickedFace === 4) addCube(cx, cy, cz + 1);
            else if (clickedFace === 5) addCube(cx, cy, cz - 1);
        }
      }}
    >
      <boxGeometry />
      <meshStandardMaterial
        color={hover !== null ? '#ffffff' : blockColors[type]}
        transparent={type === 'glass'}
        opacity={type === 'glass' ? 0.4 : 1}
        roughness={type === 'glass' ? 0.1 : 0.8}
        metalness={type === 'glass' ? 0.5 : 0.1}
      />
      <Edges
        threshold={15}
        color={type === 'glass' ? '#ffffff' : '#000000'}
        scale={1}
        renderOrder={1}
      />
    </mesh>
  );
};
