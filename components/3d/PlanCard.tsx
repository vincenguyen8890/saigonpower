'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────────────────────
   Three floating plan cards matching the reference:
   • Centre: "Your Savings $87/tháng" (large focal card)
   • Top-right: "Best Plan $112/tháng Tiết kiệm $87"
   • Mid-right: "Current Plan $199/tháng Bạn đang trả cao hơn"
───────────────────────────────────────────────────────────────────────────── */

/* ── Centre Savings Card ───────────────────────────── */
function SavingsCard() {
  const groupRef = useRef<THREE.Group>(null)
  const baseY = 1.9

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.position.y = baseY + Math.sin(clock.getElapsedTime() * 0.9) * 0.06
  })

  return (
    <group ref={groupRef} position={[0.3, baseY, 1.2]}>
      <Html center distanceFactor={6} occlude={false}>
        <div style={{
          width: '168px',
          borderRadius: '20px',
          background: 'white',
          border: '1.5px solid #E2E8F0',
          boxShadow: '0 16px 48px rgba(0,0,0,0.14), 0 4px 12px rgba(0,200,83,0.12)',
          padding: '18px 16px',
        }}>
          {/* Header */}
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Your Savings
          </div>
          {/* Big amount */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#00C853' }}>$</span>
            <span style={{ fontSize: '42px', fontWeight: 900, color: '#00C853', lineHeight: 1 }}>87</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', marginLeft: '2px' }}>/tháng</span>
          </div>
          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#00C853', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>Đã tìm được gói tốt hơn</span>
          </div>
          {/* Progress bar */}
          <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '70%', height: '100%', background: 'linear-gradient(90deg, #00C853, #2979FF)', borderRadius: '3px' }} />
          </div>
        </div>
      </Html>
    </group>
  )
}

/* ── Best Plan Card (top-right) ────────────────────── */
function BestPlanCard() {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const baseY = 2.5

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.position.y = baseY + Math.sin(clock.getElapsedTime() * 1.1 + 1.0) * 0.06
    const t = hovered ? 1.06 : 1.0
    groupRef.current.scale.lerp(new THREE.Vector3(t, t, t), 0.1)
  })

  return (
    <group
      ref={groupRef}
      position={[3.2, baseY, -0.4]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Html center distanceFactor={6} occlude={false} style={{ pointerEvents: 'auto' }}>
        <div style={{
          width: '138px',
          borderRadius: '16px',
          background: 'white',
          border: '1.5px solid #E2E8F0',
          boxShadow: hovered
            ? '0 16px 40px rgba(41,121,255,0.2)'
            : '0 8px 28px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'box-shadow 0.25s ease',
        }}>
          {/* Blue header */}
          <div style={{
            background: 'linear-gradient(135deg, #2979FF, #1A5FCC)',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'white', letterSpacing: '0.04em' }}>Best Plan</span>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
          {/* Body */}
          <div style={{ padding: '12px' }}>
            <div style={{ fontSize: '9px', color: '#94A3B8', marginBottom: '4px' }}>Gói tốt nhất</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1px', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#0F172A' }}>$</span>
              <span style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>112</span>
              <span style={{ fontSize: '9px', color: '#94A3B8', marginLeft: '2px' }}>/tháng</span>
            </div>
            <div style={{
              display: 'inline-block',
              background: '#EDF9F2',
              color: '#00A846',
              borderRadius: '20px',
              padding: '3px 8px',
              fontSize: '9px',
              fontWeight: 700,
              border: '1px solid #A3F0C4',
            }}>
              Tiết kiệm $87
            </div>
          </div>
        </div>
      </Html>
    </group>
  )
}

/* ── Current Plan Card (mid-right) ────────────────── */
function CurrentPlanCard() {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const baseY = 1.3

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.position.y = baseY + Math.sin(clock.getElapsedTime() * 0.85 + 2.2) * 0.055
    const t = hovered ? 1.05 : 1.0
    groupRef.current.scale.lerp(new THREE.Vector3(t, t, t), 0.1)
  })

  return (
    <group
      ref={groupRef}
      position={[3.4, baseY, 1.3]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Html center distanceFactor={6} occlude={false} style={{ pointerEvents: 'auto' }}>
        <div style={{
          width: '138px',
          borderRadius: '16px',
          background: 'white',
          border: '1.5px solid #E2E8F0',
          boxShadow: hovered
            ? '0 12px 32px rgba(0,0,0,0.12)'
            : '0 6px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'box-shadow 0.25s ease',
        }}>
          {/* Gray header */}
          <div style={{
            background: '#F1F5F9',
            padding: '8px 12px',
            borderBottom: '1px solid #E2E8F0',
          }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B' }}>Current Plan</span>
          </div>
          {/* Body */}
          <div style={{ padding: '12px' }}>
            <div style={{ fontSize: '9px', color: '#94A3B8', marginBottom: '4px' }}>Gói hiện tại</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1px', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#0F172A' }}>$</span>
              <span style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>199</span>
              <span style={{ fontSize: '9px', color: '#94A3B8', marginLeft: '2px' }}>/tháng</span>
            </div>
            <div style={{
              display: 'inline-block',
              background: '#FFF7F0',
              color: '#C2410C',
              borderRadius: '20px',
              padding: '3px 8px',
              fontSize: '9px',
              fontWeight: 700,
              border: '1px solid #FDBA74',
            }}>
              Bạn đang trả cao hơn
            </div>
          </div>
        </div>
      </Html>
    </group>
  )
}

export default function PlanCards() {
  return (
    <>
      <SavingsCard />
      <BestPlanCard />
      <CurrentPlanCard />
    </>
  )
}
