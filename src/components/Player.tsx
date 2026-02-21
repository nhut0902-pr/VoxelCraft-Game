import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import { Vector3, PerspectiveCamera } from 'three';
import { useKeyboard } from '../hooks/useKeyboard';
import { useStore } from '../hooks/useStore';

const BASE_JUMP_FORCE = 4;
const BASE_SPEED = 4;

export const Player = () => {
  const { camera, gl } = useThree();
  const keyboardActions = useKeyboard();
  const { movement, playerScale } = useStore();
  
  // Combine keyboard and store movement
  const moveForward = keyboardActions.moveForward || movement.forward > 0.5;
  const moveBackward = keyboardActions.moveBackward || movement.backward > 0.5;
  const moveLeft = keyboardActions.moveLeft || movement.left > 0.5;
  const moveRight = keyboardActions.moveRight || movement.right > 0.5;
  const jump = keyboardActions.jump || movement.jump;

  // Simple physics state
  const velocity = useRef([0, 0, 0]);
  const pos = useRef([0, 1, 10]);
  
  // Touch rotation state
  const touchRotation = useRef({ x: 0, y: 0 });
  const isTouchDevice = useRef('ontouchstart' in window || navigator.maxTouchPoints > 0);

  useEffect(() => {
    if (!isTouchDevice.current) return;

    let lastTouchX = 0;
    let lastTouchY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastTouchX;
      const deltaY = touch.clientY - lastTouchY;

      const sensitivity = 0.005;
      
      touchRotation.current.y -= deltaX * sensitivity;
      touchRotation.current.x -= deltaY * sensitivity;
      
      touchRotation.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, touchRotation.current.x));

      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
    };

    gl.domElement.addEventListener('touchstart', handleTouchStart);
    gl.domElement.addEventListener('touchmove', handleTouchMove);

    return () => {
      gl.domElement.removeEventListener('touchstart', handleTouchStart);
      gl.domElement.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gl]);

  useFrame((state, delta) => {
    if (isTouchDevice.current) {
      camera.rotation.set(touchRotation.current.x, touchRotation.current.y, 0, 'YXZ');
    }

    const currentSpeed = BASE_SPEED * (0.3 + playerScale * 0.7); 
    const currentJumpForce = BASE_JUMP_FORCE * (0.5 + playerScale * 0.5);

    // FOV adjustment for scale sensation
    if (camera instanceof PerspectiveCamera) {
      camera.fov = playerScale === 1 ? 45 : 75;
      camera.updateProjectionMatrix();
    }

    const direction = new Vector3();
    const frontVector = new Vector3(0, 0, Number(moveBackward) - Number(moveForward));
    const sideVector = new Vector3(Number(moveLeft) - Number(moveRight), 0, 0);

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(currentSpeed)
      .applyEuler(camera.rotation);

    pos.current[0] += direction.x * delta;
    pos.current[2] += direction.z * delta;

    // Extreme shrinking: 
    // Normal: minHeight 0.1, cameraOffset 1.5 (Total 1.6m)
    // Small (0.05): minHeight 0.005, cameraOffset 0.075 (Total 0.08m - like an ant)
    const minHeight = 0.1 * playerScale; 
    const cameraOffset = 1.5 * playerScale;

    if (pos.current[1] > minHeight) {
      velocity.current[1] -= 9.81 * delta;
    } else {
      pos.current[1] = minHeight;
      velocity.current[1] = 0;
      if (jump) {
        velocity.current[1] = currentJumpForce;
      }
    }
    
    pos.current[1] += velocity.current[1] * delta;

    camera.position.set(pos.current[0], pos.current[1] + cameraOffset, pos.current[2]);
  });

  return (
    <>
      {!isTouchDevice.current && <PointerLockControls />}
    </>
  );
};
