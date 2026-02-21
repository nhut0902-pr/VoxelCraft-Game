import { useEffect, useState } from 'react';

interface KeyboardState {
  moveForward: boolean;
  moveBackward: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  jump: boolean;
  digit1: boolean;
  digit2: boolean;
  digit3: boolean;
  digit4: boolean;
  digit5: boolean;
  digit6: boolean;
  digit7: boolean;
  digit8: boolean;
  digit9: boolean;
  digit0: boolean;
}

export const useKeyboard = () => {
  const [actions, setActions] = useState<KeyboardState>({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    jump: false,
    digit1: false,
    digit2: false,
    digit3: false,
    digit4: false,
    digit5: false,
    digit6: false,
    digit7: false,
    digit8: false,
    digit9: false,
    digit0: false,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { code } = event;
      switch (code) {
        case 'KeyW':
        case 'ArrowUp':
          setActions((prev) => ({ ...prev, moveForward: true }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setActions((prev) => ({ ...prev, moveBackward: true }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setActions((prev) => ({ ...prev, moveLeft: true }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setActions((prev) => ({ ...prev, moveRight: true }));
          break;
        case 'Space':
          setActions((prev) => ({ ...prev, jump: true }));
          break;
        case 'Digit1':
          setActions((prev) => ({ ...prev, digit1: true }));
          break;
        case 'Digit2':
          setActions((prev) => ({ ...prev, digit2: true }));
          break;
        case 'Digit3':
          setActions((prev) => ({ ...prev, digit3: true }));
          break;
        case 'Digit4':
          setActions((prev) => ({ ...prev, digit4: true }));
          break;
        case 'Digit5':
          setActions((prev) => ({ ...prev, digit5: true }));
          break;
        case 'Digit6':
          setActions((prev) => ({ ...prev, digit6: true }));
          break;
        case 'Digit7':
          setActions((prev) => ({ ...prev, digit7: true }));
          break;
        case 'Digit8':
          setActions((prev) => ({ ...prev, digit8: true }));
          break;
        case 'Digit9':
          setActions((prev) => ({ ...prev, digit9: true }));
          break;
        case 'Digit0':
          setActions((prev) => ({ ...prev, digit0: true }));
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const { code } = event;
      switch (code) {
        case 'KeyW':
        case 'ArrowUp':
          setActions((prev) => ({ ...prev, moveForward: false }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setActions((prev) => ({ ...prev, moveBackward: false }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setActions((prev) => ({ ...prev, moveLeft: false }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setActions((prev) => ({ ...prev, moveRight: false }));
          break;
        case 'Space':
          setActions((prev) => ({ ...prev, jump: false }));
          break;
        case 'Digit1':
          setActions((prev) => ({ ...prev, digit1: false }));
          break;
        case 'Digit2':
          setActions((prev) => ({ ...prev, digit2: false }));
          break;
        case 'Digit3':
          setActions((prev) => ({ ...prev, digit3: false }));
          break;
        case 'Digit4':
          setActions((prev) => ({ ...prev, digit4: false }));
          break;
        case 'Digit5':
          setActions((prev) => ({ ...prev, digit5: false }));
          break;
        case 'Digit6':
          setActions((prev) => ({ ...prev, digit6: false }));
          break;
        case 'Digit7':
          setActions((prev) => ({ ...prev, digit7: false }));
          break;
        case 'Digit8':
          setActions((prev) => ({ ...prev, digit8: false }));
          break;
        case 'Digit9':
          setActions((prev) => ({ ...prev, digit9: false }));
          break;
        case 'Digit0':
          setActions((prev) => ({ ...prev, digit0: false }));
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return actions;
};
