import { useStore } from '../hooks/useStore';
import { motion } from 'motion/react';
import { Hammer, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { Joystick } from './Joystick';

export const MobileControls = () => {
  const { buildMode, setBuildMode, setMovement, controlSettings } = useStore();

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

      <div className="flex justify-between items-end" style={{ marginBottom: `${controlSettings.leftPos.y}px` }}>
        {/* Bottom Left: Movement Control */}
        <div className="pointer-events-auto ml-2">
          {controlSettings.type === 'dpad' ? (
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 bg-white/5 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center">
              <button
                onTouchStart={() => handleTouchStart('forward')}
                onTouchEnd={() => handleTouchEnd('forward')}
                className="absolute top-0.5 w-9 h-9 sm:w-11 sm:h-11 bg-white/10 rounded-xl flex items-center justify-center active:bg-white/30 transition-colors"
              >
                <ChevronUp size={18} color="white" />
              </button>
              <button
                onTouchStart={() => handleTouchStart('left')}
                onTouchEnd={() => handleTouchEnd('left')}
                className="absolute left-0.5 w-9 h-9 sm:w-11 sm:h-11 bg-white/10 rounded-xl flex items-center justify-center active:bg-white/30 transition-colors"
              >
                <ChevronLeft size={18} color="white" />
              </button>
              <div className="w-2 h-2 bg-white/20 rounded-full" />
              <button
                onTouchStart={() => handleTouchStart('right')}
                onTouchEnd={() => handleTouchEnd('right')}
                className="absolute right-0.5 w-9 h-9 sm:w-11 sm:h-11 bg-white/10 rounded-xl flex items-center justify-center active:bg-white/30 transition-colors"
              >
                <ChevronRight size={18} color="white" />
              </button>
              <button
                onTouchStart={() => handleTouchStart('backward')}
                onTouchEnd={() => handleTouchEnd('backward')}
                className="absolute bottom-0.5 w-9 h-9 sm:w-11 sm:h-11 bg-white/10 rounded-xl flex items-center justify-center active:bg-white/30 transition-colors"
              >
                <ChevronDown size={18} color="white" />
              </button>
            </div>
          ) : (
            <Joystick />
          )}
        </div>

        {/* Bottom Right: Jump Button */}
        <div className="pointer-events-auto mr-2" style={{ marginBottom: `${controlSettings.rightPos.y - controlSettings.leftPos.y}px` }}>
          <button
            className="w-18 h-18 sm:w-22 sm:h-22 bg-white/10 backdrop-blur-xl rounded-full flex flex-col items-center justify-center border-2 border-white/20 active:bg-white/30 active:scale-95 transition-all shadow-2xl group"
            onTouchStart={() => setMovement('jump', true)}
            onTouchEnd={() => setMovement('jump', false)}
          >
            <Zap size={24} className="text-yellow-400 group-active:scale-110 transition-transform" />
            <span className="text-[7px] sm:text-[9px] font-black text-white tracking-widest uppercase">Jump</span>
          </button>
        </div>
      </div>
    </div>
  );
};
