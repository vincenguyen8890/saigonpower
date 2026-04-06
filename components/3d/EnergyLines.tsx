'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────────────────────
   Orbital arc rings + sparkle particles
   Replaces the old flow-line tubes with dramatic sweeping rings that
   orbit the Texas map, matching the reference design.
───────────────────────────────────────────────────────────────────────────── */

/* Build an elliptical CatmullRomCurve3, tilted in 3D space */
function makeOrbitalCurve(
  rx: number, rz: number,
  tiltX: number, tiltZ: number,
  yOffset = 0,
): THREE.CatmullRomCurve3 {
  const n = 80
  const mX = new THREE.Matrix4().makeRotationX(tiltX)
  const mZ = new THREE.Matrix4().makeRotationZ(tiltZ)
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2
    const p = new THREE.Vector3(Math.cos(t) * rx, yOffset, Math.sin(t) * rz)
    p.applyMatrix4(mZ)
    p.applyMatrix4(mX)
    pts.push(p)
  }
  return new THREE.CatmullRomCurve3(pts, true)
}

/* Glowing dot that travels along a curve */
function TravelDot({
  curve, color, size = 0.065, speed, delay = 0,
}: {
  curve: THREE.CatmullRomCurve3
  color: string
  size?: number
  speed: number
  delay?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const progress = useRef(delay)

  useFrame((_, delta) => {
    progress.current = (progress.current + delta * speed) % 1
    if (!meshRef.current) return
    meshRef.current.position.copy(curve.getPoint(progress.current))
    const s = 1 + Math.sin(progress.current * Math.PI * 10) * 0.35
    meshRef.current.scale.setScalar(s)
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.95} depthWrite={false} />
    </mesh>
  )
}

/* One complete orbital ring */
interface RingDef {
  rx: number; rz: number; tiltX: number; tiltZ: number; yOffset?: number
  color: string; dotColor: string
  opacity: number; tubeRadius: number
  dotSpeed: number; dotDelay?: number; dotSize?: number
  shimmerSpeed?: number
}

function OrbitalRing({
  rx, rz, tiltX, tiltZ, yOffset = 0,
  color, dotColor,
  opacity, tubeRadius,
  dotSpeed, dotDelay = 0, dotSize,
  shimmerSpeed = 0.6,
}: RingDef) {
  const curve = useMemo(
    () => makeOrbitalCurve(rx, rz, tiltX, tiltZ, yOffset),
    [rx, rz, tiltX, tiltZ, yOffset],
  )
  const tube = useMemo(
    () => new THREE.TubeGeometry(curve, 128, tubeRadius, 6, true),
    [curve, tubeRadius],
  )

  const matRef = useRef<THREE.MeshBasicMaterial>(null)
  useFrame(({ clock }) => {
    if (matRef.current) {
      const t = clock.getElapsedTime()
      matRef.current.opacity = opacity * (0.65 + Math.sin(t * shimmerSpeed + dotDelay) * 0.35)
    }
  })

  return (
    <group>
      <mesh geometry={tube}>
        <meshBasicMaterial
          ref={matRef}
          color={color}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>
      <TravelDot curve={curve} color={dotColor} speed={dotSpeed} delay={dotDelay} size={dotSize} />
    </group>
  )
}

/* Ambient gold sparkles scattered throughout the scene */
function Sparkles() {
  const count = 110
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 14
      pos[i * 3 + 1] = Math.random() * 5.5 - 0.6
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  const matRef = useRef<THREE.PointsMaterial>(null)
  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.opacity = 0.28 + Math.sin(clock.getElapsedTime() * 0.5) * 0.14
    }
  })

  return (
    <points geometry={geo}>
      <pointsMaterial
        ref={matRef}
        color="#FFD700"
        size={0.055}
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

/* Second set of white/blue sparkles for variety */
function BlueSpark() {
  const count = 60
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 13
      pos[i * 3 + 1] = Math.random() * 4.0 - 0.4
      pos[i * 3 + 2] = (Math.random() - 0.5) * 11
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  const matRef = useRef<THREE.PointsMaterial>(null)
  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.opacity = 0.18 + Math.sin(clock.getElapsedTime() * 0.7 + 1.2) * 0.12
    }
  })

  return (
    <points geometry={geo}>
      <pointsMaterial
        ref={matRef}
        color="#60c8ff"
        size={0.042}
        transparent
        opacity={0.22}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

/* ── Ring definitions ──────────────────────────────────────────────────────── */
const RINGS: RingDef[] = [
  // Left-tilt blue ring
  {
    rx: 5.8, rz: 3.5, tiltX:  0.42, tiltZ:  0.05, yOffset: 0.6,
    color: '#2979FF', dotColor: '#93c5fd',
    opacity: 0.55, tubeRadius: 0.024,
    dotSpeed: 0.22, dotDelay: 0.0, dotSize: 0.065, shimmerSpeed: 0.5,
  },
  // Right-tilt green ring
  {
    rx: 6.2, rz: 3.8, tiltX: -0.32, tiltZ:  0.18, yOffset: 0.4,
    color: '#00C853', dotColor: '#FFD700',
    opacity: 0.42, tubeRadius: 0.022,
    dotSpeed: 0.18, dotDelay: 0.55, dotSize: 0.065, shimmerSpeed: 0.65,
  },
  // Flatter golden ring
  {
    rx: 5.3, rz: 3.2, tiltX:  0.55, tiltZ: -0.22, yOffset: 0.2,
    color: '#FFD700', dotColor: '#FFD700',
    opacity: 0.28, tubeRadius: 0.016,
    dotSpeed: 0.30, dotDelay: 0.35, dotSize: 0.050, shimmerSpeed: 0.8,
  },
]

export default function EnergyLines() {
  return (
    <group>
      {RINGS.map((r, i) => <OrbitalRing key={i} {...r} />)}
      <Sparkles />
      <BlueSpark />
    </group>
  )
}
