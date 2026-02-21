import { create } from 'zustand';
import { nanoid } from 'nanoid';

export type BlockType = 'grass' | 'dirt' | 'log' | 'glass' | 'wood' | 'cobblestone';

export interface Block {
  id: string;
  pos: [number, number, number];
  type: BlockType;
}

interface GameState {
  texture: BlockType;
  cubes: Block[];
  buildMode: 'add' | 'remove';
  movement: { forward: number; backward: number; left: number; right: number; jump: boolean };
  playerScale: number;
  addCube: (x: number, y: number, z: number) => void;
  removeCube: (x: number, y: number, z: number) => void;
  setTexture: (texture: BlockType) => void;
  setBuildMode: (mode: 'add' | 'remove') => void;
  setMovement: (direction: keyof GameState['movement'], value: number | boolean) => void;
  setPlayerScale: (scale: number) => void;
  saveWorld: () => void;
  resetWorld: () => void;
}

const getLocalStorage = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setLocalStorage = (key: string, value: any) => localStorage.setItem(key, JSON.stringify(value));

export const useStore = create<GameState>((set) => ({
  texture: 'dirt',
  cubes: getLocalStorage('cubes') || [],
  buildMode: 'add',
  movement: { forward: 0, backward: 0, left: 0, right: 0, jump: false },
  playerScale: 1,
  addCube: (x, y, z) => {
    set((state) => ({
      cubes: [
        ...state.cubes,
        {
          id: nanoid(),
          pos: [x, y, z],
          type: state.texture,
        },
      ],
    }));
  },
  removeCube: (x, y, z) => {
    set((state) => ({
      cubes: state.cubes.filter((cube) => {
        const [cx, cy, cz] = cube.pos;
        return cx !== x || cy !== y || cz !== z;
      }),
    }));
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
  saveWorld: () => {
    set((state) => {
      setLocalStorage('cubes', state.cubes);
      return state;
    });
  },
  resetWorld: () => {
    set(() => ({
      cubes: [],
    }));
  },
}));
