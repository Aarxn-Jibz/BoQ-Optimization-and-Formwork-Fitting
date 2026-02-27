export const NAV_ITEMS = [
  { id: "overview",   label: "Overview",      icon: "LayoutDashboard" },
  { id: "input",      label: "Input / BoQ",   icon: "ClipboardList"   },
  { id: "kitting",    label: "Kitting Plan",  icon: "Layers"          },
  { id: "inventory",  label: "Inventory",     icon: "Package"         },
  { id: "alerts",     label: "Alerts",        icon: "AlertTriangle"   },
  { id: "history",    label: "Run History",   icon: "History"         },
];

export const TOP_NAV = ["dashboard", "optimizer", "inventory", "reports", "settings"];

export const CHART_TABS = ["cpu", "mem", "rps"];
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
  ["DEBUG", "Repetition rate recalculated: 78.3%",          "ml-engine"  ],
  ["WARN",  "Cycle time exceeded by 4h on Slab-B1",         "monitor"    ],
  ["INFO",  "Quality check passed — KIT-001 batch 2",       "qc"         ],
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

export const INITIAL_ALERTS = [
  { id:1, status:"err",  title:"Inventory Overrun",        sub:"KIT-002 exceeds yard capacity",   time:"2m ago",  ack:false },
  { id:2, status:"warn", title:"BoQ Deviation +12%",       sub:"Slab-B1 quantity mismatch",       time:"15m ago", ack:false },
  { id:3, status:"ok",   title:"KIT-001 Cycle Complete",   sub:"Column-A1 stripped successfully", time:"1h ago",  ack:true  },
  { id:4, status:"warn", title:"Low Repetition Rate",      sub:"Foundation elements < 2 reuses",  time:"2h ago",  ack:false },
  { id:5, status:"ok",   title:"Optimization Run Success", sub:"RUN-2026-001 completed",          time:"3h ago",  ack:true  },
  { id:6, status:"err",  title:"Schedule Conflict",        sub:"KIT-003 overlap on 2026-03-05",   time:"4h ago",  ack:false },
];

export const SERVICES_DATA = [
  { service: "api-gateway",   rps: "14.2K", p99: "42ms",  err: "0.002%", status: "ok"   },
  { service: "auth-service",  rps: "3.1K",  p99: "18ms",  err: "0.000%", status: "ok"   },
  { service: "ml-engine",     rps: "890",   p99: "210ms", err: "0.41%",  status: "warn" },
  { service: "go-optimizer",  rps: "240",   p99: "890ms", err: "1.20%",  status: "err"  },
  { service: "cache-layer",   rps: "28.9K", p99: "2ms",   err: "0.000%", status: "ok"   },
  { service: "scheduler",     rps: "120",   p99: "45ms",  err: "3.10%",  status: "err"  },
  { service: "erp-connector", rps: "18",    p99: "4.2s",  err: "0.80%",  status: "warn" },
  { service: "event-bus",     rps: "42.1K", p99: "5ms",   err: "0.000%", status: "ok"   },
];
