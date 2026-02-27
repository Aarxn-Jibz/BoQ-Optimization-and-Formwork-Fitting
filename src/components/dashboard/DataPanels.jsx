// ─── src/components/dashboard/LogStream.jsx ──────────────────
import React, { useState } from 'react'
import { Filter, Download } from 'lucide-react'
import { Panel, PanelHeader, PanelTitle, PanelActions } from '../ui/Panel.jsx'
import { Button, LiveBadge } from '../ui/index.jsx'

const LEVEL_COLORS = {
  INFO:  '#00D4FF',
  WARN:  '#D29922',
  ERROR: '#F85149',
  DEBUG: '#7D8590',
}

export function LogStream({ logs, onLogClick }) {
  const [filter, setFilter] = useState('ALL')

  const filtered = filter === 'ALL' ? logs : logs.filter(l => l.level === filter)

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>SYSTEM LOG STREAM</PanelTitle>
        <PanelActions>
          {/* Level filter pills */}
          <div style={{ display: 'flex', gap: 4 }}>
            {['ALL','INFO','WARN','ERROR'].map(lv => (
              <FilterPill
                key={lv}
                label={lv}
                active={filter === lv}
                color={lv === 'ALL' ? '#7D8590' : LEVEL_COLORS[lv]}
                onClick={() => setFilter(lv)}
              />
            ))}
          </div>
          <LiveBadge />
          <Button variant="ghost"><Filter size={11} />FILTER</Button>
          <Button variant="ghost"><Download size={11} />EXPORT</Button>
        </PanelActions>
      </PanelHeader>

      <div style={{ height: 210, overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
        {filtered.map((log, i) => (
          <LogLine key={log.id} log={log} isNew={i === 0 && log.isNew} onClick={() => onLogClick?.(log)} />
        ))}
      </div>

      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: 'var(--color-text-muted)',
      }}>
        Showing <span style={{ color: 'var(--color-text)', margin: '0 2px' }}>{filtered.length}</span> of 18,492 entries
        <Button variant="ghost" style={{ marginLeft: 'auto' }}>← OLDER EVENTS</Button>
      </div>
    </Panel>
  )
}

function LogLine({ log, isNew, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={isNew ? 'animate-log-in' : ''}
      style={{
        display: 'flex', gap: 10, padding: '4px 16px',
        background: hovered ? 'rgba(0,212,255,0.03)' : 'transparent',
        borderBottom: hovered ? '1px solid rgba(0,212,255,0.06)' : '1px solid transparent',
        cursor: 'pointer', transition: 'background var(--motion-instant)',
        borderLeft: isNew ? '2px solid rgba(0,212,255,0.5)' : '2px solid transparent',
      }}
    >
      <span style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>{log.time}</span>
      <span style={{ color: LEVEL_COLORS[log.level] ?? '#7D8590', flexShrink: 0, width: 44, textAlign: 'right', fontWeight: 600 }}>
        {log.level}
      </span>
      <span style={{ color: 'var(--color-text)', flex: 1 }}>{log.msg}</span>
      <span style={{ color: 'var(--color-text-muted)', fontSize: 10, flexShrink: 0 }}>{log.src}</span>
    </div>
  )
}

function FilterPill({ label, active, color, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        fontWeight: 600,
        padding: '2px 7px',
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        background: active ? `${color}18` : 'none',
        border: `1px solid ${active ? color + '50' : 'var(--color-border)'}`,
        color: active ? color : hovered ? 'var(--color-text)' : 'var(--color-text-muted)',
        transition: 'all var(--motion-instant)',
      }}
    >
      {label}
    </div>
  )
}

