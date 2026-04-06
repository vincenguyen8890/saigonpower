'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────────────────────
   Floating plan cards — styled to match reference design
───────────────────────────────────────────────────────────────────────────── */

interface CardData {
  position: [number, number, number]
  price: number
  label: string
  subLabel?: string
  isBest: boolean
  floatOffset: number
  floatSpeed: number
}

const CARDS: CardData[] = [
  {
    position:    [-3.0, 1.5, 0.6],
    price:       210,
    label:       'Plan A',
    subLabel:    'TXU Energy',
    isBest:      false,
    floatOffset: 0,
    floatSpeed:  0.85,
  },
  {
    position:    [0, 2.7, 0.6],
    price:       123,
    label:       'Best Plan',
    subLabel:    'Lowest Rate!',
    isBest:      true,
    floatOffset: Math.PI / 2,
    floatSpeed:  1.0,
  },
  {
    position:    [3.0, 1.5, 0.6],
    price:       180,
    label:       'Plan B',
    subLabel:    'Reliant Energy',
    isBest:      false,
    floatOffset: Math.PI,
    floatSpeed:  0.75,
  },
]

function SingleCard({ data }: { data: CardData }) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const baseY = data.position[1]

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.position.y = baseY + Math.sin(t * data.floatSpeed + data.floatOffset) * 0.07
    const target = data.isBest ? (hovered ? 1.12 : 1.06) : (hovered ? 1.06 : 1.0)
    groupRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.1)
  })

  return (
    <group
      ref={groupRef}
      position={[data.position[0], baseY, data.position[2]]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Html center distanceFactor={6} occlude={false} style={{ pointerEvents: 'auto' }}>
        {data.isBest ? (
          /* ── Best plan card — vivid green ──────────────────── */
          <div style={{
            width: '148px',
            borderRadius: '16px',
            background: 'linear-gradient(145deg, #00C853 0%, #00A846 100%)',
            border: '2px solid rgba(255,255,255,0.35)',
            boxShadow: '0 16px 48px rgba(0,200,83,0.5), 0 0 0 1px rgba(0,200,83,0.3)',
            padding: '16px 14px',
            textAlign: 'center',
            cursor: 'pointer',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.08em', marginBottom: '8px', textTransform: 'uppercase' }}>
              {data.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '1px', marginBottom: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 900, color: 'white' }}>$</span>
              <span style={{ fontSize: '36px', fontWeight: 900, color: 'white', lineHeight: 1 }}>{data.price}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>/mo</span>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.22)',
              borderRadius: '20px',
              padding: '4px 10px',
              fontSize: '9px',
              fontWeight: 800,
              color: 'white',
              letterSpacing: '0.04em',
              border: '1px solid rgba(255,255,255,0.3)',
            }}>
              {data.subLabel}
            </div>
          </div>
        ) : (
          /* ── Regular plan card — glassy white ─────────────── */
          <div style={{
            width: '120px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            boxShadow: hovered
              ? '0 12px 32px rgba(41,121,255,0.25)'
              : '0 8px 24px rgba(0,0,0,0.35)',
            padding: '14px 12px',
            textAlign: 'center',
            transition: 'box-shadow 0.25s ease',
            cursor: 'pointer',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em', marginBottom: '6px', textTransform: 'uppercase' }}>
              {data.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '1px' }}>
              <span style={{ fontSize: '12px', fontWeight: 900, color: 'white' }}>$</span>
              <span style={{ fontSize: '28px', fontWeight: 900, color: 'white', lineHeight: 1 }}>{data.price}</span>
            </div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>/month</div>
          </div>
        )}
      </Html>

      {/* Green glow halo for best plan */}
      {data.isBest && <BestGlow />}
    </group>
  )
}

function BestGlow() {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    ;(meshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.07 + Math.sin(t * 1.8) * 0.05
    meshRef.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.1)
  })
  return (
    <mesh ref={meshRef} position={[0, 0, -0.15]}>
      <planeGeometry args={[1.6, 1.1]} />
      <meshBasicMaterial color="#00C853" transparent opacity={0.1} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

export default function PlanCards() {
  return (
    <>
      {CARDS.map((card, i) => (
        <SingleCard key={i} data={card} />
      ))}
    </>
  )
}
