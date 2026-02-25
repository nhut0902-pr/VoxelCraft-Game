import { nanoid } from 'nanoid';
import { Block, BlockType, MapType } from '../hooks/useStore';

export const generateWorld = (mapType: MapType): Block[] => {
  const cubes: Block[] = [];
  const size = 40; // Increased size from 20 to 40
  const baseHeight = 3;

  const getNoise = (x: number, z: number, scale: number, amplitude: number) => {
    return (Math.sin(x * scale) + Math.cos(z * scale)) * amplitude;
  };

  for (let x = -size; x < size; x++) {
    for (let z = -size; z < size; z++) {
      let height = baseHeight;
      let surfaceType: BlockType = 'grass';

      if (mapType === 'plains') {
        height += Math.floor(getNoise(x, z, 0.1, 2));
        surfaceType = 'grass';
      } else if (mapType === 'desert') {
        height += Math.floor(getNoise(x, z, 0.05, 4));
        surfaceType = 'sand';
      } else if (mapType === 'forest') {
        height += Math.floor(getNoise(x, z, 0.15, 3));
        surfaceType = 'dirt';
      }

      // Generate layers for digging
      for (let y = -2; y <= height; y++) {
        let type: BlockType = 'cobblestone'; // Underground
        if (y === height) {
          type = surfaceType;
        } else if (y > height - 2) {
          type = mapType === 'desert' ? 'sand' : 'dirt';
        }

        cubes.push({ id: nanoid(), pos: [x, y, z], type });
      }

      // Random features on surface
      if (mapType === 'plains' && Math.random() > 0.99) {
        generateTree(cubes, x, height + 1, z);
      } else if (mapType === 'forest' && Math.random() > 0.95) {
        generateTree(cubes, x, height + 1, z);
      } else if (mapType === 'desert' && Math.random() > 0.995) {
        // Cactus placeholder (just a log)
        cubes.push({ id: nanoid(), pos: [x, height + 1, z], type: 'log' });
        cubes.push({ id: nanoid(), pos: [x, height + 2, z], type: 'log' });
      }

      // Random TNT
      if (Math.random() > 0.999) {
        cubes.push({ id: nanoid(), pos: [x, height + 1, z], type: 'tnt' });
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

export const generateHouse = (cubes: Block[], x: number, y: number, z: number) => {
  const width = 5;
  const height = 4;
  const depth = 5;

  // Floor
  for (let dx = 0; dx < width; dx++) {
    for (let dz = 0; dz < depth; dz++) {
      cubes.push({ id: nanoid(), pos: [x + dx, y - 1, z + dz], type: 'wood' });
    }
  }

  // Walls
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      for (let dz = 0; dz < depth; dz++) {
        const isEdge = dx === 0 || dx === width - 1 || dz === 0 || dz === depth - 1;
        if (isEdge) {
          // Door
          if (dx === Math.floor(width / 2) && dz === 0 && dy < 2) continue;
          
          // Windows
          if (dy === 1 && ((dx === 0 || dx === width - 1) && dz === Math.floor(depth / 2))) {
            cubes.push({ id: nanoid(), pos: [x + dx, y + dy, z + dz], type: 'glass' });
            continue;
          }

          cubes.push({ id: nanoid(), pos: [x + dx, y + dy, z + dz], type: 'brick' });
        }
      }
    }
  }

  // Roof
  for (let dy = 0; dy < 3; dy++) {
    for (let dx = -1 + dy; dx < width + 1 - dy; dx++) {
      for (let dz = -1 + dy; dz < depth + 1 - dy; dz++) {
        cubes.push({ id: nanoid(), pos: [x + dx, y + height + dy, z + dz], type: 'wood' });
      }
    }
  }
};
