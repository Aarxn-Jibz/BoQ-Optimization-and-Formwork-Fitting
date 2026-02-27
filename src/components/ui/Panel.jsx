// ─── src/components/ui/Panel.jsx ────────────────────────────
import React from 'react'

export function Panel({ children, style, hover = true, accentColor = 'var(--color-cyan)', onClick }) {
  const [hovered, setHovered] = React.useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: 'var(--color-void)',
        border: `1px solid ${hovered ? 'rgba(0,212,255,0.22)' : 'var(--color-border)'}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color var(--motion-fast), box-shadow var(--motion-fast)',
        boxShadow: hovered ? 'var(--shadow-cyan)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, ${accentColor} 0%, transparent 65%)`,
        opacity: hovered ? 0.7 : 0.3,
        transition: 'opacity var(--motion-fast)',
      }} />
      {children}
    </div>
  )
}

export function PanelHeader({ children, style }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 16px',
      borderBottom: '1px solid var(--color-border)',
      background: 'rgba(0,212,255,0.015)',
      gap: 12,
      flexWrap: 'wrap',
      ...style,
    }}>
      {children}
    </div>
  )
}

export function PanelTitle({ children, icon }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--color-text)',
    }}>
      {icon && <span style={{ color: 'var(--color-cyan)', display: 'flex' }}>{icon}</span>}
      {children}
    </div>
  )
}

export function PanelActions({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {children}
    </div>
  )
}
