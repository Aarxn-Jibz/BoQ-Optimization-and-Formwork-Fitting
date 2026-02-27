// ─── src/components/ui/index.jsx ────────────────────────────
import React, { useState } from 'react'

/* ── Badge ─────────────────────────────────────────────────── */
const BADGE_STYLES = {
  ok:      { background: 'rgba(0,212,255,0.1)',   color: '#00D4FF', border: '1px solid rgba(0,212,255,0.25)' },
  up:      { background: 'rgba(63,185,80,0.12)',  color: '#3FB950', border: '1px solid rgba(63,185,80,0.3)'  },
  down:    { background: 'rgba(248,81,73,0.12)',  color: '#F85149', border: '1px solid rgba(248,81,73,0.3)'  },
  warn:    { background: 'rgba(210,153,34,0.12)', color: '#D29922', border: '1px solid rgba(210,153,34,0.3)' },
  neutral: { background: 'rgba(125,133,144,0.12)', color: '#7D8590', border: '1px solid rgba(125,133,144,0.25)' },
  err:     { background: 'rgba(248,81,73,0.12)',  color: '#F85149', border: '1px solid rgba(248,81,73,0.3)'  },
}

export function Badge({ variant = 'ok', children, style }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      padding: '2px 6px',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      ...BADGE_STYLES[variant],
      ...style,
    }}>
      {children}
    </span>
  )
}

/* ── Button ─────────────────────────────────────────────────── */
export function Button({ variant = 'ghost', children, onClick, style, disabled }) {
  const [pressing, setPressing] = useState(false)
  const [hovering, setHovering] = useState(false)

  const base = {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    border: 'none',
    outline: 'none',
    transition: 'all var(--motion-fast)',
    transform: pressing ? 'scale(0.98)' : 'scale(1)',
    opacity: disabled ? 0.4 : 1,
  }

  const variants = {
    ghost: {
      background: 'none',
      border: `1px solid ${hovering ? 'rgba(0,212,255,0.4)' : 'var(--color-border)'}`,
      color: hovering ? 'var(--color-cyan)' : 'var(--color-text-muted)',
      padding: '4px 10px',
      boxShadow: hovering ? '0 0 8px rgba(0,212,255,0.1)' : 'none',
    },
    primary: {
      background: 'var(--color-cyan)',
      border: '1px solid var(--color-cyan)',
      color: 'var(--color-abyss)',
      padding: '6px 14px',
      fontWeight: 700,
      filter: hovering ? 'brightness(1.15)' : 'brightness(1)',
      boxShadow: hovering ? '0 0 18px rgba(0,212,255,0.4)' : 'none',
    },
    danger: {
      background: hovering ? 'rgba(248,81,73,0.15)' : 'none',
      border: '1px solid rgba(248,81,73,0.4)',
      color: 'var(--color-red)',
      padding: '4px 10px',
    },
    icon: {
      background: 'none',
      border: `1px solid ${hovering ? 'rgba(0,212,255,0.3)' : 'var(--color-border)'}`,
      color: hovering ? 'var(--color-cyan)' : 'var(--color-text-muted)',
      width: 28,
      height: 28,
      padding: 0,
      display: 'grid',
      placeItems: 'center',
    },
  }

  return (
    <button
      style={{ ...base, ...variants[variant], ...style }}
      onClick={!disabled ? onClick : undefined}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setPressing(false) }}
      onMouseDown={() => setPressing(true)}
      onMouseUp={() => setPressing(false)}
    >
      {children}
    </button>
  )
}

/* ── Tooltip ─────────────────────────────────────────────────── */
export function Tooltip({ children, content, placement = 'top' }) {
  const [visible, setVisible] = useState(false)
  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div style={{
          position: 'absolute',
          bottom: placement === 'top' ? 'calc(100% + 6px)' : undefined,
          top: placement === 'bottom' ? 'calc(100% + 6px)' : undefined,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          padding: '4px 8px',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 100,
          animation: 'fadeIn 80ms ease-out',
        }}>
          {content}
        </div>
      )}
    </div>
  )
}

