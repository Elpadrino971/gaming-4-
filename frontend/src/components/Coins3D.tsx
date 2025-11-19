'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

interface Coin {
  position: THREE.Vector3
  velocity: THREE.Vector3
  rotation: THREE.Euler
  rotationSpeed: THREE.Euler
}

interface Coins3DProps {
  count?: number
}

function FallingCoins({ count = 50 }: { count: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const coins = useMemo(() => {
    const temp: Coin[] = []
    for (let i = 0; i < count; i++) {
      temp.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          Math.random() * 15 + 5,
          (Math.random() - 0.5) * 10
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          -Math.random() * 2 - 1,
          (Math.random() - 0.5) * 2
        ),
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        rotationSpeed: new THREE.Euler(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        )
      })
    }
    return temp
  }, [count])

  useFrame((state, delta) => {
    if (!meshRef.current) return

    const dummy = new THREE.Object3D()

    coins.forEach((coin, i) => {
      // Update physics
      coin.velocity.y -= 9.8 * delta
      coin.position.add(coin.velocity.clone().multiplyScalar(delta))
      coin.rotation.x += coin.rotationSpeed.x
      coin.rotation.y += coin.rotationSpeed.y
      coin.rotation.z += coin.rotationSpeed.z

      // Reset if fallen below
      if (coin.position.y < -10) {
        coin.position.y = Math.random() * 5 + 15
        coin.position.x = (Math.random() - 0.5) * 10
        coin.position.z = (Math.random() - 0.5) * 10
        coin.velocity.y = -Math.random() * 2 - 1
      }

      // Update instance matrix
      dummy.position.copy(coin.position)
      dummy.rotation.copy(coin.rotation)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
      <meshStandardMaterial
        color="#FFD700"
        metalness={1}
        roughness={0.1}
        emissive="#FFD700"
        emissiveIntensity={0.3}
      />
    </instancedMesh>
  )
}

export default function Coins3D({ count = 50 }: Coins3DProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9996]">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={75} />

        {/* Lights */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1} />
        <pointLight position={[-10, 0, -10]} color="#FFA500" intensity={0.5} />

        {/* Environment */}
        <Environment preset="sunset" />

        {/* Falling coins */}
        <FallingCoins count={count} />
      </Canvas>
    </div>
  )
}
