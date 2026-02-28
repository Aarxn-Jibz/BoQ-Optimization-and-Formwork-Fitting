export const NAV_ITEMS = [
  { id: "overview",   label: "Overview",      icon: "LayoutDashboard" },
  { id: "input",      label: "Input / BoQ",   icon: "ClipboardList"   },
  { id: "kitting",    label: "Kitting Plan",  icon: "Layers"          },
  { id: "inventory",  label: "Inventory",     icon: "Package"         },
  { id: "alerts",     label: "Alerts",        icon: "AlertTriangle"   },
  { id: "history",    label: "Run History",   icon: "History"         },
];

export const ALERT_FILTERS = ["all", "err", "warn", "ok"];

export const LOG_ENTRIES = [
  ["INFO",  "KIT-001 deployed to Zone-A, Column-A1",        "yard-ops"   ],
  ["INFO",  "Stripping complete for Slab-B1 panel 12",      "site-crew"  ],
  ["WARN",  "KIT-002 cleaning delayed — crew unavailable",  "scheduler"  ],
  ["ERROR", "Mould damage detected on KIT-003 unit 4",      "inspection" ],
  ["INFO",  "BoQ exported to ERP successfully",             "integration"],
  ["INFO",  "Optimization RUN-2026-001 completed",          "ml-engine"  ],
  ["WARN",  "Inventory count mismatch: KIT-002 +3 units",   "inventory"  ],
  ["INFO",  "KIT-001 reset and ready for Column-A2",        "yard-ops"   ],
  ["ERROR", "Schedule conflict detected: 2026-03-05",       "planner"    ],
  ["INFO",  "Aluform Tower Column ×15 reuse achieved",      "ml-engine"  ],
  ["WARN",  "Cycle time exceeded by 4h on Slab-B1",         "monitor"    ],
  ["INFO",  "Quality check passed — KIT-001 batch 2",       "qc"         ],
  ["INFO",  "Go engine processed 10,000 rows in 1.2ms",     "optimizer"  ],
  ["INFO",  "Procurement order raised for KIT-006",         "procurement"],
];

export const CMD_ITEMS = [
  { label: "Go to Overview",        hint: "⌘1", icon: "LayoutDashboard", nav: "overview"  },
  { label: "New Optimization Run",  hint: "⌘2", icon: "ClipboardList",   nav: "input"     },
  { label: "View Kitting Plan",     hint: "⌘3", icon: "Layers",          nav: "kitting"   },
  { label: "Check Inventory",       hint: "⌘4", icon: "Package",         nav: "inventory" },
  { label: "Manage Alerts",         hint: "⌘5", icon: "AlertTriangle",   nav: "alerts"    },
  { label: "Run History",           hint: "⌘H", icon: "History",         nav: "history"   },
  { label: "Refresh All Data",      hint: "⌘R", icon: "RefreshCw",       action: "refresh"},
  { label: "Toggle Sidebar",        hint: "⌘B", icon: "PanelLeft",       action: "sidebar"},
  { label: "Settings",              hint: "⌘,", icon: "Settings",        nav: "settings"  },
];

export const INITIAL_ALERTS = []

export const SERVICES_DATA = [
  { zone:"Zone-A · Columns", kit:"KIT-001", pours_done:8,  pours_left:2,  next_strip:"2026-03-05", status:"crit" },
  { zone:"Zone-B · Slabs",   kit:"KIT-002", pours_done:5,  pours_left:5,  next_strip:"2026-03-08", status:"warn" },
  { zone:"Zone-B · Beams",   kit:"KIT-003", pours_done:2,  pours_left:8,  next_strip:"2026-03-12", status:"ok"   },
  { zone:"Zone-C · Walls",   kit:"KIT-004", pours_done:0,  pours_left:10, next_strip:"—",          status:"idle" },
  { zone:"Zone-C · Columns", kit:"KIT-005", pours_done:6,  pours_left:4,  next_strip:"2026-03-06", status:"warn" },
  { zone:"Zone-A · Slabs",   kit:"KIT-006", pours_done:3,  pours_left:7,  next_strip:"2026-03-15", status:"ok"   },
];