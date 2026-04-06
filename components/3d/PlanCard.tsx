'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────────────────────
   Floating plan cards rendered as DOM elements inside the 3D scene via
   @react-three/drei's <Html> — gives us full CSS/React power at a 3D position.
───────────────────────────────────────────────────────────────────────────── */

interface CardData {
  position: [number, number, number]
  price: number
  label: string
  provider: string
  rate: string
  term: string
  isBest: boolean
  floatOffset: number   // phase offset for floating animation
  floatSpeed: number
}

const CARDS: CardData[] = [
  {
    position:    [-2.6, 1.6, 0.8],
    price:       210,
    label:       'Current Plan',
    provider:    'TXU Energy',
    rate:        '14.2¢/kWh',
    term:        'Month-to-month',
    isBest:      false,
    floatOffset: 0,
    floatSpeed:  0.9,
  },
  {
    position:    [0, 2.4, 0.8],
    price:       123,
    label:       'Best Plan ✦',
    provider:    'Gexa Energy',
    rate:        '9.8¢/kWh',
    term:        '12-month fixed',
    isBest:      true,
    floatOffset: Math.PI / 2,
    floatSpeed:  1.1,
  },
  {
    position:    [2.6, 1.6, 0.8],
    price:       180,
    label:       'Alternative',
    provider:    'Reliant',
    rate:        '11.4¢/kWh',
    term:        '6-month fixed',
    isBest:      false,
    floatOffset: Math.PI,
    floatSpeed:  0.8,
  },
]

function SingleCard({ data }: { data: CardData }) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const baseY = data.position[1]

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    const floatY = Math.sin(t * data.floatSpeed + data.floatOffset) * 0.06
    groupRef.current.position.y = baseY + floatY
    // Smooth scale toward target
    const targetScale = data.isBest ? (hovered ? 1.12 : 1.05) : (hovered ? 1.06 : 1.0)
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08)
  })

  return (
    <group
      ref={groupRef}
      position={[data.position[0], baseY, data.position[2]]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Html
        center
        distanceFactor={6}
        style={{ pointerEvents: 'auto' }}
        occlude={false}
      >
        <div
          className="select-none"
          style={{
            width: data.isBest ? '148px' : '128px',
            borderRadius: '16px',
            background: data.isBest
              ? 'linear-gradient(145deg, #ffffff 0%, #f0fff8 100%)'
              : 'rgba(255,255,255,0.92)',
            border: data.isBest ? '2px solid #00C853' : '1.5px solid #E2E8F0',
            boxShadow: data.isBest
              ? '0 12px 40px rgba(0,200,83,0.25), 0 4px 16px rgba(0,0,0,0.08)'
              : hovered
                ? '0 8px 24px rgba(0,0,0,0.12)'
                : '0 4px 16px rgba(0,0,0,0.08)',
            padding: data.isBest ? '14px 12px' : '12px 10px',
            transition: 'box-shadow 0.25s ease',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Label */}
          <div style={{
            fontSize: data.isBest ? '9px' : '8px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: data.isBest ? '#00C853' : '#64748B',
            marginBottom: '6px',
          }}>
            {data.label}
          </div>

          {/* Provider */}
          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '4px', fontWeight: 500 }}>
            {data.provider}
          </div>

          {/* Price */}
          <div style={{
            fontSize: data.isBest ? '26px' : '22px',
            fontWeight: 900,
            color: data.isBest ? '#00C853' : '#0F172A',
            lineHeight: 1,
            marginBottom: '2px',
          }}>
            ${data.price}
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>/mo</span>
          </div>

          {/* Rate */}
          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px' }}>
            {data.rate}
          </div>

          {/* Term badge */}
          <div style={{
            display: 'inline-block',
            fontSize: '8px',
            fontWeight: 700,
            padding: '3px 7px',
            borderRadius: '20px',
            background: data.isBest ? 'rgba(0,200,83,0.12)' : 'rgba(41,121,255,0.08)',
            color: data.isBest ? '#00A846' : '#2979FF',
            border: data.isBest ? '1px solid rgba(0,200,83,0.25)' : '1px solid rgba(41,121,255,0.2)',
          }}>
            {data.term}
          </div>

          {/* Best plan CTA */}
          {data.isBest && (
            <div style={{
              marginTop: '10px',
              background: '#00C853',
              color: 'white',
              borderRadius: '8px',
              padding: '6px 0',
              fontSize: '9px',
              fontWeight: 800,
              textAlign: 'center',
              letterSpacing: '0.04em',
              cursor: 'pointer',
            }}>
              SELECT PLAN →
            </div>
          )}
        </div>
      </Html>

      {/* Glow halo for best plan */}
      {data.isBest && <BestPlanGlow />}
    </group>
  )
}

function BestPlanGlow() {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    const mat = meshRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.06 + Math.sin(t * 2.0) * 0.04
    const s = 1 + Math.sin(t * 1.4) * 0.08
    meshRef.current.scale.setScalar(s)
  })
  return (
    <mesh ref={meshRef} position={[0, -0.05, -0.1]}>
      <planeGeometry args={[1.4, 1.0]} />
      <meshBasicMaterial color="#00C853" transparent opacity={0.08} depthWrite={false} side={THREE.DoubleSide} />
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
