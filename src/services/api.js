import { MOCK_OPTIMIZATION_RESULT, RUN_HISTORY, INVENTORY_DATA } from '../data/constants.js'

const MOCK_MODE = true        // ← set false when Go server is running
const BASE      = 'http://localhost:3000'
const TIMEOUT   = 30000

const ENDPOINTS = {
  OPTIMIZE:  '/api/optimize-kitting',
  HISTORY:   '/api/history',
  INVENTORY: '/api/inventory',
  HEALTH:    '/api/health',
}

async function apiFetch(endpoint, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT)
  try {
    const res = await fetch(`${BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    })
    clearTimeout(timer)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(err.error || `HTTP ${res.status}`)
    }
    return await res.json()
  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError') throw new Error('Request timed out (30s)')
    throw err
  }
}

const mockDelay = (ms = 2000) => new Promise(r => setTimeout(r, ms))

// ── POST /api/optimize-kitting ────────────────────────────────
// Handles BOTH old schema (no material/area) and new Go schema
// so React works before and after you connect the real backend
export async function runOptimization(items) {
  if (MOCK_MODE) {
    await mockDelay(1800)

    const totalQty = items.reduce((s, i) => s + Number(i.quantity), 0)

    // Group by dimensions + material (matches new Go grouping logic)
    const groups = {}
    items.forEach(item => {
      const mat = item.material || 'Steel'
      const key = `${mat}|${Number(item.length).toFixed(1)}x${Number(item.width).toFixed(1)}`
      if (!groups[key]) groups[key] = { elements: [], qty: 0, material: mat }
      groups[key].elements.push(item.element_id)
      groups[key].qty += Number(item.quantity)
    })

    // Material-aware repetition limits (mirrors Go constants)
    const limits = { Aluform: 100, Plywood: 15, Steel: 10 }

    const kit_details = Object.entries(groups).map(([dims, g]) => {
      const limit  = limits[g.material] ?? 10
      const reqQty = Math.ceil(g.qty / limit)
      return {
        dimensions:       dims,
        material:         g.material,
        required_qty:     reqQty,
        repetition_count: Math.round((g.qty / reqQty) * 100) / 100,
        used_in_elements: g.elements,
      }
    })

    const optimizedTotal = kit_details.reduce((s, k) => s + k.required_qty, 0)
    const savings = totalQty > 0
      ? Math.round(((totalQty - optimizedTotal) / totalQty) * 100 * 100) / 100
      : 0

    return {
      original_boq_items:              totalQty,
      optimized_kits_required:         optimizedTotal,
      total_repetition_factor:         Math.round((totalQty / Math.max(optimizedTotal, 1)) * 100) / 100,
      estimated_cost_savings_percent:  savings,
      execution_time_ms:               '0.842 ms',   // mock Go speed
      kit_details,
      _run_id:       `RUN-${Date.now()}`,
      _processed_at: new Date().toISOString(),
    }
  }

  return apiFetch(ENDPOINTS.OPTIMIZE, {
    method: 'POST',
    body: JSON.stringify({ items }),
  })
}

// ── GET /api/history ──────────────────────────────────────────
export async function fetchHistory() {
  if (MOCK_MODE) { await mockDelay(400); return RUN_HISTORY }
  return apiFetch(ENDPOINTS.HISTORY)
}

// ── GET /api/inventory ────────────────────────────────────────
export async function fetchInventory() {
  if (MOCK_MODE) { await mockDelay(400); return INVENTORY_DATA }
  return apiFetch(ENDPOINTS.INVENTORY)
}

// ── GET /api/health ───────────────────────────────────────────
export async function checkHealth() {
  if (MOCK_MODE) {
    await mockDelay(150)
    return { status: 'ok', version: '1.0.0-mock', mode: 'mock' }
  }
  return apiFetch(ENDPOINTS.HEALTH)
}