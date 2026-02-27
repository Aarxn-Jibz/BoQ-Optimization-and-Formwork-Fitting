// ─── src/components/ui/Drawer.jsx ────────────────────────────
import React from 'react'
import { X, Activity } from 'lucide-react'
import { Button, Badge } from './index.jsx'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

export function Drawer({ isOpen, data, onClose, onAction }) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(8,11,18,0.78)',
          zIndex: 200,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'all' : 'none',
          transition: 'opacity var(--motion-normal)',
          backdropFilter: isOpen ? 'blur(2px)' : 'none',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0,
        width: 'var(--drawer-width)',
        background: 'var(--color-void)',
        borderLeft: '1px solid var(--color-border)',
        zIndex: 201,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 220ms ease-out',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Accent left edge */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 1,
          background: 'linear-gradient(180deg, var(--color-cyan) 0%, transparent 50%)',
          opacity: 0.35,
        }} />

        {/* Header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(0,212,255,0.02)',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--color-text)',
          }}>
            {drawerTitle(data)}
          </div>
          <Button variant="icon" onClick={onClose}><X size={14} /></Button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {isOpen && data && <DrawerContent data={data} onAction={onAction} onClose={onClose} />}
        </div>
      </div>
    </>
  )
}

function drawerTitle(data) {
  if (!data) return 'DETAIL VIEW'
  const map = {
    cpu: 'CPU DETAIL',
    mem: 'MEMORY DETAIL',
    rps: 'REQUEST RATE',
    err: 'ERROR RATE',
    log: 'LOG ENTRY',
    alert: 'ALERT DETAIL',
    service: `SERVICE: ${data.service?.service?.toUpperCase() ?? ''}`,
    services: 'ALL SERVICES',
  }
  return map[data.type] ?? 'DETAIL VIEW'
}

function DrawerContent({ data, onAction, onClose }) {
  if (data.type === 'log') {
    return (
      <div className="animate-fade-in">
        {[['Time', data.log?.time], ['Level', data.log?.level], ['Source', data.log?.src], ['Message', data.log?.msg]].map(([k, v]) => (
          <DetailRow key={k} label={k} value={v} valueColor={k === 'Level' ? levelColor(v) : undefined} />
        ))}
        <Button variant="ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
          VIEW FULL TRACE
        </Button>
      </div>
    )
  }

  if (data.type === 'alert') {
    const colors = { err: 'var(--color-red)', warn: 'var(--color-amber)', ok: 'var(--color-green)' }
    return (
      <div className="animate-fade-in">
        {[['Title', data.alert?.title], ['Service', data.alert?.sub], ['Time', data.alert?.time], ['Severity', data.alert?.status?.toUpperCase()]].map(([k, v]) => (
          <DetailRow key={k} label={k} value={v} valueColor={k === 'Severity' ? colors[data.alert?.status] : undefined} />
        ))}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Button variant="primary" onClick={() => { onAction?.('ack', data.alert); onClose?.() }}>ACKNOWLEDGE</Button>
          <Button variant="danger">ESCALATE</Button>
        </div>
      </div>
    )
  }

  if (data.type === 'cpu' || data.type === 'mem') {
    return (
      <div className="animate-fade-in">
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 52, fontWeight: 700,
          color: 'var(--color-cyan)', marginBottom: 16, letterSpacing: '-0.02em',
        }}>
          {data.value?.toFixed(1)}%
        </div>
        <div style={{ marginBottom: 20 }}>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={Array.from({length:20},(_,i)=>({v: Math.max(5,Math.min(95,data.value+(Math.random()-0.5)*20))}))}>
              <defs>
                <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#00D4FF" strokeWidth={1.5} fill="url(#dg)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <Button variant="ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onAction?.('threshold', data)}>
          SET THRESHOLD ALERT
        </Button>
      </div>
    )
  }

  if (data.type === 'service') {
    return (
      <div className="animate-fade-in">
        {Object.entries(data.service || {}).map(([k, v]) => (
          <DetailRow key={k} label={k.toUpperCase()} value={String(v)} />
        ))}
      </div>
    )
  }

  return <div style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>No detail available.</div>
}

function DetailRow({ label, value, valueColor }) {
  return (
    <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--color-text-muted)', marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: valueColor ?? 'var(--color-text)' }}>
        {value}
      </div>
    </div>
  )
}

function levelColor(level) {
  return { INFO: '#00D4FF', WARN: '#D29922', ERROR: '#F85149', DEBUG: '#7D8590' }[level] ?? 'var(--color-text)'
}


// ─── src/components/ui/CommandPalette.jsx ────────────────────
import { CMD_ITEMS } from '../../data/constants.js'
import {
  LayoutDashboard, Activity, FileText, AlertTriangle,
  Key, RefreshCw, Settings, PanelLeft, Download,
} from 'lucide-react'

const CMD_ICON_MAP = {
  LayoutDashboard, Activity, FileText, AlertTriangle,
  Key, RefreshCw, Settings, PanelLeft, Download,
}

export function CommandPalette({ open, query, setQuery, onClose, onSelect }) {
  const [selected, setSelected] = React.useState(0)

  const filtered = CMD_ITEMS.filter(i =>
    !query || i.label.toLowerCase().includes(query.toLowerCase())
  )

  React.useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'ArrowDown') setSelected(s => Math.min(s + 1, filtered.length - 1))
      if (e.key === 'ArrowUp')   setSelected(s => Math.max(s - 1, 0))
      if (e.key === 'Enter')     { onSelect?.(filtered[selected]); onClose?.() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, filtered, selected, onSelect, onClose])

  React.useEffect(() => { setSelected(0) }, [query])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(8,11,18,0.88)',
        zIndex: 500,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: 80,
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 120ms ease-out',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          border: '1px solid rgba(0,212,255,0.22)',
          width: 560,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,212,255,0.06)',
          animation: 'slideUp 150ms ease-out',
        }}
      >
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', borderBottom: '1px solid var(--color-border)' }}>
          <Activity size={14} color="#7D8590" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search…"
            style={{
              flex: 1, background: 'none', border: 'none',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-mono)', fontSize: 14,
              padding: '14px 0', outline: 'none',
            }}
          />
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 9,
            background: 'var(--color-border)', color: 'var(--color-text-muted)',
            padding: '2px 5px', letterSpacing: '0.06em',
          }}>
            ESC
          </div>
        </div>

        {/* Results */}
        <div style={{ padding: '6px 12px 4px', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          COMMANDS
        </div>
        {filtered.map((item, i) => {
          const IconComp = CMD_ICON_MAP[item.icon]
          return (
            <div
              key={i}
              onClick={() => { onSelect?.(item); onClose?.() }}
              onMouseEnter={() => setSelected(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '9px 16px', cursor: 'pointer',
                background: selected === i ? 'rgba(0,212,255,0.07)' : 'transparent',
                transition: 'background var(--motion-instant)',
              }}
            >
              {IconComp && <IconComp size={14} color={selected === i ? '#00D4FF' : '#7D8590'} />}
              <span style={{ flex: 1, fontSize: 13, color: selected === i ? 'var(--color-cyan)' : 'var(--color-text)' }}>
                {item.label}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', background: 'var(--color-border)', padding: '1px 5px' }}>
                {item.hint}
              </span>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ padding: '16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center' }}>
            No results for "{query}"
          </div>
        )}

        {/* Footer hints */}
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex', gap: 16,
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: 'var(--color-text-muted)',
        }}>
          {[['↑↓', 'Navigate'], ['↵', 'Select'], ['Esc', 'Close']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <span style={{ background: 'var(--color-border)', padding: '1px 4px' }}>{k}</span>
              {v}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


// ─── src/components/ui/Notifications.jsx ─────────────────────
import { CheckCircle } from 'lucide-react'

const TYPE_STYLES = {
  info:  { border: 'var(--color-cyan)',  icon: Activity,     iconColor: '#00D4FF' },
  ok:    { border: 'var(--color-green)', icon: CheckCircle,  iconColor: '#3FB950' },
  warn:  { border: 'var(--color-amber)', icon: AlertTriangle, iconColor: '#D29922' },
  err:   { border: 'var(--color-red)',   icon: X,            iconColor: '#F85149' },
}

export function NotificationStack({ notifs, onDismiss }) {
  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20,
      display: 'flex', flexDirection: 'column', gap: 8,
      zIndex: 300, pointerEvents: 'none',
    }}>
      {notifs.map(n => {
        const ts = TYPE_STYLES[n.type] ?? TYPE_STYLES.info
        const IconComp = ts.icon
        return (
          <div
            key={n.id}
            className="animate-notif"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderLeft: `3px solid ${ts.border}`,
              padding: '10px 14px',
              minWidth: 280, maxWidth: 340,
              display: 'flex', alignItems: 'flex-start', gap: 10,
              boxShadow: 'var(--shadow-card)',
              pointerEvents: 'all',
              cursor: 'pointer',
            }}
            onClick={() => onDismiss?.(n.id)}
          >
            <IconComp size={14} color={ts.iconColor} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2,
              }}>
                {n.title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{n.msg}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
