import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Stars, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../hooks/useStore';

export const DayNightCycle = () => {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const skyRef = useRef<any>(null);
  const rainRef = useRef<THREE.Points>(null);
  const { weather, setWeather, gameTime, setGameTime } = useStore();
  const [thunderFlash, setThunderFlash] = useState(0);
  const lastTimeRef = useRef(0);

  // Rain particles
  const rainCount = 5000;
  const rainPositions = useMemo(() => {
    const positions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return positions;
  }, []);

  useFrame(({ scene }: any, delta: number) => {
    // Update game time
    const isNight = Math.sin(gameTime) < 0;
    const timeSpeed = isNight ? 0.005 : 0.015; // Night is 3x slower than day
    const newTime = gameTime + delta * timeSpeed;
    
    // Weather change logic at sunrise
    if (Math.sin(gameTime) < 0 && Math.sin(newTime) >= 0) {
      const rand = Math.random();
      if (rand < 0.6) setWeather('clear');
      else if (rand < 0.9) setWeather('rain');
      else setWeather('storm');
    }
    
    setGameTime(newTime);

    const x = Math.cos(newTime) * 100;
    const y = Math.sin(newTime) * 100;
    const z = 20;

    const weatherFactor = weather === 'clear' ? 1 : weather === 'rain' ? 0.4 : 0.15;

    if (sunRef.current) {
      sunRef.current.position.set(x, y, z);
      const baseIntensity = Math.max(0, Math.sin(newTime) * 1.5);
      sunRef.current.intensity = baseIntensity * weatherFactor + thunderFlash;
      sunRef.current.color.set(y > 5 ? '#ffffff' : '#ff9900'); // Sunset/sunrise color
    }

    if (ambientRef.current) {
      // Increased base ambient at night to avoid "too dark" issue
      const baseAmbient = isNight ? 0.15 : 0.3; 
      ambientRef.current.intensity = (baseAmbient + Math.max(0, Math.sin(newTime) * 0.4)) * weatherFactor;
    }

    // Fog logic
    if (scene.fog) {
      const fogColor = isNight ? '#020205' : (weather === 'clear' ? '#87ceeb' : '#444444');
      (scene.fog as THREE.Fog).color.set(fogColor);
      (scene.fog as THREE.Fog).near = weather === 'clear' ? 10 : 2;
      (scene.fog as THREE.Fog).far = weather === 'clear' ? 100 : 30;
    }

    // Thunder logic
    if (weather === 'storm' && Math.random() > 0.995) {
      setThunderFlash(3);
      setTimeout(() => setThunderFlash(0), 50 + Math.random() * 150);
    }

    // Rain animation
    if (rainRef.current && (weather === 'rain' || weather === 'storm')) {
      const positions = rainRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < rainCount; i++) {
        positions[i * 3 + 1] -= 0.8; // Faster rain
        if (positions[i * 3 + 1] < -5) {
          positions[i * 3 + 1] = 45;
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const [sunPos, setSunPos] = useState<[number, number, number]>([100, 10, 20]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const x = Math.cos(gameTime) * 100;
      const y = Math.sin(gameTime) * 100;
      setSunPos([x, y, 20]);
    }, 100);
    return () => clearInterval(interval);
  }, [gameTime]);

  return (
    <>
      <fog attach="fog" args={['#87ceeb', 10, 100]} />
      <Sky 
        sunPosition={sunPos} 
        turbidity={weather === 'clear' ? 10 : 40}
        rayleigh={weather === 'clear' ? 3 : 0.2}
        mieCoefficient={weather === 'clear' ? 0.005 : 0.2}
        mieDirectionalG={0.8}
      />
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1} 
      />
      
      {/* Clouds */}
      {(weather === 'rain' || weather === 'storm') && (
        <group>
          <Cloud position={[-10, 20, -10]} speed={0.2} opacity={0.5} />
          <Cloud position={[10, 22, 10]} speed={0.2} opacity={0.5} />
          <Cloud position={[0, 25, 0]} speed={0.2} opacity={0.5} />
        </group>
      )}

      {/* Rain Particles */}
      {(weather === 'rain' || weather === 'storm') && (
        <points ref={rainRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={rainCount}
              array={rainPositions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.1}
            color="#aaaaff"
            transparent
            opacity={0.6}
            sizeAttenuation
          />
        </points>
      )}

      <directionalLight 
        ref={sunRef} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <ambientLight ref={ambientRef} intensity={0.5} />
    </>
  );
};
