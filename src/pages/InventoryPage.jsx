import React, { useState } from "react";

const C = {
  cyan:"#00D4FF", green:"#3FB950", red:"#F85149", amber:"#D29922",
  void:"#0D1117", surface:"#161B22", border:"#21262D",
  text:"#E6EDF3", muted:"#7D8590", abyss:"#080B12",
};
const mono = { fontFamily:"'JetBrains Mono',monospace" };

function UtilBar({ value }) {
  const color = value >= 90 ? C.red : value >= 60 ? C.amber : value === 0 ? C.muted : C.green;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ flex:1, height:4, background:C.surface, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${value}%`,
          background:`linear-gradient(90deg,${color},${color}55)`,
          transition:"width 1s ease" }} />
      </div>
      <span style={{ ...mono, fontSize:11, fontWeight:600, color, width:36, textAlign:"right" }}>
        {value}%
      </span>
    </div>
  );
}

function StatusBadge({ value }) {
  const s = value >= 90 ? { c:"err", t:"CRITICAL" }
    : value >= 60 ? { c:"warn", t:"IN USE" }
    : value === 0 ? { c:"idle", t:"IDLE" }
    : { c:"ok", t:"AVAILABLE" };
  const colors = {
    err:  [C.red,   "rgba(248,81,73,0.12)"],
    warn: [C.amber, "rgba(210,153,34,0.12)"],
    ok:   [C.green, "rgba(63,185,80,0.12)"],
    idle: [C.muted, "rgba(125,133,144,0.08)"],
  };
  const [fg, bg] = colors[s.c];
  return (
    <span style={{ ...mono, fontSize:9, fontWeight:600, padding:"2px 7px",
      textTransform:"uppercase", letterSpacing:"0.08em",
      color:fg, background:bg, border:`1px solid ${fg}35` }}>
      {s.t}
    </span>
  );
}

function FilterPill({ label, active, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ ...mono, fontSize:9, fontWeight:600, padding:"3px 8px", cursor:"pointer",
        textTransform:"uppercase", letterSpacing:"0.08em",
        color: active ? C.cyan : h ? C.text : C.muted,
        background: active ? "rgba(0,212,255,0.1)" : "none",
        border: `1px solid ${active ? "rgba(0,212,255,0.4)" : C.border}`,
        transition:"all 80ms" }}>
      {label}
    </div>
  );
}

function InventoryRow({ item, idx, onItemClick }) {
  const [h, setH] = useState(false);
  return (
    <tr
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      onClick={() => onItemClick?.(item)}
      style={{
        background: h ? "rgba(0,212,255,0.03)" : idx % 2 === 0 ? "transparent" : "rgba(8,11,18,0.3)",
        borderBottom:`1px solid rgba(33,38,45,0.6)`,
        cursor:"pointer", transition:"background 80ms",
      }}>
      <td style={{ ...mono, fontSize:12, color:C.cyan,  padding:"0 16px", height:40 }}>{item.kit_id}</td>
      <td style={{ fontSize:13, color:C.text, padding:"0 16px" }}>{item.type}</td>
      <td style={{ ...mono, fontSize:12, color:C.text,  padding:"0 16px" }}>{item.total}</td>
      <td style={{ ...mono, fontSize:12, color:item.deployed  > 0 ? C.cyan  : C.muted, padding:"0 16px" }}>{item.deployed}</td>
      <td style={{ ...mono, fontSize:12, color:item.available > 0 ? C.green : C.muted, padding:"0 16px" }}>{item.available}</td>
      <td style={{ padding:"0 16px", minWidth:160 }}><UtilBar value={item.utilization} /></td>
      <td style={{ padding:"0 16px" }}><StatusBadge value={item.utilization} /></td>
    </tr>
  );
}

// ── Empty state when no run has happened yet ──────────────────
function EmptyState({ onGoToInput }) {
  return (
    <div style={{ padding:"60px 20px", textAlign:"center" }}>
      <div style={{ ...mono, fontSize:32, color:"#21262D", marginBottom:12 }}>◈</div>
      <div style={{ ...mono, fontSize:12, color:"#7D8590", marginBottom:6,
        textTransform:"uppercase", letterSpacing:"0.1em" }}>
        No inventory data yet
      </div>
      <div style={{ fontSize:13, color:"#484F58", marginBottom:20, fontFamily:"Inter,sans-serif" }}>
        Run an optimization first — inventory is generated from your kit_details
      </div>
      <button onClick={onGoToInput} style={{
        background:"#00D4FF", border:"none", color:"#080B12",
        fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700,
        padding:"9px 22px", cursor:"pointer", letterSpacing:"0.06em",
      }}>
        ▶  GO TO INPUT / BoQ
      </button>
    </div>
  );
}

export default function InventoryPage({ inventoryData = [], onItemClick, push }) {
  const [sortBy,       setSortBy]   = useState("kit_id");
  const [sortDir,      setSortDir]  = useState("asc");
  const [filterStatus, setFilter]   = useState("all");

  const toggleSort = (col) => {
    setSortDir(d => sortBy === col ? (d === "asc" ? "desc" : "asc") : "asc");
    setSortBy(col);
  };

  const filtered = inventoryData
    .filter(i =>
      filterStatus === "all"      ? true :
      filterStatus === "deployed" ? i.deployed > 0 :
      filterStatus === "idle"     ? i.utilization === 0 :
      filterStatus === "critical" ? i.utilization >= 90 : true
    )
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      return a[sortBy] > b[sortBy] ? dir : -dir;
    });

  const totalDeployed  = inventoryData.reduce((s, i) => s + i.deployed,  0);
  const totalAvailable = inventoryData.reduce((s, i) => s + i.available, 0);
  const totalKits      = inventoryData.reduce((s, i) => s + i.total,     0);
  const avgUtil        = inventoryData.length
    ? Math.round(inventoryData.reduce((s, i) => s + i.utilization, 0) / inventoryData.length) : 0;

  const noData = inventoryData.length === 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* KPI row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[
          { label:"TOTAL KIT SETS",  value: noData ? "—" : totalKits,              color:C.text  },
          { label:"DEPLOYED",        value: noData ? "—" : totalDeployed,           color:C.cyan  },
          { label:"AVAILABLE",       value: noData ? "—" : totalAvailable,          color:C.green },
          { label:"AVG UTILIZATION", value: noData ? "—" : `${avgUtil}%`,
            color: avgUtil >= 80 ? C.red : avgUtil >= 60 ? C.amber : C.green },
        ].map(k => (
          <div key={k.label} style={{ background:C.void, border:`1px solid ${C.border}`,
            padding:"14px 18px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:1,
              background:`linear-gradient(90deg,${k.color} 0%,transparent 60%)`, opacity:0.4 }} />
            <div style={{ ...mono, fontSize:10, fontWeight:600, letterSpacing:"0.12em",
              textTransform:"uppercase", color:C.muted, marginBottom:8 }}>
              {k.label}
            </div>
            <div style={{ ...mono, fontSize:26, fontWeight:700, color:k.color }}>
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:C.void, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"10px 16px", borderBottom:`1px solid ${C.border}`,
          background:"rgba(0,212,255,0.02)", flexWrap:"wrap", gap:8 }}>
          <div style={{ ...mono, fontSize:10, fontWeight:600, color:C.text,
            textTransform:"uppercase", letterSpacing:"0.12em" }}>
            YARD INVENTORY STATUS
          </div>
          {!noData && (
            <div style={{ display:"flex", gap:6 }}>
              {["all","deployed","idle","critical"].map(f => (
                <FilterPill key={f} label={f} active={filterStatus === f} onClick={() => setFilter(f)} />
              ))}
            </div>
          )}
        </div>

        {noData ? (
          <EmptyState onGoToInput={() => window.dispatchEvent(new CustomEvent("kit-nav", { detail:"input" }))} />
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                {[["kit_id","KIT ID"],["type","TYPE"],["total","TOTAL"],
                  ["deployed","DEPLOYED"],["available","AVAILABLE"],
                  ["utilization","UTILIZATION"],["","STATUS"]].map(([col, label]) => (
                  <th key={label} onClick={() => col && toggleSort(col)}
                    style={{ ...mono, fontSize:10, fontWeight:600, letterSpacing:"0.08em",
                      color: sortBy === col ? C.cyan : C.muted,
                      padding:"8px 16px", textAlign:"left",
                      cursor: col ? "pointer" : "default", whiteSpace:"nowrap" }}>
                    {label}{sortBy === col ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <InventoryRow key={item.kit_id} item={item} idx={i} onItemClick={onItemClick} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}