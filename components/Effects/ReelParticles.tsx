'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PER_REEL = 80;
const TOTAL = PER_REEL * 5;
const REEL_X = [-3.6, -1.8, 0, 1.8, 3.6];

export function ReelParticles() {
  const pointsRef = useRef<THREE.Points>(null!);

  const { positions, speeds, reelIndices } = useMemo(() => {
    const positions = new Float32Array(TOTAL * 3);
    const speeds = new Float32Array(TOTAL);
    const reelIndices = new Int32Array(TOTAL);
    for (let i = 0; i < TOTAL; i++) {
      const reel = Math.floor(i / PER_REEL);
      reelIndices[i] = reel;
      positions[i * 3] = REEL_X[reel] + (Math.random() - 0.5) * 1.2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = Math.random() * 0.5;
      speeds[i] = 0.04 + Math.random() * 0.06;
    }
    return { positions, speeds, reelIndices };
  }, []);

  useFrame(() => {
    const pts = pointsRef.current;
    if (!pts) return;
    const pos = (pts.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    for (let i = 0; i < TOTAL; i++) {
      pos[i * 3 + 1] -= speeds[i];
      if (pos[i * 3 + 1] < -3.5) {
        pos[i * 3 + 1] = 3.5;
        pos[i * 3] = REEL_X[reelIndices[i]] + (Math.random() - 0.5) * 1.2;
      }
    }
    (pts.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const mat = useMemo(() =>
    new THREE.PointsMaterial({ color: '#FFB800', size: 0.06, transparent: true, opacity: 0.7, sizeAttenuation: true }),
  []);

  return <points ref={pointsRef} geometry={geo} material={mat} />;
}
