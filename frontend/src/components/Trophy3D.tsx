'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, PerspectiveCamera, MeshTransmissionMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

function TrophyModel() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
  })

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <group ref={groupRef}>
        {/* Base */}
        <mesh position={[0, -2, 0]}>
          <cylinderGeometry args={[1.5, 1.8, 0.3, 32]} />
          <meshStandardMaterial
            color="#8B4513"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Pedestal */}
        <mesh position={[0, -1.5, 0]}>
          <cylinderGeometry args={[0.8, 1.2, 1, 32]} />
          <meshStandardMaterial
            color="#DAA520"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Cup base */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.5, 1.5, 32]} />
          <meshStandardMaterial
            color="#FFD700"
            metalness={1}
            roughness={0}
            emissive="#FFD700"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Cup top */}
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[1.2, 0.8, 0.8, 32]} />
          <MeshTransmissionMaterial
            color="#FFD700"
            thickness={0.5}
            roughness={0}
            transmission={0.95}
            ior={1.5}
            chromaticAberration={0.06}
            backside
          />
        </mesh>

        {/* Handles */}
        {[-1, 1].map((side, i) => (
          <mesh key={i} position={[side * 1.2, 0.5, 0]} rotation={[0, 0, side * Math.PI / 4]}>
            <torusGeometry args={[0.4, 0.08, 16, 32, Math.PI]} />
            <meshStandardMaterial
              color="#FFD700"
              metalness={1}
              roughness={0.1}
            />
          </mesh>
        ))}

        {/* Crown on top */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (Math.PI * 2 * i) / 8
          const x = Math.cos(angle) * 1
          const z = Math.sin(angle) * 1

          return (
            <mesh key={i} position={[x, 1.5, z]}>
              <coneGeometry args={[0.15, 0.5, 8]} />
              <meshStandardMaterial
                color="#FFD700"
                metalness={1}
                roughness={0}
                emissive="#FFD700"
                emissiveIntensity={0.5}
              />
            </mesh>
          )
        })}

        {/* Center gem */}
        <mesh position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <MeshTransmissionMaterial
            color="#FF1493"
            thickness={0.3}
            roughness={0}
            transmission={0.99}
            ior={2.4}
            chromaticAberration={0.1}
            backside
          />
        </mesh>
      </group>
    </Float>
  )
}

interface Trophy3DProps {
  className?: string
}

export default function Trophy3D({ className = '' }: Trophy3DProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />

        {/* Lights */}
        <ambientLight intensity={0.3} />
        <spotLight
          position={[5, 5, 5]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          castShadow
        />
        <spotLight
          position={[-5, 5, -5]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          color="#4169E1"
        />
        <pointLight position={[0, -3, 0]} intensity={0.5} color="#FFD700" />

        {/* Environment */}
        <Environment preset="sunset" />

        {/* Trophy */}
        <TrophyModel />
      </Canvas>
    </div>
  )
}
