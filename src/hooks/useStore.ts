import { create } from 'zustand';
import { nanoid } from 'nanoid';

export type BlockType = 'grass' | 'dirt' | 'log' | 'glass' | 'wood' | 'cobblestone' | 'water' | 'leaf' | 'sand' | 'brick' | 'tnt';
export type ControlType = 'dpad' | 'joystick';
export type MapType = 'plains' | 'desert' | 'forest';
export type WeatherType = 'clear' | 'rain' | 'storm';
export type CharacterType = 'steve' | 'alex' | 'robot' | 'ninja' | 'astronaut';

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

export interface Achievement {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface GameState {
  texture: BlockType;
  cubes: Block[];
  inventory: Record<BlockType, number>;
  mapType: MapType;
  buildMode: 'add' | 'remove';
  movement: { forward: number; backward: number; left: number; right: number; jump: boolean };
  playerScale: number;
  cameraMode: 'first-person' | 'orbit';
  weather: WeatherType;
  character: CharacterType;
  npcCount: number;
  coins: number;
  health: number;
  hunger: number;
  gameTime: number;
  playerPos: [number, number, number];
  playerRotation: [number, number, number];
  achievements: Achievement[];
  unlockedCharacters: CharacterType[];
  controlSettings: ControlSettings;
  addCube: (x: number, y: number, z: number) => void;
  removeCube: (x: number, y: number, z: number) => void;
  explodeTNT: (x: number, y: number, z: number) => void;
  setTexture: (texture: BlockType) => void;
  setBuildMode: (mode: 'add' | 'remove') => void;
  setMovement: (direction: keyof GameState['movement'], value: number | boolean) => void;
  setPlayerScale: (scale: number) => void;
  setCameraMode: (mode: 'first-person' | 'orbit') => void;
  setWeather: (weather: WeatherType) => void;
  setCharacter: (character: CharacterType) => void;
  setNPCCount: (count: number) => void;
  addCoins: (amount: number) => void;
  updateStats: (healthDelta: number, hungerDelta: number) => void;
  setGameTime: (time: number) => void;
  setPlayerPos: (pos: [number, number, number]) => void;
  setPlayerRotation: (rotation: [number, number, number]) => void;
  unlockCharacter: (character: CharacterType) => void;
  checkAchievements: () => void;
  setControlSettings: (settings: Partial<ControlSettings>) => void;
  setMapType: (map: MapType) => void;
  saveWorld: () => void;
  resetWorld: () => void;
}

const INITIAL_INVENTORY: Record<BlockType, number> = {
  grass: 999, dirt: 999, log: 999, glass: 999, wood: 999, cobblestone: 999, water: 999, leaf: 999, sand: 999, brick: 999, tnt: 999
};

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_block', title: 'Thợ xây tập sự', description: 'Đặt khối đầu tiên của bạn', completed: false },
  { id: 'big_spender', title: 'Đại gia Voxel', description: 'Sở hữu trên 500 Xu', completed: false },
  { id: 'explorer', title: 'Nhà thám hiểm', description: 'Đặt trên 100 khối', completed: false },
];

const getLocalStorage = (key: string) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};
const setLocalStorage = (key: string, value: any) => localStorage.setItem(key, JSON.stringify(value));

