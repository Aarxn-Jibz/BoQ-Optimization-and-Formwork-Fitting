import React from "react";

// ─── BADGE ──────────────────────────────────────────────────────
export function Badge({ variant = "ok", children }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

// ─── TOOLTIP WRAPPER ────────────────────────────────────────────
export function Tooltip({ tip, children }) {
  return (
    <div className="tooltip-wrap">
      {children}
      <div className="tooltip-box">{tip}</div>
    </div>
  );
}

// ─── LIVE INDICATOR ─────────────────────────────────────────────
export function LiveIndicator() {
  return (
    <div className="live-indicator">
      <div className="live-dot" />
      LIVE
    </div>
  );
}

// ─── SPARKLINE ──────────────────────────────────────────────────
export function Sparkline({ data = [], color = "#00D4FF" }) {
  return (
    <div className="sparkline">
      {data.slice(-14).map((v, i) => (
        <div
          key={i}
          className="spark-bar"
          style={{ height: `${Math.max(3, (v / 100) * 28)}px`, background: `${color}55` }}
        />
      ))}
    </div>
  );
}

// ─── MINI BAR ───────────────────────────────────────────────────
export function MiniBar({ pct, variant = "cyan" }) {
  return (
    <div className="mini-bar">
      <div className={`mini-bar-fill fill-${variant}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── SECTION HEADER ─────────────────────────────────────────────
export function SectionRow({ title, children }) {
  return (
    <div className="section-row">
      <span className="section-title">{title}</span>
      <div style={{ display:"flex", gap:6, alignItems:"center" }}>{children}</div>
    </div>
  );
}

// ─── STATUS DOT ─────────────────────────────────────────────────
export function StatusDot({ color = "green" }) {
  return <div className={`status-dot dot-${color}`} />;
}

// ─── DRAWER FIELD ───────────────────────────────────────────────
export function DrawerField({ label, value, children }) {
  return (
    <div className="drawer-field">
      <div className="drawer-field-label">{label}</div>
      {value !== undefined
        ? <div className="drawer-field-value">{value}</div>
        : children
      }
    </div>
  );
}

// ─── CUSTOM RECHARTS TOOLTIP ─────────────────────────────────────
export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#161B22", border: "1px solid rgba(0,212,255,0.2)", padding: "8px 12px", fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>
      <div style={{ color: "#7D8590", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display:"flex", gap:8, marginBottom:2 }}>
          <span style={{ color: p.color }}>{p.name}:</span>
          <span style={{ color: "#E6EDF3" }}>{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
}
