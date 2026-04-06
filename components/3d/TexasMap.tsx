'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────────────────────
   Approximate Texas outline in local XY space.
   After mesh rotation [-PI/2, 0, 0]:  shape X → world X,  shape Y → world Z
───────────────────────────────────────────────────────────────────────────── */
const TX_VERTS: [number, number][] = [
  [-4.0, -3.0], // NW panhandle
  [-0.8, -3.0], // Panhandle NE
  [-0.8, -1.9], // Panhandle bottom (OK border join)
  [ 3.2, -1.9], // NE corner (Red River)
  [ 3.6, -0.4], // E border
  [ 3.3,  1.2], // SE coast (Sabine)
  [ 2.8,  2.2], // Gulf coast turn
  [ 1.8,  3.0], // Corpus area
  [ 0.6,  3.2], // South tip (Brownsville)
  [-0.4,  2.8], // Rio Grande
  [-1.8,  2.0], // Rio Grande mid
  [-3.6,  0.9], // Big Bend / Del Rio
  [-4.0,  0.4], // El Paso (west)
]

// Grid network city nodes (world XZ)
const NODES: [number, number][] = [
  [-2.8, -2.5], // Amarillo
  [-1.8, -1.8], // Lubbock
  [-0.5, -1.4], // Wichita Falls
  [ 1.5, -1.0], // Dallas
  [ 2.3, -0.7], // Tyler / East TX
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

/* ── Solid extruded Texas platform ────────────────────────────────────────── */
function TexasPlatform() {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(TX_VERTS[0][0], TX_VERTS[0][1])
    for (let i = 1; i < TX_VERTS.length; i++) s.lineTo(TX_VERTS[i][0], TX_VERTS[i][1])
    s.closePath()
    return s
  }, [])

  const extrude = { depth: 0.55, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 }

  return (
    <group>
      {/* Main dark-navy extruded body */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <extrudeGeometry args={[shape, extrude]} />
        <meshStandardMaterial color="#0d1e3e" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Top surface — dark teal with faint green emissive */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial
          color="#0e2e22"
          roughness={0.75}
          emissive="#00C853"
          emissiveIntensity={0.06}
        />
      </mesh>

      {/* Dark floor plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.57, 0]}>
        <planeGeometry args={[13, 10]} />
        <meshStandardMaterial color="#040d1a" roughness={1} />
      </mesh>
    </group>
  )
}

/* ── Pulsing grid node ────────────────────────────────────────────────────── */
function NodePulse({ x, z, phase }: { x: number; z: number; phase: number }) {
  const outerRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phase
    if (outerRef.current) {
      const s = 0.7 + Math.sin(t * 2.0) * 0.35
      outerRef.current.scale.setScalar(s)
      ;(outerRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.abs(Math.sin(t * 2.0)) * 0.2
    }
    if (innerRef.current) {
      ;(innerRef.current.material as THREE.MeshBasicMaterial).opacity = 0.55 + Math.sin(t * 2.8) * 0.35
    }
  })

  return (
    <group position={[x, 0.03, z]}>
      {/* Outer ring glow */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.2} depthWrite={false} />
      </mesh>
      {/* Inner bright dot */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.75} />
      </mesh>
    </group>
  )
}

/* ── Yellow grid network ──────────────────────────────────────────────────── */
function GridNetwork() {
  const lineGeo = useMemo(() => {
    const pts: THREE.Vector3[] = []
    CONNECTIONS.forEach(([a, b]) => {
      pts.push(new THREE.Vector3(NODES[a][0], 0.025, NODES[a][1]))
      pts.push(new THREE.Vector3(NODES[b][0], 0.025, NODES[b][1]))
    })
    const g = new THREE.BufferGeometry()
    g.setFromPoints(pts)
    return g
  }, [])

  return (
    <group>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color="#FFD700" transparent opacity={0.5} />
      </lineSegments>
      {NODES.map(([x, z], i) => (
        <NodePulse key={i} x={x} z={z} phase={i * 0.48} />
      ))}
    </group>
  )
}

/* ── Mini city buildings / power towers ──────────────────────────────────── */
function MiniBuildings() {
  // [worldX, worldZ, height]
  const towers: [number, number, number][] = [
    [ 2.7,  0.7, 0.28], // Houston
    [ 1.3, -0.9, 0.24], // Dallas
    [-2.3,  0.1, 0.15], // Midland
  ]

  return (
    <>
      {towers.map(([x, z, h], i) => (
        <group key={i} position={[x, h / 2, z]}>
          {/* Tower body */}
          <mesh castShadow>
            <boxGeometry args={[0.1, h, 0.1]} />
            <meshStandardMaterial color="#162d52" emissive="#2979FF" emissiveIntensity={0.3} metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Beacon */}
          <mesh position={[0, h / 2 + 0.045, 0]}>
            <sphereGeometry args={[0.028, 6, 6]} />
            <meshBasicMaterial color="#2979FF" />
          </mesh>
          {/* Legs */}
          {[[ 0.07, 0.07], [-0.07, -0.07], [ 0.07, -0.07], [-0.07, 0.07]].map(([lx, lz], j) => (
            <mesh key={j} position={[lx, -h * 0.28, lz]} rotation={[0, 0, lx > 0 ? 0.45 : -0.45]}>
              <boxGeometry args={[0.012, h * 0.55, 0.012]} />
              <meshStandardMaterial color="#162d52" />
            </mesh>
          ))}
        </group>
      ))}
    </>
  )
}

export default function TexasMap() {
  return (
    <group position={[0, -0.55, 0]}>
      <TexasPlatform />
      <GridNetwork />
      <MiniBuildings />
    </group>
  )
}
