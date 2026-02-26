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

    const isMoving = moveForward || moveBackward || moveLeft || moveRight;

    if (isMoving) {
      direction
        .subVectors(frontVector, sideVector)
        .normalize()
        .multiplyScalar(currentSpeed)
        .applyEuler(camera.rotation);
      
      // We only care about horizontal movement for this part
      direction.y = 0;
    }

    // Collision Detection
    const cubes = useStore.getState().cubes;
    const checkCollision = (nextX: number, nextY: number, nextZ: number) => {
      const px = Math.round(nextX);
      const py = Math.round(nextY);
      const pz = Math.round(nextZ);
      
      // Check a small volume around the player's body (not feet)
      // Player height is ~1.7. We check from y+0.1 to y+1.6
      for (let x = px - 1; x <= px + 1; x++) {
        for (let y = py; y <= py + 1; y++) {
          for (let z = pz - 1; z <= pz + 1; z++) {
            const hasCube = cubes.some(c => c.pos[0] === x && c.pos[1] === y && c.pos[2] === z && c.type !== 'water');
            if (hasCube) {
              const cMinX = x - 0.5;
              const cMaxX = x + 0.5;
              const cMinY = y - 0.5;
              const cMaxY = y + 0.5;
              const cMinZ = z - 0.5;
              const cMaxZ = z + 0.5;
              
              // Player box for horizontal collision (slightly smaller than full height to avoid floor/ceiling snags)
              const pMinX = nextX - 0.3;
              const pMaxX = nextX + 0.3;
              const pMinY = nextY + 0.1; // Start above feet
              const pMaxY = nextY + 1.6; // End below full height
              const pMinZ = nextZ - 0.3;
              const pMaxZ = nextZ + 0.3;

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

    const minHeight = -2.0; // Bedrock level
    const footY = pos.current[1];
    const blockBelow = getBlockAt(pos.current[0], footY - 0.1, pos.current[2]);
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
    const blockAbove = getBlockAt(pos.current[0], pos.current[1] + 1.8, pos.current[2]);
    if (blockAbove && velocity.current[1] > 0) {
      velocity.current[1] = 0;
      pos.current[1] = blockAbove.pos[1] - 2.3;
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
