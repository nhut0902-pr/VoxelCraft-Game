import { nanoid } from 'nanoid';
import { Block, BlockType, MapType } from '../hooks/useStore';

export const generateWorld = (mapType: MapType): Block[] => {
  const cubes: Block[] = [];
  const size = 20;

  if (mapType === 'plains') {
    // Flat grass with some trees
    for (let x = -size; x < size; x++) {
      for (let z = -size; z < size; z++) {
        cubes.push({ id: nanoid(), pos: [x, 0, z], type: 'grass' });
        
        // Random trees
        if (Math.random() > 0.98) {
          generateTree(cubes, x, 1, z);
        }
      }
    }
  } else if (mapType === 'desert') {
    // Sand with some water pools
    for (let x = -size; x < size; x++) {
      for (let z = -size; z < size; z++) {
        const isWater = Math.sin(x * 0.5) * Math.cos(z * 0.5) > 0.7;
        cubes.push({ id: nanoid(), pos: [x, 0, z], type: isWater ? 'water' : 'sand' });
      }
    }
  } else if (mapType === 'forest') {
    // Dense trees and dirt
    for (let x = -size; x < size; x++) {
      for (let z = -size; z < size; z++) {
        cubes.push({ id: nanoid(), pos: [x, 0, z], type: 'dirt' });
        if (Math.random() > 0.9) {
          generateTree(cubes, x, 1, z);
        }
      }
    }
  }

  return cubes;
};

const generateTree = (cubes: Block[], x: number, y: number, z: number) => {
  // Trunk
  for (let i = 0; i < 3; i++) {
    cubes.push({ id: nanoid(), pos: [x, y + i, z], type: 'log' });
  }
  // Leaves
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      for (let dy = 0; dy <= 1; dy++) {
        if (dx === 0 && dz === 0 && dy === 0) continue;
        cubes.push({ id: nanoid(), pos: [x + dx, y + 3 + dy, z + dz], type: 'leaf' });
      }
    }
  }
};
