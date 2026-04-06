'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────────────────────
   "Save $87/month" badge — positioned at the front-bottom of the map,
   matching the reference image layout.
───────────────────────────────────────────────────────────────────────────── */

export default function SavingsIndicator() {
  const groupRef = useRef<THREE.Group>(null)
  const scaleRef = useRef(0)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()

    // Spring in after 1 s
    if (t > 1.0 && scaleRef.current < 1) {
      scaleRef.current = Math.min(1, scaleRef.current + 0.035)
    }

    // Gentle float
    groupRef.current.position.y = 0.35 + Math.sin(t * 1.1) * 0.04
    groupRef.current.scale.setScalar(scaleRef.current)
  })

  return (
    <group ref={groupRef} position={[0, 0.35, 3.4]} scale={0}>
      <Html center distanceFactor={6} occlude={false}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'linear-gradient(135deg, #00C853, #00A846)',
          color: 'white',
          borderRadius: '100px',
          padding: '10px 22px',
          fontSize: '14px',
          fontWeight: 900,
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 32px rgba(0,200,83,0.55), 0 2px 8px rgba(0,0,0,0.3)',
          border: '1.5px solid rgba(255,255,255,0.3)',
          letterSpacing: '0.01em',
        }}>
          Save{' '}
          <span style={{ fontSize: '18px', fontWeight: 900 }}>$87</span>
          /month
        </div>
      </Html>
    </group>
  )
}
