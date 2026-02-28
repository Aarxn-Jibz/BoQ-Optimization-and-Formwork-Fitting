// ─── src/services/api.js ──────────────────────────────────────
// Go backend: localhost:3000
// Python pipeline output: BoQ_Data_Cleaned.json → { items: [...] }
// ─────────────────────────────────────────────────────────────

const MOCK_MODE = false          // ← true = use mock data, false = call Go
const BASE      = 'http://localhost:3000'
const TIMEOUT   = 30000

const ENDPOINTS = {
  OPTIMIZE: '/api/optimize-kitting',
  HEALTH:   '/api/health',
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

const mockDelay = (ms = 1800) => new Promise(r => setTimeout(r, ms))

// ── POST /api/optimize-kitting ────────────────────────────────
export async function runOptimization(items) {
  if (MOCK_MODE) {
    await mockDelay()
    const totalQty = items.reduce((s, i) => s + Number(i.quantity), 0)
    const groups = {}
    items.forEach(item => {
      const mat = item.material || 'Steel'
      const key = `${mat}|${Number(item.length).toFixed(1)}x${Number(item.width).toFixed(1)}`
      if (!groups[key]) groups[key] = { elements: [], qty: 0, material: mat,
        length: item.length, width: item.width }
      groups[key].elements.push(item.element_id)
      groups[key].qty += Number(item.quantity)
    })
    const limits = { Aluform: 100, Plywood: 15, Steel: 10 }
    const kit_details = Object.entries(groups).map(([key, g]) => {
      const limit  = limits[g.material] ?? 10
      const reqQty = Math.max(1, Math.ceil(g.qty / limit))
      return {
        dimensions:       `${Number(g.length).toFixed(1)}x${Number(g.width).toFixed(1)}`,
        material:         g.material,
        required_qty:     reqQty,
        repetition_count: Math.round((g.qty / reqQty) * 100) / 100,
        used_in_elements: g.elements,
      }
    })
    const optimizedTotal = kit_details.reduce((s, k) => s + k.required_qty, 0)
    const savings = totalQty > 0
      ? Math.round(((totalQty - optimizedTotal) / totalQty) * 100 * 100) / 100 : 0
    return {
      original_boq_items:             totalQty,
      optimized_kits_required:        optimizedTotal,
      total_repetition_factor:        Math.round((totalQty / optimizedTotal) * 100) / 100,
      estimated_cost_savings_percent: savings,
      execution_time_ms:              '0.84 ms (mock)',
      kit_details,
      _run_id:       `RUN-${Date.now()}`,
      _processed_at: new Date().toISOString(),
    }
  }

  // ── Real Go call ────────────────────────────────────────────
  return apiFetch(ENDPOINTS.OPTIMIZE, {
    method: 'POST',
    body: JSON.stringify({ items }),
  })
}

// ── GET /api/health ───────────────────────────────────────────
export async function checkHealth() {
  if (MOCK_MODE) {
    await mockDelay(200)
    return { status: 'ok', mode: 'mock' }
  }
  return apiFetch(ENDPOINTS.HEALTH)
}

export const fetchHistory = async () => {
  const response = await fetch('/api/history');
  return response.json();
};