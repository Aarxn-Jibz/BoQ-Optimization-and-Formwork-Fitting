// ─── src/components/dashboard/MetricCards.jsx ────────────────
import React, { useState, useEffect, useRef } from 'react'
import { Badge, MiniBar, Sparkline } from '../ui/index.jsx'

function useAnimatedValue(value) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)
  useEffect(() => {
    if (value !== prev.current) {
      prev.current = value
      setDisplay(value)
    }
  }, [value])
  return display
}

export function MetricCards({ metrics, sparkData, onCardClick }) {
  const cpuVariant  = metrics.cpu > 80 ? 'err' : metrics.cpu > 65 ? 'warn' : 'cyan'
  const memVariant  = metrics.mem > 85 ? 'err' : metrics.mem > 70 ? 'warn' : 'cyan'
  const errVariant  = metrics.err > 1  ? 'err' : metrics.err > 0.1 ? 'warn' : 'ok'

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 12,
    }}>
      {/* CPU */}
      <MetricCard
        label="CPU LOAD"
        value={`${metrics.cpu.toFixed(1)}%`}
        valueColor={cpuVariant === 'err' ? 'var(--color-red)' : cpuVariant === 'warn' ? 'var(--color-amber)' : 'var(--color-text)'}
        badge={<Badge variant={cpuVariant === 'err' ? 'err' : cpuVariant === 'warn' ? 'warn' : 'ok'}>
          {cpuVariant === 'err' ? 'CRITICAL' : cpuVariant === 'warn' ? 'ELEVATED' : 'NORMAL'}
        </Badge>}
        sub="4 cores · 8 threads"
        bar={<MiniBar value={metrics.cpu} variant={cpuVariant === 'err' ? 'err' : cpuVariant === 'warn' ? 'warn' : 'cyan'} />}
        accentColor={cpuVariant === 'err' ? 'var(--color-red)' : cpuVariant === 'warn' ? 'var(--color-amber)' : 'var(--color-cyan)'}
        onClick={() => onCardClick?.({ type: 'cpu', value: metrics.cpu })}
      />

      {/* Memory */}
      <MetricCard
        label="MEMORY"
        value={`${(metrics.mem * 0.08).toFixed(1)} GB`}
        badge={<Badge variant={memVariant === 'err' ? 'err' : memVariant === 'warn' ? 'warn' : 'ok'}>
          {metrics.mem.toFixed(0)}% USED
        </Badge>}
        sub="of 8 GB total"
        bar={<MiniBar value={metrics.mem} variant={memVariant === 'err' ? 'err' : memVariant === 'warn' ? 'warn' : 'cyan'} />}
        accentColor={memVariant === 'err' ? 'var(--color-red)' : memVariant === 'warn' ? 'var(--color-amber)' : 'var(--color-cyan)'}
        onClick={() => onCardClick?.({ type: 'mem', value: metrics.mem })}
      />

      {/* RPS */}
      <MetricCard
        label="REQUESTS / S"
        value={`${(metrics.rps / 1000).toFixed(1)}K`}
        badge={<Badge variant="up">▲ LIVE</Badge>}
        sub="p99 latency: 42ms"
        bar={<Sparkline data={sparkData} color="var(--color-cyan)" />}
        onClick={() => onCardClick?.({ type: 'rps', value: metrics.rps })}
      />

      {/* Error Rate */}
      <MetricCard
        label="ERROR RATE"
        value={`${metrics.err.toFixed(3)}%`}
        valueColor={metrics.err > 1 ? 'var(--color-red)' : metrics.err > 0.1 ? 'var(--color-amber)' : 'var(--color-green)'}
        badge={<Badge variant={errVariant}>{metrics.err < 0.1 ? '▼ OK' : '▲ WARN'}</Badge>}
        sub="last 5 minutes"
        bar={<MiniBar value={Math.min(100, metrics.err * 20)} variant={metrics.err > 1 ? 'err' : metrics.err > 0.1 ? 'warn' : 'green'} />}
        accentColor={metrics.err > 1 ? 'var(--color-red)' : metrics.err > 0.1 ? 'var(--color-amber)' : 'var(--color-green)'}
        onClick={() => onCardClick?.({ type: 'err', value: metrics.err })}
      />
    </div>
  )
}

function MetricCard({ label, value, valueColor, badge, sub, bar, accentColor = 'var(--color-cyan)', onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="animate-slide-up"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--color-void)',
        border: `1px solid ${hovered ? 'rgba(0,212,255,0.4)' : 'rgba(0,212,255,0.1)'}`,
        padding: '14px 16px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color var(--motion-fast), box-shadow var(--motion-fast), transform var(--motion-fast)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? `0 0 20px rgba(0,212,255,0.08), 0 4px 20px rgba(0,0,0,0.3)` : 'none',
        clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
      }}
    >
      {/* Accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, ${accentColor} 0%, transparent 60%)`,
        opacity: hovered ? 0.8 : 0.35,
        transition: 'opacity var(--motion-fast)',
      }} />

      {/* Corner glow on hover */}
      {hovered && (
        <div style={{
          position: 'absolute', top: -20, right: -20,
          width: 80, height: 80,
          background: `radial-gradient(circle, ${accentColor}12 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}

      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--color-text-muted)',
        marginBottom: 10,
      }}>
        {label}
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 26,
        fontWeight: 700,
        color: valueColor ?? 'var(--color-text)',
        letterSpacing: '-0.02em',
        lineHeight: 1,
        animation: 'countUp 300ms ease-out',
      }}>
        {value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        {badge}
        {sub && <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{sub}</span>}
      </div>

      {bar}
    </div>
  )
}
