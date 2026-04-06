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
   Gentle mouse parallax camera
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
    target.current.x = mouse.current.x * 0.25
    target.current.y = -mouse.current.y * 0.15
    camera.position.x += (target.current.x       - camera.position.x) * delta * 1.5
    camera.position.y += (target.current.y + 5.6 - camera.position.y) * delta * 1.5
  })
  return null
}

function SceneLoader() {
  return (
    <mesh>
      <boxGeometry args={[0.01, 0.01, 0.01]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      <CameraRig />

      {/* Bright ambient for light theme */}
      <ambientLight intensity={1.2} />

      {/* Primary top light */}
      <directionalLight position={[4, 10, 5]} intensity={1.6} castShadow shadow-mapSize={[512, 512]} />

      {/* Blue rim from left */}
      <directionalLight position={[-6, 4, 2]} intensity={0.5} color="#93c5fd" />

      {/* Green bounce under map */}
      <pointLight position={[0, -0.5, 2]} intensity={0.8} color="#4ade80" distance={8} />

      {/* Blue sparkle accent */}
      <pointLight position={[4, 2, -2]} intensity={0.5} color="#60a5fa" distance={10} />

      <Environment preset="city" />

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
   Exported canvas — transparent so the hero gradient shows through
───────────────────────────────────────────────────────────────────────────── */
export default function HeroScene() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="w-full h-full" />
  }

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 5.6, 10], fov: 40, near: 0.1, far: 80 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      style={{ background: 'transparent' }}
    >
      <Scene />
    </Canvas>
  )
}
