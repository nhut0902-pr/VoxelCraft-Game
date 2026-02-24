import { useEffect, useCallback } from 'react';

const SOUNDS = {
  place: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  break: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3',
};

export const useSounds = () => {
  const playSound = useCallback((type: keyof typeof SOUNDS) => {
    const audio = new Audio(SOUNDS[type]);
    audio.volume = 0.4;
    audio.play().catch(() => {
      // Ignore errors if audio can't play (e.g. user hasn't interacted yet)
    });
  }, []);

  return { playSound };
};
