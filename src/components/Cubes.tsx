import { useStore, BlockType } from '../hooks/useStore';
import { Animal } from './Animal';
import { useRef, useMemo, useEffect } from 'react';
import { InstancedMesh, Object3D, Color } from 'three';
import { useFrame } from '@react-three/fiber';
import { useSounds } from '../hooks/useSounds';

const blockColors: Record<BlockType, string> = {
  dirt: '#5d4037',
  grass: '#4caf50',
  glass: '#e1f5fe',
  wood: '#795548',
  log: '#3e2723',
  cobblestone: '#616161',
  water: '#0288d1',
  leaf: '#2e7d32',
  sand: '#fbc02d',
  brick: '#d32f2f',
  tnt: '#ff0000',
};

const tempObject = new Object3D();
const tempColor = new Color();

export const Cubes = () => {
  const cubes = useStore((state) => state.cubes);
  const addCube = useStore((state) => state.addCube);
  const removeCube = useStore((state) => state.removeCube);
  const buildMode = useStore((state) => state.buildMode);
  const npcCount = useStore((state) => state.npcCount);
  const { playSound } = useSounds();
  
  // Generate random positions for NPCs
  const npcPositions = useMemo(() => {
    return Array.from({ length: npcCount }).map(() => [
      (Math.random() - 0.5) * 30,
      0,
      (Math.random() - 0.5) * 30
    ] as [number, number, number]);
  }, [npcCount]);

  // Group cubes by type for instancing
  const cubesByType = useMemo(() => {
    const groups: Record<string, typeof cubes> = {};
    cubes.forEach(cube => {
      if (!groups[cube.type]) groups[cube.type] = [];
      groups[cube.type].push(cube);
    });
    return groups;
  }, [cubes]);

  return (
    <>
      {Object.entries(cubesByType).map(([type, typeCubes]) => (
        <InstancedCubes 
          key={type}
          type={type as BlockType}
          cubes={typeCubes}
          addCube={addCube}
          removeCube={removeCube}
          buildMode={buildMode}
          playSound={playSound}
        />
      ))}
      {npcPositions.map((pos, i) => (
        <Animal key={i} position={pos} />
      ))}
    </>
  );
};

const InstancedCubes = ({ type, cubes, addCube, removeCube, buildMode, playSound }: any) => {
  const meshRef = useRef<InstancedMesh>(null);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    cubes.forEach((cube: any, i: number) => {
      tempObject.position.set(cube.pos[0], cube.pos[1], cube.pos[2]);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
      
      tempColor.set(blockColors[type as BlockType]);
      meshRef.current!.setColorAt(i, tempColor);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [cubes, type]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, cubes.length]}
      onClick={(e) => {
        e.stopPropagation();
        const instanceId = e.instanceId;
        if (instanceId === undefined) return;
        
        const cube = cubes[instanceId];
        const clickedFace = Math.floor(e.faceIndex! / 2);
        const isTouch = (e.nativeEvent as any).pointerType === 'touch';

        if (e.button === 0 || isTouch) {
          if (e.altKey || buildMode === 'remove') {
            removeCube(cube.pos[0], cube.pos[1], cube.pos[2]);
            playSound('break');
            return;
          }

          const [cx, cy, cz] = cube.pos;
          if (clickedFace === 0) addCube(cx + 1, cy, cz);
          else if (clickedFace === 1) addCube(cx - 1, cy, cz);
          else if (clickedFace === 2) addCube(cx, cy + 1, cz);
          else if (clickedFace === 3) addCube(cx, cy - 1, cz);
          else if (clickedFace === 4) addCube(cx, cy, cz + 1);
          else if (clickedFace === 5) addCube(cx, cy, cz - 1);
          
          playSound('place');
        }
      }}
    >
      <boxGeometry />
      <meshStandardMaterial 
        transparent={type === 'glass' || type === 'water'}
        opacity={type === 'glass' ? 0.4 : type === 'water' ? 0.6 : 1}
        roughness={type === 'glass' || type === 'water' ? 0.1 : 0.8}
        metalness={type === 'glass' || type === 'water' ? 0.5 : 0.1}
      />
    </instancedMesh>
  );
};
