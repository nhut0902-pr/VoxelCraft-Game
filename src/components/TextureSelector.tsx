import { useEffect, useState } from 'react';
import { useStore, BlockType } from '../hooks/useStore';
import { useKeyboard } from '../hooks/useKeyboard';
import { useSounds } from '../hooks/useSounds';
import { motion } from 'motion/react';

const blockColors: Record<BlockType, string> = {
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

export const TextureSelector = () => {
  const [visible, setVisible] = useState(false);
  const activeTexture = useStore((state) => state.texture);
  const setTexture = useStore((state) => state.setTexture);
  const { playSound } = useSounds();
  const { digit1, digit2, digit3, digit4, digit5, digit6, digit7, digit8, digit9, digit0, digitMinus } = useKeyboard();

  useEffect(() => {
    const textures: BlockType[] = Object.keys(blockColors) as BlockType[];
    const setAndPlay = (texture: BlockType) => {
      setTexture(texture);
      playSound('click');
    };

    if (digit1) setAndPlay(textures[0]);
    if (digit2) setAndPlay(textures[1]);
    if (digit3) setAndPlay(textures[2]);
    if (digit4) setAndPlay(textures[3]);
    if (digit5) setAndPlay(textures[4]);
    if (digit6) setAndPlay(textures[5]);
    if (digit7) setAndPlay(textures[6]);
    if (digit8) setAndPlay(textures[7]);
    if (digit9) setAndPlay(textures[8]);
    if (digit0) setAndPlay(textures[9]);
    // @ts-ignore
    if (digitMinus) setAndPlay(textures[10]);
  }, [digit1, digit2, digit3, digit4, digit5, digit6, digit7, digit8, digit9, digit0, digitMinus, setTexture, playSound]);

  useEffect(() => {
    // On mobile, keep it visible. On desktop, show for 2s.
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) {
      setVisible(true);
      return;
    }

    const visibilityTimeout = setTimeout(() => {
      setVisible(false);
    }, 2000);
    setVisible(true);
    return () => clearTimeout(visibilityTimeout);
  }, [activeTexture]);

  if (!visible) return null;

  return (
    <div className="absolute bottom-6 sm:bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-3 bg-white/5 p-1.5 sm:p-2 rounded-[2.5rem] backdrop-blur-2xl border border-white/10 z-50 pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-[95vw] overflow-x-auto no-scrollbar">
      {(Object.keys(blockColors) as BlockType[]).map((k) => (
        <button
          key={k}
          className={`w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0 flex flex-col items-center justify-center rounded-full cursor-pointer transition-all duration-300 relative group ${
            k === activeTexture 
              ? 'bg-white/20 scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
              : 'hover:bg-white/10'
          }`}
          onClick={() => {
            setTexture(k);
            playSound('click');
          }}
        >
          <div 
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg shadow-inner group-active:scale-90 transition-transform"
            style={{ backgroundColor: blockColors[k] }}
          />
          <span className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase mt-1">{k}</span>
          {k === activeTexture && (
            <motion.div 
              layoutId="active-glow"
              className="absolute inset-0 rounded-full border-2 border-white/40"
            />
          )}
        </button>
      ))}
    </div>
  );
};
