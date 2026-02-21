import { useEffect, useRef } from 'react';
import nipplejs from 'nipplejs';
import { useStore } from '../hooks/useStore';

export const Joystick = () => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const setMovement = useStore((state) => state.setMovement);

  useEffect(() => {
    if (!joystickRef.current) return;

    const manager = nipplejs.create({
      zone: joystickRef.current,
      mode: 'static',
      position: { left: '50%', top: '50%' },
      color: 'white',
      size: 100,
    });

    manager.on('move', (_, data) => {
      const { vector, force } = data;
      const sensitivity = 0.5;
      
      // Normalize force to 0-1
      const normalizedForce = Math.min(force, 1);
      
      const forward = vector.y > 0 ? vector.y * normalizedForce : 0;
      const backward = vector.y < 0 ? -vector.y * normalizedForce : 0;
      const left = vector.x < 0 ? -vector.x * normalizedForce : 0;
      const right = vector.x > 0 ? vector.x * normalizedForce : 0;

      setMovement('forward', forward);
      setMovement('backward', backward);
      setMovement('left', left);
      setMovement('right', right);
    });

    manager.on('end', () => {
      setMovement('forward', 0);
      setMovement('backward', 0);
      setMovement('left', 0);
      setMovement('right', 0);
    });

    return () => {
      manager.destroy();
    };
  }, [setMovement]);

  return (
    <div 
      ref={joystickRef} 
      className="w-32 h-32 relative flex items-center justify-center"
    />
  );
};
