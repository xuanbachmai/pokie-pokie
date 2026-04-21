'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAG = `
uniform float uTime;
uniform float uOpacity;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0; float a = 0.5;
  for(int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}
void main() {
  vec2 uv = vUv;
  uv.y -= uTime * 0.4;
  float fire = fbm(uv * 3.5 + vec2(0.0, uTime * 0.5));
  fire *= (1.0 - vUv.y) * (1.0 - vUv.y);
  vec3 col = mix(vec3(0.0), vec3(1.0, 0.2, 0.0), fire);
  col = mix(col, vec3(1.0, 0.6, 0.0), fire * fire);
  col = mix(col, vec3(1.0, 1.0, 0.5), fire * fire * fire);
  gl_FragColor = vec4(col, fire * uOpacity);
}`;

export function DragonFire() {
  const meshRef = useRef<THREE.Mesh>(null!);

  const material = useMemo(() =>
    new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 0.35 } },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
    }),
  []);

  const geometry = useMemo(() => new THREE.PlaneGeometry(20, 12), []);

  useFrame(({ clock }) => {
    if (material.uniforms.uTime) {
      material.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return <mesh ref={meshRef} position={[0, 0, -0.5]} geometry={geometry} material={material} />;
}
