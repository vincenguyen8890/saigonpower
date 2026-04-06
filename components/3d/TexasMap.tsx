'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────────────────────
   Stylised Texas platform:
   - Flat grid base with subtle height-noise tiles (represents landscape)
   - Thin glowing grid lines on top
   - A faint dot-glow pulse in the centre
───────────────────────────────────────────────────────────────────────────── */

/* Grid-line helper */
function GridLines() {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = []
    const half = 4
    const step = 0.6
    for (let x = -half; x <= half; x += step) {
      pts.push(new THREE.Vector3(x, 0, -half))
      pts.push(new THREE.Vector3(x, 0,  half))
    }
    for (let z = -half; z <= half; z += step) {
      pts.push(new THREE.Vector3(-half, 0, z))
      pts.push(new THREE.Vector3( half, 0, z))
    }
    const g = new THREE.BufferGeometry()
    g.setFromPoints(pts)
    return g
  }, [])

  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#2979FF" transparent opacity={0.08} />
    </lineSegments>
  )
}

/* Instanced terrain tiles */
function TerrainTiles() {
  const mesh = useRef<THREE.InstancedMesh>(null)

  const { positions, heights } = useMemo(() => {
    const cols  = 14
    const rows  = 9
    const gap   = 0.58
    const offX  = -(cols - 1) * gap * 0.5
    const offZ  = -(rows - 1) * gap * 0.5
    const pos: [number, number, number][] = []
    const h: number[] = []
    // Rough Texas shape mask (wider left, narrower right bottom)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = c / (cols - 1)   // 0..1 left→right
        const nz = r / (rows - 1)   // 0..1 top→bottom
        // Texas-ish silhouette: rectangular upper half, narrowing lower right
        const inShape =
          (nz < 0.5) ||                           // upper half: full width
          (nz < 0.75 && nx < 0.9) ||              // mid band
          (nz >= 0.75 && nx < 0.65)               // lower: Panhandle+body, drop east
        if (!inShape) continue
        const x = offX + c * gap
        const z = offZ + r * gap
        const ht = Math.max(0.02, Math.abs(Math.sin(c * 0.8) * Math.cos(r * 0.9)) * 0.04)
        pos.push([x, ht * 0.5, z])
        h.push(ht)
      }
    }
    return { positions: pos, heights: h }
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Set instance matrices once
  useMemo(() => {
    if (!mesh.current) return
    positions.forEach(([x, y, z], i) => {
      dummy.position.set(x, y, z)
      dummy.scale.set(0.52, heights[i] * 2 + 0.01, 0.52)
      dummy.updateMatrix()
      mesh.current!.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refTick = useRef(0)
  useFrame((_, delta) => {
    refTick.current += delta * 0.4
    if (!mesh.current) return
    positions.forEach(([x, y, z], i) => {
      const wave = Math.sin(refTick.current + x * 1.2 + z * 0.8) * 0.005
      dummy.position.set(x, y + wave, z)
      dummy.scale.set(0.52, heights[i] * 2 + 0.01, 0.52)
      dummy.updateMatrix()
      mesh.current!.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, positions.length]} receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#E8F4FD"
        roughness={0.9}
        metalness={0.05}
      />
    </instancedMesh>
  )
}

/* Central glow pulse */
function CentrePulse() {
  const mesh = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!mesh.current) return
    const t = clock.getElapsedTime()
    const mat = mesh.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.06 + Math.sin(t * 1.6) * 0.04
    mesh.current.scale.setScalar(1 + Math.sin(t * 1.0) * 0.08)
  })
  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0.5]}>
      <circleGeometry args={[2.2, 48]} />
      <meshBasicMaterial color="#00C853" transparent opacity={0.08} depthWrite={false} />
    </mesh>
  )
}

export default function TexasMap() {
  return (
    <group position={[0, -0.6, 0]}>
      {/* Base shadow plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial color="#EBF2FF" roughness={1} />
      </mesh>

      <TerrainTiles />
      <GridLines />
      <CentrePulse />
    </group>
  )
}
