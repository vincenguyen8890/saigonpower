'use client'

import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import TexasMap from './TexasMap'
import EnergyLines from './EnergyLines'
import PlanCards from './PlanCard'
import SavingsIndicator from './SavingsIndicator'

/* ─────────────────────────────────────────────────────────────────────────────
   Camera rig: gentle mouse parallax
───────────────────────────────────────────────────────────────────────────── */
function CameraRig() {
  const { camera, size } = useThree()
  const target = useRef(new THREE.Vector3())
  const mouse  = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / size.width  - 0.5) * 2
      mouse.current.y = (e.clientY / size.height - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [size])

  useFrame((_, delta) => {
    target.current.x = mouse.current.x * 0.28
    target.current.y = -mouse.current.y * 0.18
    camera.position.x += (target.current.x           - camera.position.x) * delta * 1.6
    camera.position.y += (target.current.y + 5.8     - camera.position.y) * delta * 1.6
  })
  return null
}

/* ─────────────────────────────────────────────────────────────────────────────
   Background gradient mesh (dark blue → dark teal, like the reference)
───────────────────────────────────────────────────────────────────────────── */
function SceneBackground() {
  return (
    <>
      {/* Main background plane */}
      <mesh position={[0, 3, -8]} scale={[30, 20, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#050e1e" />
      </mesh>
      {/* Subtle teal/green glow bottom-right */}
      <mesh position={[4, -1, -6]}>
        <sphereGeometry args={[5, 16, 16]} />
        <meshBasicMaterial color="#042a18" transparent opacity={0.6} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      {/* Blue glow bottom-left */}
      <mesh position={[-4, 0, -6]}>
        <sphereGeometry args={[5, 16, 16]} />
        <meshBasicMaterial color="#061538" transparent opacity={0.55} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Fallback
───────────────────────────────────────────────────────────────────────────── */
function SceneLoader() {
  return (
    <mesh>
      <boxGeometry args={[0.01, 0.01, 0.01]} />
      <meshBasicMaterial color="#00C853" transparent opacity={0} />
    </mesh>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main scene
───────────────────────────────────────────────────────────────────────────── */
function Scene() {
  return (
    <>
      <CameraRig />
      <SceneBackground />

      {/* Ambient — low, to let emissives pop */}
      <ambientLight intensity={0.25} />

      {/* Key light from top-right */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[512, 512]}
        color="#ffffff"
      />

      {/* Blue fill from the left */}
      <directionalLight position={[-6, 3, -3]} intensity={0.6} color="#2979FF" />

      {/* Green bounce from below map surface */}
      <pointLight position={[0, -1, 1]} intensity={1.2} color="#00C853" distance={9} />

      {/* Blue accent point */}
      <pointLight position={[-3, 2, 3]} intensity={0.7} color="#2979FF" distance={10} />

      {/* Gold sparkle fill */}
      <pointLight position={[3, 1, -1]} intensity={0.4} color="#FFD700" distance={8} />

      <Environment preset="night" />

      <Suspense fallback={<SceneLoader />}>
        <TexasMap />
        <EnergyLines />
        <PlanCards />
        <SavingsIndicator />
      </Suspense>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Exported component
───────────────────────────────────────────────────────────────────────────── */
export default function HeroScene() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: '#050e1e' }}>
        <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 5.8, 10], fov: 40, near: 0.1, far: 80 }}
      gl={{
        antialias: true,
        alpha: false,                                   // solid background
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
    >
      {/* Three.js scene background color */}
      <color attach="background" args={['#050e1e']} />
      <Scene />
    </Canvas>
  )
}