// ─── src/components/dashboard/AlertsPanel.jsx ────────────────
export function AlertsPanel({ alerts, onAlertClick, onAcknowledgeAll }) {
  const [filter, setFilter] = useState('all')

  const STATUS_COLOR = { err: '#F85149', warn: '#D29922', ok: '#3FB950' }
  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.status === filter)
  const unacked = alerts.filter(a => !a.ack).length

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>
          ACTIVE ALERTS
          {unacked > 0 && (
            <span style={{
              background: 'rgba(248,81,73,0.15)',
              border: '1px solid rgba(248,81,73,0.3)',
              color: '#F85149',
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              padding: '1px 5px',
              fontWeight: 700,
            }}>
              {unacked}
            </span>
          )}
        </PanelTitle>
        <div style={{ display: 'flex', gap: 4 }}>
          {['all','err','warn','ok'].map(f => (
            <FilterPill key={f} label={f} active={filter === f} color={STATUS_COLOR[f] ?? '#7D8590'} onClick={() => setFilter(f)} />
          ))}
        </div>
      </PanelHeader>

      <div style={{ overflowY: 'auto', maxHeight: 210 }}>
        {filtered.map(alert => (
          <AlertItem
            key={alert.id}
            alert={alert}
            onClick={() => onAlertClick?.(alert)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{
            padding: '24px 16px', textAlign: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--color-text-muted)',
          }}>
            NO ALERTS MATCHING FILTER
          </div>
        )}
      </div>

      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--color-border)' }}>
        <Button variant="ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={onAcknowledgeAll}>
          ACKNOWLEDGE ALL UNREAD
        </Button>
      </div>
    </Panel>
  )
}

function AlertItem({ alert, onClick }) {
  const [hovered, setHovered] = useState(false)
  const icons = { ok: '✓', warn: '⚠', err: '✕' }
  const colors = { ok: '#3FB950', warn: '#D29922', err: '#F85149' }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 16px',
        borderBottom: '1px solid var(--color-border)',
        cursor: 'pointer',
        background: hovered ? 'rgba(0,212,255,0.025)' : 'transparent',
        transition: 'background var(--motion-instant)',
        opacity: alert.ack ? 0.5 : 1,
      }}
    >
      <div style={{
        width: 16, height: 16, display: 'grid', placeItems: 'center',
        color: colors[alert.status], fontSize: 12, fontWeight: 700, flexShrink: 0,
      }}>
        {icons[alert.status]}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: 'var(--color-text)', marginBottom: 1 }}>{alert.title}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>{alert.sub}</div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', flexShrink: 0 }}>
        {alert.time}
      </div>
    </div>
  )
}

// ─── src/components/dashboard/ServiceTable.jsx ───────────────
export function ServiceTable({ data, onRowClick }) {
  const [sort, setSort] = useState({ col: 'service', dir: 'asc' })
  const [hovered, setHoveredRow] = useState(null)

  const STATUS_COLORS = { ok: '#00D4FF', warn: '#D29922', err: '#F85149' }

  const sorted = [...data].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1
    return a[sort.col] > b[sort.col] ? dir : -dir
  })

  const toggleSort = col => setSort(s => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }))

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>SERVICE OVERVIEW</PanelTitle>
        <Button variant="ghost" onClick={() => onRowClick?.({ type: 'services' })}>VIEW ALL</Button>
      </PanelHeader>

      <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 190 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['service','rps','p99','err','status'].map(col => (
                <th
                  key={col}
                  onClick={() => toggleSort(col)}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10, fontWeight: 600,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: sort.col === col ? 'var(--color-cyan)' : 'var(--color-text-muted)',
                    padding: '8px 16px', textAlign: 'left',
                    borderBottom: '1px solid var(--color-border)',
                    position: 'sticky', top: 0, background: 'var(--color-void)',
                    cursor: 'pointer', userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.toUpperCase()} {sort.col === col ? (sort.dir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={row.service}
                onClick={() => onRowClick?.({ type: 'service', service: row })}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  background: hovered === i
                    ? 'rgba(0,212,255,0.03)'
                    : i % 2 === 0 ? 'transparent' : 'rgba(8,11,18,0.3)',
                  cursor: 'pointer',
                  transition: 'background var(--motion-instant)',
                }}
              >
                <td style={{ padding: '0 16px', height: 36, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-cyan)' }}>{row.service}</td>
                <td style={{ padding: '0 16px', height: 36, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text)' }}>{row.rps}</td>
                <td style={{ padding: '0 16px', height: 36, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text)' }}>{row.p99}</td>
                <td style={{ padding: '0 16px', height: 36, fontFamily: 'var(--font-mono)', fontSize: 12, color: row.err !== '0.000%' ? '#D29922' : 'var(--color-text-muted)' }}>{row.err}</td>
                <td style={{ padding: '0 16px', height: 36 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
                    padding: '2px 6px', textTransform: 'uppercase', letterSpacing: '0.08em',
                    background: `${STATUS_COLORS[row.status]}15`,
                    color: STATUS_COLORS[row.status],
                    border: `1px solid ${STATUS_COLORS[row.status]}35`,
                  }}>
                    {row.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
