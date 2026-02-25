import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls, OrbitControls } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import { Vector3, PerspectiveCamera, Object3D, SpotLight } from 'three';
import * as THREE from 'three';
import { useKeyboard } from '../hooks/useKeyboard';
import { useStore } from '../hooks/useStore';
import { useSounds } from '../hooks/useSounds';

const BASE_JUMP_FORCE = 4;
const BASE_SPEED = 4;

export const Player = () => {
  const { camera, gl } = useThree();
  const keyboardActions = useKeyboard();
  const { movement, playerScale, cameraMode, setPlayerPos, setPlayerRotation, weather } = useStore();
  const { playSound } = useSounds();
  
  // Combine keyboard and store movement
  const moveForward = keyboardActions.moveForward ? 1 : movement.forward;
  const moveBackward = keyboardActions.moveBackward ? 1 : movement.backward;
  const moveLeft = keyboardActions.moveLeft ? 1 : movement.left;
  const moveRight = keyboardActions.moveRight ? 1 : movement.right;
  const jump = keyboardActions.jump || movement.jump;

  // Simple physics state
  const velocity = useRef([0, 0, 0]);
  const pos = useRef([0, 1, 10]);
  const lastStepTime = useRef(0);
  const flashLightRef = useRef<THREE.SpotLight>(null);
  
  // Touch rotation state
  const touchRotation = useRef({ x: 0, y: 0 });
  const isTouchDevice = useRef('ontouchstart' in window || navigator.maxTouchPoints > 0);

  useEffect(() => {
    if (!isTouchDevice.current || cameraMode === 'orbit') return;

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
  }, [gl, cameraMode]);

  useFrame((state, delta) => {
    if (cameraMode === 'orbit') return;

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
    const frontVector = new Vector3(0, 0, moveBackward - moveForward);
    const sideVector = new Vector3(moveLeft - moveRight, 0, 0);

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(currentSpeed * Math.max(moveForward, moveBackward, moveLeft, moveRight, 0.001))
      .applyEuler(camera.rotation);

    pos.current[0] += direction.x * delta;
    pos.current[2] += direction.z * delta;

    const minHeight = 0.1 * playerScale; 
    const cameraOffset = 1.5 * playerScale;

    // Footstep sound
    const isMoving = moveForward || moveBackward || moveLeft || moveRight;
    if (isMoving && pos.current[1] <= minHeight + 0.1) {
      const now = Date.now();
      if (now - lastStepTime.current > 400) {
        playSound('click');
        lastStepTime.current = now;
      }
    }

    if (pos.current[1] > minHeight) {
      velocity.current[1] -= 9.81 * delta;
    } else {
      pos.current[1] = minHeight;
      velocity.current[1] = 0;
      if (jump) {
        velocity.current[1] = currentJumpForce;
        playSound('click'); // Using click as placeholder for jump
      }
    }
    
    pos.current[1] += velocity.current[1] * delta;

    camera.position.set(pos.current[0], pos.current[1] + cameraOffset, pos.current[2]);

    // Sync to store
    setPlayerPos([pos.current[0], pos.current[1], pos.current[2]]);
    setPlayerRotation([camera.rotation.x, camera.rotation.y, camera.rotation.z]);

    // Flashlight logic
    if (flashLightRef.current) {
      const { gameTime } = useStore.getState();
      const isNight = Math.sin(gameTime) < 0;
      flashLightRef.current.intensity = (isNight || weather !== 'clear') ? 2 : 0;
      flashLightRef.current.position.copy(camera.position);
      
      const targetPos = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
      flashLightRef.current.target.position.copy(targetPos);
      flashLightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      {cameraMode === 'first-person' ? (
        !isTouchDevice.current && <PointerLockControls />
      ) : (
        <OrbitControls makeDefault />
      )}
      <spotLight 
        ref={flashLightRef} 
        angle={0.5} 
        penumbra={0.5} 
        distance={20} 
        castShadow 
      />
      <primitive object={new THREE.Object3D()} ref={(node: any) => { if(node && flashLightRef.current) flashLightRef.current.target = node }} />
    </>
  );
};
