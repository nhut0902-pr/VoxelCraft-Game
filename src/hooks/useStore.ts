import { create } from 'zustand';
import { nanoid } from 'nanoid';

export type BlockType = 'grass' | 'dirt' | 'log' | 'glass' | 'wood' | 'cobblestone' | 'water' | 'leaf' | 'sand' | 'brick';
export type ControlType = 'dpad' | 'joystick';
export type MapType = 'plains' | 'desert' | 'forest';

export interface Block {
  id: string;
  pos: [number, number, number];
  type: BlockType;
}

interface ControlSettings {
  type: ControlType;
  leftPos: { x: number, y: number };
  rightPos: { x: number, y: number };
}

interface GameState {
  texture: BlockType;
  cubes: Block[];
  inventory: Record<BlockType, number>;
  mapType: MapType;
  buildMode: 'add' | 'remove';
  movement: { forward: number; backward: number; left: number; right: number; jump: boolean };
  playerScale: number;
  controlSettings: ControlSettings;
  addCube: (x: number, y: number, z: number) => void;
  removeCube: (x: number, y: number, z: number) => void;
  setTexture: (texture: BlockType) => void;
  setBuildMode: (mode: 'add' | 'remove') => void;
  setMovement: (direction: keyof GameState['movement'], value: number | boolean) => void;
  setPlayerScale: (scale: number) => void;
  setControlSettings: (settings: Partial<ControlSettings>) => void;
  setMapType: (map: MapType) => void;
  saveWorld: () => void;
  resetWorld: () => void;
}

const getLocalStorage = (key: string) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};
const setLocalStorage = (key: string, value: any) => localStorage.setItem(key, JSON.stringify(value));

const INITIAL_INVENTORY: Record<BlockType, number> = {
  grass: 20, dirt: 20, log: 10, glass: 10, wood: 15, cobblestone: 15, water: 5, leaf: 10, sand: 10, brick: 10
};

export const useStore = create<GameState>((set) => ({
  texture: 'dirt',
  cubes: getLocalStorage('cubes') || [],
  inventory: getLocalStorage('inventory') || INITIAL_INVENTORY,
  mapType: getLocalStorage('mapType') || 'plains',
  buildMode: 'add',
  movement: { forward: 0, backward: 0, left: 0, right: 0, jump: false },
  playerScale: 1,
  controlSettings: getLocalStorage('controlSettings') || {
    type: 'dpad',
    leftPos: { x: 20, y: 40 },
    rightPos: { x: 20, y: 40 },
  },
  addCube: (x, y, z) => {
    set((state) => {
      if (state.inventory[state.texture] <= 0) return state;
      
      const newInventory = { 
        ...state.inventory, 
        [state.texture]: state.inventory[state.texture] - 1 
      };
      setLocalStorage('inventory', newInventory);

      return {
        inventory: newInventory,
        cubes: [
          ...state.cubes,
          {
            id: nanoid(),
            pos: [x, y, z],
            type: state.texture,
          },
        ],
      };
    });
  },
  removeCube: (x, y, z) => {
    set((state) => {
      const cubeToRemove = state.cubes.find(c => c.pos[0] === x && c.pos[1] === y && c.pos[2] === z);
      if (!cubeToRemove) return state;

      const newInventory = { 
        ...state.inventory, 
        [cubeToRemove.type]: state.inventory[cubeToRemove.type] + 1 
      };
      setLocalStorage('inventory', newInventory);

      return {
        inventory: newInventory,
        cubes: state.cubes.filter((cube) => {
          const [cx, cy, cz] = cube.pos;
          return cx !== x || cy !== y || cz !== z;
        }),
      };
    });
  },
  setTexture: (texture) => {
    set(() => ({
      texture,
    }));
  },
  setBuildMode: (mode) => {
    set(() => ({ buildMode: mode }));
  },
  setMovement: (direction, value) => {
    set((state) => ({
      movement: { ...state.movement, [direction]: value },
    }));
  },
  setPlayerScale: (scale) => {
    set(() => ({ playerScale: scale }));
  },
  setControlSettings: (settings) => {
    set((state) => {
      const newSettings = { ...state.controlSettings, ...settings };
      setLocalStorage('controlSettings', newSettings);
      return { controlSettings: newSettings };
    });
  },
  setMapType: (map) => {
    set(() => {
      setLocalStorage('mapType', map);
      return { mapType: map };
    });
  },
  saveWorld: () => {
    set((state) => {
      setLocalStorage('cubes', state.cubes);
      setLocalStorage('inventory', state.inventory);
      return state;
    });
  },
  resetWorld: () => {
    set(() => ({
      cubes: [],
      inventory: INITIAL_INVENTORY,
    }));
  },
}));
