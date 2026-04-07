import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { cn } from '../../lib/utils';

interface AvatarProps {
  audioLevel: number;
  gesture: string;
  emotion: string;
}

const AvatarModel: React.FC<AvatarProps> = ({ audioLevel, gesture, emotion }) => {
  const headRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (headRef.current) {
      // Idle movement
      headRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
      headRef.current.rotation.x = Math.cos(t * 0.3) * 0.05;

      // Gesture-based movement
      if (gesture === 'nod') {
        headRef.current.rotation.x += Math.sin(t * 10) * 0.1;
      } else if (gesture === 'shake') {
        headRef.current.rotation.y += Math.sin(t * 10) * 0.2;
      }
    }

    if (mouthRef.current) {
      // Lip sync simulation
      const scale = 0.1 + audioLevel * 2;
      mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, scale, 0.2);
    }

    // Blinking
    const blink = Math.sin(t * 2) > 0.98 ? 0.1 : 1;
    if (leftEyeRef.current) leftEyeRef.current.scale.y = blink;
    if (rightEyeRef.current) rightEyeRef.current.scale.y = blink;
  });

  return (
    <group ref={headRef}>
      {/* Head */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#f3d2c1" />
      </mesh>

      {/* Eyes */}
      <mesh ref={leftEyeRef} position={[-0.35, 0.2, 0.85]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh ref={rightEyeRef} position={[0.35, 0.2, 0.85]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Mouth */}
      <mesh ref={mouthRef} position={[0, -0.4, 0.9]}>
        <capsuleGeometry args={[0.15, 0.05, 4, 8]} />
        <meshStandardMaterial color="#8a3324" />
      </mesh>

      {/* Hair (Placeholder) */}
      <mesh position={[0, 0.5, -0.2]}>
        <sphereGeometry args={[1.05, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2d1b0d" />
      </mesh>
    </group>
  );
};

export const AvatarCanvas: React.FC<AvatarProps> = (props) => {
  return (
    <div className="w-full h-full bg-slate-900 rounded-2xl overflow-hidden relative border border-slate-700 shadow-2xl">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={45} />
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          minPolarAngle={Math.PI / 2.5} 
          maxPolarAngle={Math.PI / 1.8}
        />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <AvatarModel {...props} />
        
        <Environment preset="city" />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
      </Canvas>
      
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pointer-events-none">
        <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-mono uppercase tracking-widest border border-white/10">
          Live Avatar Stream
        </div>
        <div className="flex gap-1">
          <div className={cn("w-2 h-2 rounded-full", props.audioLevel > 0.1 ? "bg-green-500 animate-pulse" : "bg-slate-600")} />
          <div className="w-2 h-2 rounded-full bg-slate-600" />
          <div className="w-2 h-2 rounded-full bg-slate-600" />
        </div>
      </div>
    </div>
  );
};
