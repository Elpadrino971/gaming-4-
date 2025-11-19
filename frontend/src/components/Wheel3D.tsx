'use client'

import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, MeshWobbleMaterial, Environment, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

interface Wheel3DProps {
  spinning: boolean
  onSpinComplete?: () => void
}

function WheelMesh({ spinning, onSpinComplete }: Wheel3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [rotation, setRotation] = useState(0)
  const [velocity, setVelocity] = useState(0)

  useFrame((state, delta) => {
    if (!groupRef.current) return

    if (spinning && velocity < 20) {
      setVelocity((v) => Math.min(v + delta * 30, 20))
    } else if (!spinning && velocity > 0) {
      setVelocity((v) => Math.max(v - delta * 5, 0))
      if (velocity < 0.1 && onSpinComplete) {
        onSpinComplete()
      }
    }

    setRotation((r) => r + velocity * delta)
    groupRef.current.rotation.z = rotation
  })

  const segments = 8
  const colors = [
    '#FFD700', '#FFA500', '#FF6347', '#FF1493',
    '#9370DB', '#4169E1', '#00CED1', '#32CD32'
  ]

  return (
    <group ref={groupRef}>
      {/* Main wheel disk */}
      <mesh>
        <cylinderGeometry args={[3, 3, 0.5, 64]} />
        <MeshWobbleMaterial
          color="#FFD700"
          speed={spinning ? 2 : 0}
          factor={0.1}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Segments */}
      {Array.from({ length: segments }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / segments
        const nextAngle = (Math.PI * 2 * (i + 1)) / segments

        return (
          <mesh key={i} position={[0, 0.26, 0]} rotation={[0, angle, 0]}>
            <cylinderGeometry args={[3, 3, 0.01, 64, 1, false, 0, Math.PI * 2 / segments]} />
            <meshStandardMaterial
              color={colors[i]}
              metalness={0.6}
              roughness={0.3}
              emissive={colors[i]}
              emissiveIntensity={spinning ? 0.3 : 0.1}
            />
          </mesh>
        )
      })}

      {/* Center decoration */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#FF4500"
          metalness={1}
          roughness={0}
          emissive="#FF4500"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Rim */}
      <mesh>
        <torusGeometry args={[3, 0.15, 16, 100]} />
        <meshStandardMaterial
          color="#DAA520"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Prize markers (3D spheres) */}
      {Array.from({ length: segments }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / segments + Math.PI / segments
        const x = Math.cos(angle) * 2.2
        const z = Math.sin(angle) * 2.2
        const markerColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#FF1493']

        return (
          <mesh key={i} position={[x, 0.3, z]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial
              color={markerColors[i]}
              metalness={0.8}
              roughness={0.2}
              emissive={markerColors[i]}
              emissiveIntensity={spinning ? 0.8 : 0.3}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export default function Wheel3D({ spinning, onSpinComplete }: Wheel3DProps) {
  return (
    <div className="w-full h-[500px] relative">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 5, 8]} fov={50} />

        {/* Lights */}
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4169E1" />

        {/* Environment */}
        <Environment preset="sunset" />

        {/* Wheel */}
        <WheelMesh spinning={spinning} onSpinComplete={onSpinComplete} />

        {/* Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Pointer */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="w-0 h-0 border-l-[30px] border-r-[30px] border-t-[50px] border-transparent border-t-red-500 drop-shadow-2xl filter" style={{
          filter: 'drop-shadow(0 0 20px rgba(255, 0, 0, 0.8))'
        }} />
      </div>
    </div>
  )
}
