'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────────────────────
   Light-theme Texas map: white/pale-blue extruded platform with green grid
───────────────────────────────────────────────────────────────────────────── */

// Texas outline — Shape XY → after rotation[-PI/2]: shape X=worldX, shape Y=worldZ
const TX_VERTS: [number, number][] = [
  [-4.0, -3.0], [-0.8, -3.0], [-0.8, -1.9],
  [ 3.2, -1.9], [ 3.6, -0.4], [ 3.3,  1.2],
  [ 2.8,  2.2], [ 1.8,  3.0], [ 0.6,  3.2],
  [-0.4,  2.8], [-1.8,  2.0], [-3.6,  0.9],
  [-4.0,  0.4],
]

// Grid network nodes in world XZ (Texas cities)
const NODES: [number, number][] = [
  [-2.8, -2.5], // Amarillo
  [-1.8, -1.8], // Lubbock
  [-0.5, -1.4], // Wichita Falls
  [ 1.5, -1.0], // Dallas
  [ 2.3, -0.7], // East TX
  [ 2.8,  0.8], // Houston
  [-2.5,  0.1], // Midland/Odessa
  [ 0.5,  0.3], // Austin
  [ 0.2,  1.6], // San Antonio
  [ 1.5,  2.5], // Corpus Christi
  [-1.2,  1.4], // Laredo
]

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
  [1, 6], [6, 7], [3, 7], [5, 7],
  [7, 8], [8, 9], [8, 10], [10, 6],
]

/* ── Solid extruded Texas platform ─────────────────── */
function TexasPlatform() {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(TX_VERTS[0][0], TX_VERTS[0][1])
    for (let i = 1; i < TX_VERTS.length; i++) s.lineTo(TX_VERTS[i][0], TX_VERTS[i][1])
    s.closePath()
    return s
  }, [])

  const extrude = { depth: 0.5, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3 }

  return (
    <group>
      {/* Main body — light gray-blue, like a 3D-printed map */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <extrudeGeometry args={[shape, extrude]} />
        <meshStandardMaterial color="#D8E8F4" roughness={0.5} metalness={0.05} />
      </mesh>

      {/* Top surface — slightly lighter */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color="#EAF3FA" roughness={0.65} />
      </mesh>

      {/* Soft shadow / base plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, 0]} receiveShadow>
        <planeGeometry args={[13, 10]} />
        <shadowMaterial opacity={0.08} />
      </mesh>
    </group>
  )
}

/* ── Pulsing green node ────────────────────────────── */
function NodePulse({ x, z, phase }: { x: number; z: number; phase: number }) {
  const outerRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phase
    if (outerRef.current) {
      outerRef.current.scale.setScalar(0.7 + Math.abs(Math.sin(t * 1.8)) * 0.45)
      ;(outerRef.current.material as THREE.MeshBasicMaterial).opacity = 0.12 + Math.abs(Math.sin(t * 1.8)) * 0.18
    }
    if (innerRef.current) {
      ;(innerRef.current.material as THREE.MeshBasicMaterial).opacity = 0.55 + Math.sin(t * 2.6) * 0.35
    }
  })

  return (
    <group position={[x, 0.03, z]}>
      <mesh ref={outerRef}>
        <sphereGeometry args={[0.13, 8, 8]} />
        <meshBasicMaterial color="#00C853" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshBasicMaterial color="#00C853" transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

/* ── Green grid lines ────────────────────────────────── */
function GridNetwork() {
  const lineGeo = useMemo(() => {
    const pts: THREE.Vector3[] = []
    CONNECTIONS.forEach(([a, b]) => {
      pts.push(new THREE.Vector3(NODES[a][0], 0.022, NODES[a][1]))
      pts.push(new THREE.Vector3(NODES[b][0], 0.022, NODES[b][1]))
    })
    const g = new THREE.BufferGeometry()
    g.setFromPoints(pts)
    return g
  }, [])

  return (
    <group>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color="#00C853" transparent opacity={0.45} />
      </lineSegments>
      {NODES.map(([x, z], i) => (
        <NodePulse key={i} x={x} z={z} phase={i * 0.5} />
      ))}
    </group>
  )
}

/* ── Energy button puck (south of Texas, centre) ─── */
function EnergyButton() {
  const ringRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ringRef.current)  ringRef.current.rotation.z  = t * 0.8
    if (glowRef.current)  (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.18 + Math.sin(t * 2.0) * 0.1
    if (innerRef.current) innerRef.current.scale.setScalar(1 + Math.sin(t * 2.5) * 0.06)
  })

  return (
    <group position={[0.4, 0.05, 2.5]}>
      {/* Base disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.42, 0.06, 32]} />
        <meshStandardMaterial color="#1a3a2a" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Green glow disc */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[0.45, 32]} />
        <meshBasicMaterial color="#00C853" transparent opacity={0.22} depthWrite={false} />
      </mesh>

      {/* Outer orbital ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[0.5, 0.54, 48]} />
        <meshBasicMaterial color="#2979FF" transparent opacity={0.75} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner lightning glow */}
      <mesh ref={innerRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <circleGeometry args={[0.28, 24]} />
        <meshBasicMaterial color="#00C853" transparent opacity={0.45} depthWrite={false} />
      </mesh>

      {/* Point light for glow effect */}
      <pointLight position={[0, 0.3, 0]} intensity={0.9} color="#00C853" distance={3} />
    </group>
  )
}

export default function TexasMap() {
  return (
    <group position={[0, -0.55, 0]}>
      <TexasPlatform />
      <GridNetwork />
      <EnergyButton />
    </group>
  )
}
