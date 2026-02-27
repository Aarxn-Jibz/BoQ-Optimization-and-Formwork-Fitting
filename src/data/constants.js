/* ─── src/data/constants.js ─────────────────────────────────── */

export const NAV_ITEMS = [
  { id:'overview',   label:'Overview',     icon:'LayoutDashboard' },
  { id:'input',      label:'Input / BoQ',  icon:'ClipboardList'   },
  { id:'kitting',    label:'Kitting Plan', icon:'Layers'          },
  { id:'inventory',  label:'Inventory',    icon:'Package'         },
  { id:'alerts',     label:'Alerts',       icon:'AlertTriangle'   },
  { id:'history',    label:'Run History',  icon:'History'         },
  { id:'settings',   label:'Settings',     icon:'Settings'        },
]

export const DEFAULT_INPUT_ITEMS = [
  { element_id:'ZONE1-METRO-PIER-CAP-0001', material:'Steel',   length:2.4, width:1.2, quantity:10, start_date:'2026-03-01', end_date:'2026-03-04' },
  { element_id:'ZONE1-METRO-PIER-CAP-0002', material:'Steel',   length:2.4, width:1.2, quantity:10, start_date:'2026-03-05', end_date:'2026-03-08' },
  { element_id:'ZONE3-PODIUM-SLAB-0005',    material:'Plywood', length:1.8, width:1.8, quantity:25, start_date:'2026-03-02', end_date:'2026-03-10' },
]

export const EMPTY_ITEM = {
  element_id:'', material:'Steel', length:'', width:'', quantity:'', start_date:'', end_date:'',
}

export const ELEMENT_PRESETS = [
  { label:'Metro Pier Cap',     length:2.4, width:1.2, material:'Steel'   },
  { label:'Tower Column',       length:3.0, width:0.6, material:'Aluform' },
  { label:'Podium Slab',        length:1.8, width:1.8, material:'Plywood' },
  { label:'Retaining Wall',     length:2.4, width:2.4, material:'Aluform' },
  { label:'Bridge Girder',      length:4.0, width:0.4, material:'Steel'   },
  { label:'Column (Standard)',  length:2.4, width:1.2, material:'Steel'   },
  { label:'Slab (Large)',       length:4.5, width:2.0, material:'Plywood' },
  { label:'Wall Panel',         length:3.0, width:0.2, material:'Aluform' },
]

export const MOCK_OPTIMIZATION_RESULT = {
  original_boq_items:              45,
  optimized_kits_required:         14,
  total_repetition_factor:         3.21,
  estimated_cost_savings_percent:  68.89,
  execution_time_ms:               '0.842 ms',
  kit_details: [
    { dimensions:'Steel|2.40x1.20',   material:'Steel',   required_qty:4,  repetition_count:5.00, used_in_elements:['ZONE1-METRO-PIER-CAP-0001','ZONE1-METRO-PIER-CAP-0002'] },
    { dimensions:'Plywood|1.80x1.80', material:'Plywood', required_qty:2,  repetition_count:12.5, used_in_elements:['ZONE3-PODIUM-SLAB-0005'] },
    { dimensions:'Aluform|3.00x0.60', material:'Aluform', required_qty:1,  repetition_count:15.0, used_in_elements:['ZONE2-TOWER-COLUMN-0003'] },
  ],
  _run_id:'RUN-2026-001',
  _processed_at:'2026-03-01T09:30:00Z',
}

export const INITIAL_ALERTS = [
  { id:1, status:'warn', title:'BoQ Deviation +12%',       sub:'Slab-B1 quantity mismatch',       time:'15m ago', ack:false },
  { id:2, status:'ok',   title:'KIT-001 Cycle Complete',   sub:'Column-A1 stripped successfully', time:'1h ago',  ack:true  },
  { id:3, status:'warn', title:'Low Repetition Rate',      sub:'Foundation elements < 2 reuses',  time:'2h ago',  ack:false },
  { id:4, status:'ok',   title:'Optimization Run Success', sub:'RUN-2026-001 completed',          time:'3h ago',  ack:true  },
  { id:5, status:'err',  title:'Schedule Conflict',        sub:'KIT-003 overlap on 2026-03-05',   time:'4h ago',  ack:false },
]

export const RUN_HISTORY = [
  { id:'RUN-2026-005', date:'2026-03-01', elements:8,  qty:120, saving:'68.9%', status:'completed', kits:14, exec:'0.842 ms' },
  { id:'RUN-2026-004', date:'2026-02-20', elements:8,  qty:120, saving:'24.1%', status:'completed', kits:5,  exec:'0.621 ms' },
  { id:'RUN-2026-003', date:'2026-02-15', elements:5,  qty:80,  saving:'18.7%', status:'completed', kits:3,  exec:'0.441 ms' },
  { id:'RUN-2026-002', date:'2026-02-10', elements:12, qty:200, saving:'35.2%', status:'completed', kits:7,  exec:'1.203 ms' },
  { id:'RUN-2026-001', date:'2026-02-05', elements:4,  qty:60,  saving:'—',     status:'failed',    kits:0,  exec:'—'        },
]

