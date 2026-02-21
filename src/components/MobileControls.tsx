import { useStore } from '../hooks/useStore';
import { motion } from 'motion/react';
import { Hammer, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

export const MobileControls = () => {
  const { buildMode, setBuildMode, setMovement } = useStore();

  const handleTouchStart = (dir: 'forward' | 'backward' | 'left' | 'right') => {
    setMovement(dir, 1);
  };

  const handleTouchEnd = (dir: 'forward' | 'backward' | 'left' | 'right') => {
    setMovement(dir, 0);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 select-none z-40">
      {/* Top Right: Build Mode Toggle - Moved down and fixed pointer events */}
      <div className="flex justify-end mt-24">
        <button
          onClick={() => setBuildMode(buildMode === 'add' ? 'remove' : 'add')}
          className={`w-16 h-16 rounded-3xl flex items-center justify-center backdrop-blur-xl border-2 transition-all shadow-2xl active:scale-90 pointer-events-auto ${
            buildMode === 'add' 
              ? 'bg-emerald-500/40 border-emerald-400/50 text-emerald-100' 
              : 'bg-rose-500/40 border-rose-400/50 text-rose-100'
          }`}
        >
          {buildMode === 'add' ? <Hammer size={28} /> : <Trash2 size={28} />}
        </button>
      </div>

      <div className="flex justify-between items-end mb-12 sm:mb-20">
        {/* Bottom Left: Movement D-Pad */}
        <div className="pointer-events-auto relative w-32 h-32 sm:w-40 sm:h-40 bg-white/5 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center">
          <button
            onTouchStart={() => handleTouchStart('forward')}
            onTouchEnd={() => handleTouchEnd('forward')}
            className="absolute top-1 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center active:bg-white/30 transition-colors"
          >
            <ChevronUp size={20} color="white" />
          </button>
          <button
            onTouchStart={() => handleTouchStart('left')}
            onTouchEnd={() => handleTouchEnd('left')}
            className="absolute left-1 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center active:bg-white/30 transition-colors"
          >
            <ChevronLeft size={20} color="white" />
          </button>
          <div className="w-3 h-3 bg-white/20 rounded-full" />
          <button
            onTouchStart={() => handleTouchStart('right')}
            onTouchEnd={() => handleTouchEnd('right')}
            className="absolute right-1 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center active:bg-white/30 transition-colors"
          >
            <ChevronRight size={20} color="white" />
          </button>
          <button
            onTouchStart={() => handleTouchStart('backward')}
            onTouchEnd={() => handleTouchEnd('backward')}
            className="absolute bottom-1 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center active:bg-white/30 transition-colors"
          >
            <ChevronDown size={20} color="white" />
          </button>
        </div>

        {/* Bottom Right: Jump Button */}
        <div className="pointer-events-auto">
          <button
            className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-xl rounded-full flex flex-col items-center justify-center border-2 border-white/20 active:bg-white/30 active:scale-95 transition-all shadow-2xl group"
            onTouchStart={() => setMovement('jump', true)}
            onTouchEnd={() => setMovement('jump', false)}
          >
            <Zap size={28} className="text-yellow-400 mb-0.5 group-active:scale-110 transition-transform" />
            <span className="text-[8px] sm:text-[10px] font-black text-white tracking-widest uppercase">Jump</span>
          </button>
        </div>
      </div>
    </div>
  );
};
