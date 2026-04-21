'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ROCKETS = 12;
const SPARKS = 40;
const TOTAL = ROCKETS * SPARKS;

const COLORS_HEX = ['#FF4D6D', '#FFD700', '#00D187', '#FF8C00', '#C084FC'];

export function FireworksEffect() {
  const pointsRef = useRef<THREE.Points>(null!);

  const { positions, velocities, colors, life, maxLife } = useMemo(() => {
    const positions = new Float32Array(TOTAL * 3);
    const velocities = new Float32Array(TOTAL * 3);
    const colors = new Float32Array(TOTAL * 3);
    const life = new Float32Array(TOTAL);
    const maxLife = new Float32Array(TOTAL);
    const tmpColor = new THREE.Color();

    for (let r = 0; r < ROCKETS; r++) {
      const cx = (Math.random() - 0.5) * 8;
      const cy = (Math.random() - 0.5) * 4;
      tmpColor.set(COLORS_HEX[r % COLORS_HEX.length]);
      const delay = r * 8;

      for (let s = 0; s < SPARKS; s++) {
        const i = r * SPARKS + s;
        const angle = (s / SPARKS) * Math.PI * 2;
        const speed = 0.04 + Math.random() * 0.04;
        positions[i * 3] = cx;
        positions[i * 3 + 1] = cy;
        positions[i * 3 + 2] = 0;
        velocities[i * 3] = Math.cos(angle) * speed;
        velocities[i * 3 + 1] = Math.sin(angle) * speed;
        velocities[i * 3 + 2] = 0;
        colors[i * 3] = tmpColor.r;
        colors[i * 3 + 1] = tmpColor.g;
        colors[i * 3 + 2] = tmpColor.b;
        life[i] = -delay;
        maxLife[i] = 60 + Math.random() * 40;
      }
    }
    return { positions, velocities, colors, life, maxLife };
  }, []);

  useFrame(() => {
    const pts = pointsRef.current;
    if (!pts) return;
    const pos = (pts.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    for (let i = 0; i < TOTAL; i++) {
      life[i]++;
      if (life[i] < 0 || life[i] > maxLife[i]) continue;
      pos[i * 3] += velocities[i * 3];
      pos[i * 3 + 1] += velocities[i * 3 + 1] - 0.0008;
      pos[i * 3 + 2] += velocities[i * 3 + 2];
    }
    (pts.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  const mat = useMemo(() =>
    new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true }),
  []);

  return <points ref={pointsRef} geometry={geo} material={mat} />;
}
