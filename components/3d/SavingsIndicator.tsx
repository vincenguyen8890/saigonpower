'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────────────────────
   Floating savings badge that pulses above the best plan card.
───────────────────────────────────────────────────────────────────────────── */

export default function SavingsIndicator() {
  const groupRef = useRef<THREE.Group>(null)
  const appeared = useRef(false)
  const scaleRef = useRef(0)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()

    // Appear after 1 second with spring-scale-in
    if (t > 1.0 && scaleRef.current < 1) {
      scaleRef.current = Math.min(1, scaleRef.current + 0.04)
      appeared.current = true
    }

    // Float
    groupRef.current.position.y = 3.2 + Math.sin(t * 1.3) * 0.04
    groupRef.current.scale.setScalar(scaleRef.current)
  })

  return (
    <group ref={groupRef} position={[0, 3.2, 1.0]} scale={0}>
      <Html center distanceFactor={6} occlude={false}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #00C853, #00A846)',
            color: 'white',
            borderRadius: '100px',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 24px rgba(0,200,83,0.45), 0 2px 8px rgba(0,0,0,0.10)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            letterSpacing: '0.02em',
          }}
        >
          <span style={{ fontSize: '14px' }}>⚡</span>
          Save $87/month
          <span style={{
            background: 'rgba(255,255,255,0.25)',
            borderRadius: '20px',
            padding: '2px 7px',
            fontSize: '10px',
            fontWeight: 700,
          }}>
            41% OFF
          </span>
        </div>
      </Html>

      {/* Arrow pointing down to best card */}
      <mesh position={[0, -0.28, 0]}>
        <coneGeometry args={[0.06, 0.18, 8]} />
        <meshBasicMaterial color="#00C853" />
      </mesh>
    </group>
  )
}
