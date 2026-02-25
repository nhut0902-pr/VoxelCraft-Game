import { useStore } from '../hooks/useStore';
import { useMemo, useRef, useEffect } from 'react';

export const Minimap = () => {
  const cubes = useStore((state) => state.cubes);
  const playerPos = useStore((state) => state.playerPos);
  const playerRotation = useStore((state) => state.playerRotation);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewSize = 20; // Show 20x20 blocks around player

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

    const canvasSize = 80;
    const scale = canvasSize / viewSize;

    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // Draw background (void)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Filter cubes within view distance
    const [px, , pz] = playerPos;
    
    // Map of highest blocks in view
    const data = new Map<string, { type: string, y: number }>();
    cubes.forEach(cube => {
      const dx = cube.pos[0] - px;
      const dz = cube.pos[2] - pz;
      
      if (Math.abs(dx) < viewSize / 2 && Math.abs(dz) < viewSize / 2) {
        const key = `${Math.floor(cube.pos[0])},${Math.floor(cube.pos[2])}`;
        const existing = data.get(key);
        if (!existing || cube.pos[1] > existing.y) {
          data.set(key, { type: cube.type, y: cube.pos[1] });
        }
      }
    });

    data.forEach((cell, key) => {
      const [cx, cz] = key.split(',').map(Number);
      const dx = cx - px;
      const dz = cz - pz;
      
      // Convert to canvas coordinates (center is canvasSize/2)
      const x = (dx + viewSize / 2) * scale;
      const z = (dz + viewSize / 2) * scale;
      
      ctx.fillStyle = blockColors[cell.type] || '#000';
      ctx.fillRect(x, z, scale, scale);
    });

    // Draw player arrow
    ctx.save();
    ctx.translate(canvasSize / 2, canvasSize / 2);
    ctx.rotate(-playerRotation[1]); // Rotate based on player Y rotation
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4, 4);
    ctx.lineTo(0, 2);
    ctx.lineTo(-4, 4);
    ctx.closePath();
    ctx.fill();
    
    // Glow effect for player
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'white';
    ctx.stroke();
    
    ctx.restore();

  }, [cubes, playerPos, playerRotation]);

  return (
    <div className="fixed top-24 right-6 w-32 h-32 bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-2xl z-40 pointer-events-none">
      <canvas 
        ref={canvasRef} 
        width={80} 
        height={80} 
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
      {/* Compass labels */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-black text-white/40">N</div>
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-black text-white/40">S</div>
      <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[8px] font-black text-white/40">W</div>
      <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] font-black text-white/40">E</div>
    </div>
  );
};