export const useStore = create<GameState>((set) => ({
  texture: 'dirt',
  cubes: getLocalStorage('cubes') || [],
  inventory: getLocalStorage('inventory') || INITIAL_INVENTORY,
  mapType: getLocalStorage('mapType') || 'plains',
  buildMode: 'add',
  movement: { forward: 0, backward: 0, left: 0, right: 0, jump: false },
  playerScale: 1,
  cameraMode: 'first-person',
  weather: 'clear',
  character: getLocalStorage('character') || 'steve',
  npcCount: getLocalStorage('npcCount') || 3,
  coins: getLocalStorage('coins') || 100,
  health: 100,
  hunger: 100,
  gameTime: 0,
  playerPos: [0, 0, 0],
  playerRotation: [0, 0, 0],
  achievements: getLocalStorage('achievements') || INITIAL_ACHIEVEMENTS,
  unlockedCharacters: getLocalStorage('unlockedCharacters') || ['steve', 'alex'],
  controlSettings: getLocalStorage('controlSettings') || {
    type: 'dpad',
    leftPos: { x: 20, y: 40 },
    rightPos: { x: 20, y: 40 },
  },
  addCube: (x, y, z) => {
    let isTNT = false;
    set((state) => {
      // Prevent overlapping
      const exists = state.cubes.some(c => c.pos[0] === x && c.pos[1] === y && c.pos[2] === z);
      if (exists) return state;

      isTNT = state.texture === 'tnt';

      const newInventory = { 
        ...state.inventory, 
        [state.texture]: state.inventory[state.texture] // Keep it infinite
      };
      // setLocalStorage('inventory', newInventory); // No need to save inventory if infinite

      // Reward coins
      const newCoins = state.coins + 2;
      setLocalStorage('coins', newCoins);

      const newCubes: Block[] = [
        ...state.cubes,
        {
          id: nanoid(),
          pos: [x, y, z] as [number, number, number],
          type: state.texture,
        },
      ];

      return {
        inventory: newInventory,
        coins: newCoins,
        cubes: newCubes,
      };
    });

    if (isTNT) {
      setTimeout(() => {
        useStore.getState().explodeTNT(x, y, z);
      }, 3000);
    }

    useStore.getState().checkAchievements();
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
  explodeTNT: (x, y, z) => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2565/2565-preview.mp3');
    audio.volume = 0.6;
    audio.play().catch(() => {});
    set((state) => {
      const radius = 3;
      const newCubes = state.cubes.filter(cube => {
        const [cx, cy, cz] = cube.pos;
        const dist = Math.sqrt((cx - x) ** 2 + (cy - y) ** 2 + (cz - z) ** 2);
        return dist > radius;
      });
      return { cubes: newCubes };
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
  setCameraMode: (mode) => {
    set(() => ({ cameraMode: mode }));
  },
  setWeather: (weather) => {
    set(() => ({ weather }));
  },
  setCharacter: (character) => {
    set(() => {
      setLocalStorage('character', character);
      return { character };
    });
  },
  setNPCCount: (count) => {
    set(() => {
      setLocalStorage('npcCount', count);
      return { npcCount: count };
    });
  },
  addCoins: (amount) => {
    set((state) => {
      const newCoins = state.coins + amount;
      setLocalStorage('coins', newCoins);
      return { coins: newCoins };
    });
    useStore.getState().checkAchievements();
  },
  updateStats: (healthDelta, hungerDelta) => {
    set((state) => ({
      health: Math.max(0, Math.min(100, state.health + healthDelta)),
      hunger: Math.max(0, Math.min(100, state.hunger + hungerDelta)),
    }));
  },
  setGameTime: (time) => set({ gameTime: time }),
  setPlayerPos: (pos) => set({ playerPos: pos }),
  setPlayerRotation: (rotation) => set({ playerRotation: rotation }),
  unlockCharacter: (character) => {
    set((state) => {
      if (state.unlockedCharacters.includes(character)) return state;
      const newUnlocked = [...state.unlockedCharacters, character];
      setLocalStorage('unlockedCharacters', newUnlocked);
      return { unlockedCharacters: newUnlocked };
    });
  },
  checkAchievements: () => {
    set((state) => {
      const newAchievements = state.achievements.map(ach => {
        if (ach.completed) return ach;
        if (ach.id === 'first_block' && state.cubes.length > 0) return { ...ach, completed: true };
        if (ach.id === 'big_spender' && state.coins >= 500) return { ...ach, completed: true };
        if (ach.id === 'explorer' && state.cubes.length >= 100) return { ...ach, completed: true };
        return ach;
      });
      setLocalStorage('achievements', newAchievements);
      return { achievements: newAchievements };
    });
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
