import { useEffect, useState } from 'react';
import { useStore, BlockType } from '../hooks/useStore';
import { useKeyboard } from '../hooks/useKeyboard';
import { motion } from 'motion/react';

const images: Record<BlockType, string> = {
  dirt: '🟫',
  grass: '🟩',
  glass: '⬜',
  wood: '🪵',
  log: '🌲',
  cobblestone: '🧱',
};

export const TextureSelector = () => {
  const [visible, setVisible] = useState(false);
  const activeTexture = useStore((state) => state.texture);
  const setTexture = useStore((state) => state.setTexture);
  const { digit1, digit2, digit3, digit4, digit5, digit6 } = useKeyboard();

  useEffect(() => {
    const textures: BlockType[] = ['dirt', 'grass', 'glass', 'wood', 'log', 'cobblestone'];
    if (digit1) setTexture(textures[0]);
    if (digit2) setTexture(textures[1]);
    if (digit3) setTexture(textures[2]);
    if (digit4) setTexture(textures[3]);
    if (digit5) setTexture(textures[4]);
    if (digit6) setTexture(textures[5]);
  }, [digit1, digit2, digit3, digit4, digit5, digit6, setTexture]);

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
    <div className="absolute bottom-8 sm:bottom-14 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 bg-white/5 p-2 rounded-[2.5rem] backdrop-blur-2xl border border-white/10 z-50 pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {(['dirt', 'grass', 'glass', 'wood', 'log', 'cobblestone'] as BlockType[]).map((k) => (
        <button
          key={k}
          className={`w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center text-xl sm:text-3xl rounded-full cursor-pointer transition-all duration-300 relative group ${
            k === activeTexture 
              ? 'bg-white/20 scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
              : 'hover:bg-white/10'
          }`}
          onClick={() => setTexture(k)}
        >
          <span className="group-active:scale-90 transition-transform">{images[k]}</span>
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
