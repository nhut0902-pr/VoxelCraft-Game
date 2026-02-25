import { useStore } from '../hooks/useStore';
import { useMemo } from 'react';

export const Minimap = () => {
  const cubes = useStore((state) => state.cubes);
  const size = 40; // World size is 40x40

  const mapData = useMemo(() => {
    const data = Array.from({ length: 80 }, () => Array(80).fill(null));
    cubes.forEach(cube => {
      const x = Math.floor(cube.pos[0]) + 40;
      const z = Math.floor(cube.pos[2]) + 40;
      if (x >= 0 && x < 80 && z >= 0 && z < 80) {
        // Only store the highest block for the top-down view
        if (!data[x][z] || cube.pos[1] > data[x][z].y) {
          data[x][z] = { type: cube.type, y: cube.pos[1] };
        }
      }
    });
    return data;
  }, [cubes]);

  const blockColors: Record<string, string> = {
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

  return (
    <div className="fixed top-20 right-6 w-32 h-32 bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-2xl z-40 pointer-events-none">
      <div className="relative w-full h-full grid grid-cols-80 grid-rows-80">
        {mapData.map((row, x) => 
          row.map((cell, z) => (
            <div 
              key={`${x}-${z}`} 
              style={{ 
                backgroundColor: cell ? blockColors[cell.type] : 'transparent',
                opacity: cell ? 0.8 : 0
              }} 
            />
          ))
        )}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_white] animate-pulse" />
      </div>
    </div>
  );
};