export const INVENTORY_DATA = [
  { kit_id:'KIT-001', type:'Steel 2.4×1.2',   total:10, deployed:10, available:0,  utilization:100 },
  { kit_id:'KIT-002', type:'Plywood 1.8×1.8', total:25, deployed:20, available:5,  utilization:80  },
  { kit_id:'KIT-003', type:'Steel 4.0×0.4',   total:8,  deployed:3,  available:5,  utilization:37  },
  { kit_id:'KIT-004', type:'Aluform 2.4×2.4', total:15, deployed:0,  available:15, utilization:0   },
  { kit_id:'KIT-005', type:'Aluform 3.0×0.6', total:12, deployed:6,  available:6,  utilization:50  },
]

// 6-month performance trend — used by LiveChart & VolumeChart
export const TREND_DATA = [
  { month:'Oct', cost:420000, saving:60000,  repetition:62 },
  { month:'Nov', cost:395000, saving:75000,  repetition:67 },
  { month:'Dec', cost:370000, saving:88000,  repetition:71 },
  { month:'Jan', cost:340000, saving:102000, repetition:74 },
  { month:'Feb', cost:310000, saving:115000, repetition:76 },
  { month:'Mar', cost:285000, saving:127000, repetition:79 },
]

export const BAR_DATA = TREND_DATA.map(d => ({
  d:   d.month,
  req: d.cost,
  err: d.saving,
}))

const ACTIVITY_POOL = [
  ['INFO',  'KIT-001 deployed to Zone-A, Metro Pier Cap',    'yard-ops'   ],
  ['INFO',  'Stripping complete for Podium Slab panel 12',   'site-crew'  ],
  ['WARN',  'KIT-002 cleaning delayed — crew unavailable',   'scheduler'  ],
  ['ERROR', 'Mould damage detected on KIT-003 unit 4',       'inspection' ],
  ['INFO',  'BoQ exported to ERP successfully',              'integration'],
  ['INFO',  'Optimization RUN-2026-005 completed',           'ml-engine'  ],
  ['WARN',  'Inventory count mismatch: KIT-002 +3 units',    'inventory'  ],
  ['INFO',  'KIT-001 reset and ready for Zone-A repeat',     'yard-ops'   ],
  ['ERROR', 'Schedule conflict detected: 2026-03-05',        'planner'    ],
  ['INFO',  'Aluform Tower Column ×15 reuse achieved',       'ml-engine'  ],
  ['INFO',  'Procurement order raised for KIT-006',          'procurement'],
  ['WARN',  'Cycle time exceeded by 4h on Podium Slab',      'monitor'    ],
  ['INFO',  'Quality check passed — KIT-001 batch 2',        'qc'         ],
  ['INFO',  'Go engine processed 10,000 rows in 1.2ms',      'optimizer'  ],
  ['INFO',  'New optimization request received',             'api-server' ],
]

let logCounter = 1000
export const generateLog = () => {
  const [level, msg, src] = ACTIVITY_POOL[Math.floor(Math.random() * ACTIVITY_POOL.length)]
  const now = new Date()
  return {
    id:    ++logCounter,
    time:  `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`,
    level, msg, src, isNew:true,
  }
}
export const generateSeedLogs = (count=12) =>
  Array.from({ length:count }, generateLog).map(l => ({ ...l, isNew:false }))

export const generateChartPoint = (base=55, variance=18) => ({
  t:  new Date().toLocaleTimeString('en',{ hour:'2-digit', minute:'2-digit', second:'2-digit' }),
  v:  Math.max(5, Math.min(98, base + (Math.random()-0.5)*variance*2)),
  v2: Math.max(5, Math.min(98, base*0.65 + (Math.random()-0.5)*variance*1.5)),
})
export const generateSeedChart = (points=20) =>
  Array.from({ length:points }, () => generateChartPoint())

export const validateItem = item => {
  const errors = {}
  if (!item.element_id?.trim())                        errors.element_id = 'Required'
  if (!item.length   || Number(item.length)   <= 0)   errors.length     = 'Must be > 0'
  if (!item.width    || Number(item.width)    <= 0)   errors.width      = 'Must be > 0'
  if (!item.quantity || Number(item.quantity) <= 0)   errors.quantity   = 'Must be > 0'
  if (!item.start_date)                               errors.start_date = 'Required'
  if (!item.end_date)                                 errors.end_date   = 'Required'
  if (item.start_date && item.end_date && item.start_date >= item.end_date)
    errors.end_date = 'Must be after start date'
  return errors
}
export const validatePayload = items => items.map(validateItem)

export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  ENDPOINTS: {
    OPTIMIZE:  '/api/optimize-kitting',
    HISTORY:   '/api/history',
    INVENTORY: '/api/inventory',
    HEALTH:    '/api/health',
  },
  TIMEOUT_MS: 30000,
}