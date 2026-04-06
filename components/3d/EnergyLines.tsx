'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────────────────────
   Energy flow lines — animated tubes following CatmullRom curves.
   Each line has a "head" that moves forward and fades, giving the impression
   of electricity / data travelling across the Texas map.
───────────────────────────────────────────────────────────────────────────── */

interface FlowLineProps {
  points: [number, number, number][]
  color: string
  speed: number
  width?: number
  delay?: number
}

function FlowLine({ points, color, speed, width = 0.015, delay = 0 }: FlowLineProps) {
  const meshRef   = useRef<THREE.Mesh>(null)
  const matRef    = useRef<THREE.MeshBasicMaterial>(null)
  const progress  = useRef(delay)

  // Build tube geometry once
  const tube = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      points.map(([x, y, z]) => new THREE.Vector3(x, y, z))
    )
    return new THREE.TubeGeometry(curve, 40, width, 5, false)
  }, [points, width])

  useFrame((_, delta) => {
    progress.current = (progress.current + delta * speed) % 2.5
    if (!matRef.current) return
    // Fade in at head, fade out at tail
    const p = progress.current / 2.5
    matRef.current.opacity = Math.max(0, Math.sin(p * Math.PI)) * 0.85 + 0.1
  })

  return (
    <mesh ref={meshRef} geometry={tube}>
      <meshBasicMaterial ref={matRef} color={color} transparent opacity={0.6} depthWrite={false} />
    </mesh>
  )
}

/* Glowing head dot that rides along a CatmullRomCurve */
function TravellingDot({ points, color, speed, delay = 0 }: Omit<FlowLineProps, 'width'>) {
  const meshRef   = useRef<THREE.Mesh>(null)
  const progress  = useRef(delay)

  const curve = useMemo(() =>
    new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z))),
  [points])

  useFrame((_, delta) => {
    progress.current = (progress.current + delta * speed) % 1
    if (!meshRef.current) return
    const pos = curve.getPoint(progress.current)
    meshRef.current.position.copy(pos)
    // pulse scale
    const s = 1 + Math.sin(progress.current * Math.PI * 6) * 0.3
    meshRef.current.scale.setScalar(s)
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  )
}

/* Pre-defined routes across the Texas grid */
const ROUTES: { pts: [number, number, number][]; c1: string; c2: string; spd: number; delay: number }[] = [
  {
    pts: [[-4, 0.1, -1], [-2.5, 0.35, -0.5], [-1, 0.25, 0.2], [0.5, 0.4, 0.8], [1.8, 0.3, 1.2]],
    c1: '#2979FF', c2: '#00C853', spd: 0.38, delay: 0,
  },
  {
    pts: [[-3.5, 0.1, 1.5], [-2, 0.3, 0.8], [0, 0.45, 0.3], [1.5, 0.3, -0.5], [3, 0.1, -1.2]],
    c1: '#2979FF', c2: '#00C853', spd: 0.32, delay: 0.4,
  },
  {
    pts: [[-1.5, 0.1, -2.5], [0, 0.3, -1.5], [1, 0.4, -0.5], [2, 0.3, 0.5], [3, 0.1, 1.5]],
    c1: '#00C853', c2: '#00C853', spd: 0.45, delay: 0.8,
  },
  {
    pts: [[-4, 0.1, 0.5], [-2, 0.25, 0], [0, 0.35, 0.5], [2.5, 0.2, 0]],
    c1: '#2979FF', c2: '#2979FF', spd: 0.28, delay: 1.2,
  },
  {
    pts: [[0, 0.15, -3], [0.5, 0.35, -1.5], [0, 0.5, 0], [-0.5, 0.35, 1.5], [0, 0.15, 3]],
    c1: '#00C853', c2: '#00C853', spd: 0.50, delay: 0.2,
  },
  {
    pts: [[-2, 0.1, -3], [-1, 0.3, -2], [0.5, 0.4, -0.5], [1.5, 0.3, 1], [2.5, 0.1, 2.5]],
    c1: '#2979FF', c2: '#00C853', spd: 0.36, delay: 1.6,
  },
]

export default function EnergyLines() {
  return (
    <group position={[0, -0.55, 0]}>
      {ROUTES.map((r, i) => (
        <group key={i}>
          <FlowLine points={r.pts} color={r.c1} speed={r.spd} delay={r.delay} />
          <TravellingDot points={r.pts} color={r.c2} speed={r.spd * 0.4} delay={r.delay * 0.5} />
        </group>
      ))}
    </group>
  )
}
