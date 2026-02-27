// ─── src/hooks/useLiveMetrics.js ──────────────────────────────
import { useState, useEffect } from 'react'

export function useLiveMetrics(intervalMs = 2000) {
  const [metrics, setMetrics] = useState({
    cpu:     67.2,
    mem:     72.1,
    rps:     14200,
    err:     0.003,
    uptime:  99.98,
    agents:  3,
    disk:    45.3,
    network: 2.4,
  })

  useEffect(() => {
    const iv = setInterval(() => {
      setMetrics(m => ({
        ...m,
        cpu:     clamp(m.cpu     + jitter(8),    5,  95),
        mem:     clamp(m.mem     + jitter(4),    20, 92),
        rps:     clamp(m.rps     + jitter(1200), 2000, 28000),
        err:     clamp(m.err     + jitter(0.25), 0,  8),
        disk:    clamp(m.disk    + jitter(0.5),  10, 95),
        network: clamp(m.network + jitter(0.8),  0.1, 10),
      }))
    }, intervalMs)
    return () => clearInterval(iv)
  }, [intervalMs])

  return metrics
}

// ─── src/hooks/useLiveChart.js ────────────────────────────────
import { generateSeedChart, generateChartPoint } from '../data/constants.js'

export function useLiveChart(intervalMs = 2000) {
  const [data, setData] = useState(() => generateSeedChart(24))

  useEffect(() => {
    const iv = setInterval(() => {
      setData(d => [...d.slice(1), generateChartPoint()])
    }, intervalMs)
    return () => clearInterval(iv)
  }, [intervalMs])

  return data
}

// ─── src/hooks/useLiveLogs.js ─────────────────────────────────
import { generateLog, generateSeedLogs } from '../data/constants.js'

export function useLiveLogs(intervalMs = 3500, maxLogs = 50) {
  const [logs, setLogs] = useState(() => generateSeedLogs(10))

  const addLog = (log) => setLogs(prev => [{ ...log, isNew: true }, ...prev.slice(0, maxLogs - 1)])

  useEffect(() => {
    const iv = setInterval(() => {
      addLog(generateLog())
    }, intervalMs)
    return () => clearInterval(iv)
  }, [intervalMs])

  return { logs, addLog }
}

// ─── src/hooks/useNotifications.js ───────────────────────────
import { useCallback } from 'react'

let notifCounter = 0

export function useNotifications() {
  const [notifs, setNotifs] = useState([])

  const push = useCallback((title, msg, type = 'info') => {
    const id = ++notifCounter
    setNotifs(n => [...n, { id, title, msg, type }])
    setTimeout(() => setNotifs(n => n.filter(x => x.id !== id)), 4500)
  }, [])

  const dismiss = useCallback((id) => {
    setNotifs(n => n.filter(x => x.id !== id))
  }, [])

  return { notifs, push, dismiss }
}

// ─── src/hooks/useCommandPalette.js ──────────────────────────
export function useCommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
        setQuery('')
        setSelected(0)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return { open, setOpen, query, setQuery, selected, setSelected }
}

// ─── src/hooks/useKeyboardNav.js ──────────────────────────────
export function useKeyboardNav(itemCount, active) {
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    if (!active) return
    const handler = (e) => {
      if (e.key === 'ArrowDown') setSelected(s => Math.min(s + 1, itemCount - 1))
      if (e.key === 'ArrowUp')   setSelected(s => Math.max(s - 1, 0))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [active, itemCount])

  return { selected, setSelected }
}

// ─── src/hooks/useDrawer.js ───────────────────────────────────
export function useDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState(null)

  const open = useCallback((payload) => {
    setData(payload)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  return { isOpen, data, open, close }
}

// ─── Helpers ──────────────────────────────────────────────────
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)) }
function jitter(scale) { return (Math.random() - 0.5) * 2 * scale }
