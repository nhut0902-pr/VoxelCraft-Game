import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls, OrbitControls } from '@react-three/drei';
import { useRef, useEffect, useMemo } from 'react';
import { Vector3, PerspectiveCamera, Object3D, SpotLight } from 'three';
import * as THREE from 'three';
import { useKeyboard } from '../hooks/useKeyboard';
import { useStore } from '../hooks/useStore';
import { useSounds } from '../hooks/useSounds';

const BASE_JUMP_FORCE = 4.5;
const BASE_SPEED = 6;

export const Player = () => {
  const { camera, gl } = useThree();
  const keyboardActions = useKeyboard();
  const { movement, playerScale, cameraMode, setPlayerPos, setPlayerRotation, weather, playerPos } = useStore();
  const { playSound } = useSounds();
  
  // Combine keyboard and store movement
  const moveForward = keyboardActions.moveForward ? 1 : movement.forward;
  const moveBackward = keyboardActions.moveBackward ? 1 : movement.backward;
  const moveLeft = keyboardActions.moveLeft ? 1 : movement.left;
  const moveRight = keyboardActions.moveRight ? 1 : movement.right;
  const jump = keyboardActions.jump || movement.jump;

  // Simple physics state
  const velocity = useRef([0, 0, 0]);
  const pos = useRef(playerPos);
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
    const isMoving = moveForward !== 0 || moveBackward !== 0 || moveLeft !== 0 || moveRight !== 0;

    if (isMoving) {
      const inputMagnitude = Math.sqrt(
        (moveBackward - moveForward) ** 2 + 
        (moveLeft - moveRight) ** 2
      );

      if (inputMagnitude > 0.01) {
        // Get forward and right vectors based on camera yaw
        const forward = new Vector3(0, 0, -1).applyAxisAngle(new Vector3(0, 1, 0), camera.rotation.y);
        const right = new Vector3(1, 0, 0).applyAxisAngle(new Vector3(0, 1, 0), camera.rotation.y);
        
        direction.addScaledVector(forward, moveForward - moveBackward);
        direction.addScaledVector(right, moveRight - moveLeft);
        direction.normalize().multiplyScalar(currentSpeed * Math.min(inputMagnitude, 1));
      }
    }

    // Collision Detection
    const cubes = useStore.getState().cubes;
    
    // Optimize: Create a set of occupied positions for O(1) lookup
    // We use a simple string key for the set
    const cubeMap = useMemo(() => {
      const map = new Set<string>();
      cubes.forEach(c => {
        if (c.type !== 'water') {
          map.add(`${c.pos[0]},${c.pos[1]},${c.pos[2]}`);
        }
      });
      return map;
    }, [cubes]);

    const checkCollision = (nextX: number, nextY: number, nextZ: number) => {
      const px = Math.floor(nextX + 0.5);
      const py = Math.floor(nextY + 0.5);
      const pz = Math.floor(nextZ + 0.5);
      
      // Check blocks in a 3x3x3 area around the player
      for (let x = px - 1; x <= px + 1; x++) {
        for (let y = py - 1; y <= py + 2; y++) {
          for (let z = pz - 1; z <= pz + 1; z++) {
            if (cubeMap.has(`${x},${y},${z}`)) {
              const cMinX = x - 0.5;
              const cMaxX = x + 0.5;
              const cMinY = y - 0.5;
              const cMaxY = y + 0.5;
              const cMinZ = z - 0.5;
              const cMaxZ = z + 0.5;
              
              const pMinX = nextX - 0.2;
              const pMaxX = nextX + 0.2;
              const pMinY = nextY + 0.2; 
              const pMaxY = nextY + 1.5; 
              const pMinZ = nextZ - 0.2;
              const pMaxZ = nextZ + 0.2;

              if (pMinX < cMaxX && pMaxX > cMinX &&
                  pMinY < cMaxY && pMaxY > cMinY &&
                  pMinZ < cMaxZ && pMaxZ > cMinZ) {
                return true;
              }
            }
          }
        }
      }
      return false;
    };

    // Unstuck logic: only push up if deeply colliding
    if (checkCollision(pos.current[0], pos.current[1], pos.current[2])) {
      pos.current[1] += 0.05;
    }

    if (isMoving) {
      // Try moving X
      const nextX = pos.current[0] + direction.x * delta;
      if (!checkCollision(nextX, pos.current[1], pos.current[2])) {
        pos.current[0] = nextX;
      }

      // Try moving Z
      const nextZ = pos.current[2] + direction.z * delta;
      if (!checkCollision(pos.current[0], pos.current[1], nextZ)) {
        pos.current[2] = nextZ;
      }
    }

    // Vertical Physics & Collision
    const getBlockAt = (x: number, y: number, z: number) => {
      const rx = Math.round(x);
      const ry = Math.round(y);
      const rz = Math.round(z);
      return cubes.find(c => c.pos[0] === rx && c.pos[1] === ry && c.pos[2] === rz && c.type !== 'water');
    };

    const minHeight = -2.0; 
    const footY = pos.current[1];
    const blockBelow = getBlockAt(pos.current[0], footY - 0.05, pos.current[2]);
    const groundY = blockBelow ? blockBelow.pos[1] + 0.5 : minHeight;

    if (pos.current[1] > groundY + 0.01) {
      velocity.current[1] -= 9.81 * delta;
    } else {
      pos.current[1] = groundY;
      velocity.current[1] = 0;
      if (jump) {
        velocity.current[1] = currentJumpForce;
        playSound('click');
      }
    }
    
    pos.current[1] += velocity.current[1] * delta;

    // Prevent jumping through blocks above
    const blockAbove = getBlockAt(pos.current[0], pos.current[1] + 1.7, pos.current[2]);
    if (blockAbove && velocity.current[1] > 0) {
      velocity.current[1] = 0;
      pos.current[1] = blockAbove.pos[1] - 2.2;
    }

    const cameraOffset = 1.5 * playerScale;
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