/* ── StatusDot ──────────────────────────────────────────────── */
const DOT_COLORS = {
  green:  { bg: '#3FB950', shadow: '#3FB950', anim: 'pulseDot 1.5s infinite' },
  amber:  { bg: '#D29922', shadow: '#D29922', anim: 'pulseAmber 2s infinite' },
  red:    { bg: '#F85149', shadow: '#F85149', anim: 'none' },
  cyan:   { bg: '#00D4FF', shadow: '#00D4FF', anim: 'pulseDot 1.5s infinite' },
  muted:  { bg: '#7D8590', shadow: 'none',    anim: 'none' },
}

export function StatusDot({ color = 'green', size = 6 }) {
  const c = DOT_COLORS[color]
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: c.bg,
      boxShadow: `0 0 ${size}px ${c.shadow}`,
      animation: c.anim,
      flexShrink: 0,
    }} />
  )
}

/* ── Divider ─────────────────────────────────────────────────── */
export function Divider({ style }) {
  return <div style={{ height: 1, background: 'var(--color-border)', ...style }} />
}

/* ── Label ───────────────────────────────────────────────────── */
export function Label({ children, style }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--color-text-muted)',
      ...style,
    }}>
      {children}
    </div>
  )
}

/* ── LiveBadge ────────────────────────────────────────────────── */
export function LiveBadge() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      color: 'var(--color-green)',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    }}>
      <div style={{
        width: 5, height: 5, borderRadius: '50%',
        background: 'var(--color-green)',
        animation: 'pulseDot 1.4s infinite',
      }} />
      LIVE
    </div>
  )
}

/* ── MiniBar ──────────────────────────────────────────────────── */
export function MiniBar({ value, variant = 'cyan' }) {
  const colors = {
    cyan:  'linear-gradient(90deg, #00D4FF, rgba(0,212,255,0.35))',
    warn:  'linear-gradient(90deg, #D29922, rgba(210,153,34,0.35))',
    err:   'linear-gradient(90deg, #F85149, rgba(248,81,73,0.35))',
    green: 'linear-gradient(90deg, #3FB950, rgba(63,185,80,0.35))',
  }
  return (
    <div style={{ height: 3, background: 'var(--color-surface)', marginTop: 10, overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        width: `${Math.min(100, Math.max(0, value))}%`,
        background: colors[variant],
        transition: 'width 1.2s ease',
      }} />
    </div>
  )
}

/* ── Sparkline ─────────────────────────────────────────────────── */
export function Sparkline({ data = [], color = '#00D4FF' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 28, marginTop: 10 }}>
      {data.slice(-14).map((v, i) => (
        <div
          key={i}
          title={`${v.toFixed(1)}`}
          style={{
            flex: 1,
            height: `${(v / 100) * 100}%`,
            background: `${color}55`,
            borderRadius: '1px 1px 0 0',
            transition: 'height 0.5s ease, background 0.2s',
            cursor: 'crosshair',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = color }}
          onMouseLeave={e => { e.currentTarget.style.background = `${color}55` }}
        />
      ))}
    </div>
  )
}

/* ── ProgressBar (top loading) ─────────────────────────────────── */
export function TopProgressBar() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 2,
      background: 'linear-gradient(90deg, var(--color-cyan), rgba(0,212,255,0.3))',
      zIndex: 9999,
      animation: 'progressBar 1.8s ease-in-out',
      transformOrigin: 'left',
    }} />
  )
}

/* ── SearchInput ───────────────────────────────────────────────── */
export function SearchInput({ value, onChange, onFocus, placeholder, style }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      value={value}
      onChange={onChange}
      onFocus={() => { setFocused(true); onFocus?.() }}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      style={{
        background: 'var(--color-surface)',
        border: `1px solid ${focused ? 'var(--color-cyan)' : 'var(--color-border)'}`,
        color: 'var(--color-text)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-sm)',
        padding: '0 10px',
        height: 28,
        outline: 'none',
        boxShadow: focused ? '0 0 0 3px rgba(0,212,255,0.1)' : 'none',
        transition: 'border-color var(--motion-fast), box-shadow var(--motion-fast)',
        ...style,
      }}
    />
  )
}
