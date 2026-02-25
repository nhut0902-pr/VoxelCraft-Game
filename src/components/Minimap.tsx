import { useStore } from '../hooks/useStore';
import { useMemo, useRef, useEffect } from 'react';

export const Minimap = () => {
  const cubes = useStore((state) => state.cubes);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 40; 

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 80, 80);
    
    // Create a map of the highest blocks
    const data = new Map<string, { type: string, y: number }>();
    cubes.forEach(cube => {
      const x = Math.floor(cube.pos[0]) + 40;
      const z = Math.floor(cube.pos[2]) + 40;
      const key = `${x},${z}`;
      const existing = data.get(key);
      if (!existing || cube.pos[1] > existing.y) {
        data.set(key, { type: cube.type, y: cube.pos[1] });
      }
    });

    data.forEach((cell, key) => {
      const [x, z] = key.split(',').map(Number);
      ctx.fillStyle = blockColors[cell.type] || '#000';
      ctx.fillRect(x, z, 1, 1);
    });
  }, [cubes]);

  return (
    <div className="fixed top-24 right-6 w-32 h-32 bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-2xl z-40 pointer-events-none">
      <canvas 
        ref={canvasRef} 
        width={80} 
        height={80} 
        className="w-full h-full image-render-pixelated"
        style={{ imageRendering: 'pixelated' }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_white] animate-pulse" />
      </div>
    </div>
  );
};
