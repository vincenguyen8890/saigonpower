'use client'

import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'
import TexasMap from './TexasMap'
import EnergyLines from './EnergyLines'
import PlanCards from './PlanCard'
import SavingsIndicator from './SavingsIndicator'

/* ─────────────────────────────────────────────────────────────────────────────
   Camera rig: follows mouse for a gentle parallax effect
───────────────────────────────────────────────────────────────────────────── */
function CameraRig() {
  const { camera, size } = useThree()
  const target = useRef(new THREE.Vector3(0, 0, 0))
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
    // Gentle parallax — max ±0.35 units on each axis
    target.current.x = mouse.current.x * 0.35
    target.current.y = -mouse.current.y * 0.20
    camera.position.x += (target.current.x - camera.position.x) * delta * 1.8
    camera.position.y += (target.current.y + 5.5 - camera.position.y) * delta * 1.8
  })
  return null
}

/* ─────────────────────────────────────────────────────────────────────────────
   Soft ambient glow sphere behind the centre
───────────────────────────────────────────────────────────────────────────── */
function BackGlow() {
  const mesh = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!mesh.current) return
    const mat = mesh.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.12 + Math.sin(clock.getElapsedTime() * 0.8) * 0.04
  })
  return (
    <mesh ref={mesh} position={[0, 1.2, -1]}>
      <sphereGeometry args={[3.5, 20, 20]} />
      <meshBasicMaterial color="#00C853" transparent opacity={0.12} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Fallback loader shown inside <Suspense>
───────────────────────────────────────────────────────────────────────────── */
function SceneLoader() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshBasicMaterial color="#00C853" transparent opacity={0} />
    </mesh>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main 3D scene (runs inside <Canvas>)
───────────────────────────────────────────────────────────────────────────── */
function Scene() {
  return (
    <>
      {/* Camera parallax rig */}
      <CameraRig />

      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[4, 8, 4]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <directionalLight position={[-4, 4, -4]} intensity={0.3} color="#2979FF" />
      <pointLight position={[0, 3, 2]} intensity={0.8} color="#00C853" distance={8} />

      {/* Environment for subtle reflections */}
      <Environment preset="dawn" />

      {/* Background glow */}
      <BackGlow />

      {/* Scene objects */}
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
   Public component — exported and used in the Hero
───────────────────────────────────────────────────────────────────────────── */
export default function HeroScene() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface-bg">
        <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}                         // cap pixel ratio for perf
      camera={{ position: [0, 5.5, 9], fov: 42, near: 0.1, far: 60 }}
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
