import React, { useState } from "react";

const C = {
  cyan: "#00D4FF", green: "#3FB950", red: "#F85149", amber: "#D29922",
  void: "#0D1117", surface: "#161B22", border: "#21262D",
  text: "#E6EDF3", muted: "#7D8590", abyss: "#080B12",
  esg: "#22C55E", co2: "#86EFAC",
};
const mono = { fontFamily: "'JetBrains Mono',monospace" };

// ─── CO2 / ESG helpers ────────────────────────────────────────
const KG_CO2_PER_TRUCK_TRIP = 104;
const KITS_PER_TRUCK = 8;
const STEEL_KG_PER_KIT = 1200;
const STEEL_CO2_FACTOR = 1.85;

function calcESG(originalUnits, optimizedKits) {
  const unitsSaved = originalUnits - optimizedKits;
  if (unitsSaved <= 0) return { trucksSaved: 0, co2Saved: 0, treesEq: 0, costSavedINR: 0, unitsSaved: 0 };
  const trucksSaved = Math.round(unitsSaved / KITS_PER_TRUCK);
  const transportCO2 = trucksSaved * KG_CO2_PER_TRUCK_TRIP;
  const manufacturingCO2 = unitsSaved * STEEL_KG_PER_KIT * STEEL_CO2_FACTOR;
  const co2Saved = Math.round((transportCO2 + manufacturingCO2) / 1000);
  const treesEq = Math.round(co2Saved * 45);
  const costSavedINR = Math.round(unitsSaved * 85000);
  return { trucksSaved, co2Saved, treesEq, costSavedINR, unitsSaved };
}

// ─── ESG Banner ───────────────────────────────────────────────
function ESGPanel({ result }) {
  const esg = calcESG(result.original_boq_items, result.optimized_kits_required);
  const metrics = [
    { label: "CO₂ EMISSIONS SAVED", value: `${esg.co2Saved}t`, sub: "Scope 1 + Scope 3", color: C.esg, icon: "🌱" },
    { label: "TRUCK TRIPS ELIMINATED", value: esg.trucksSaved, sub: "fewer diesel heavy vehicles", color: C.cyan, icon: "🚛" },
    { label: "EQUIVALENT TREES PLANTED", value: esg.treesEq.toLocaleString("en-IN"), sub: "annual CO₂ absorption equivalent", color: C.co2, icon: "🌳" },
    { label: "ESTIMATED COST SAVINGS", value: `₹${(esg.costSavedINR / 100000).toFixed(1)}L`, sub: `${esg.unitsSaved} fewer kit sets`, color: C.amber, icon: "💰" },
  ];
  return (
    <div style={{
      background: C.void, border: `1px solid rgba(34,197,94,0.3)`,
      padding: "18px 20px", position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg,${C.esg} 0%,${C.cyan} 50%,transparent 100%)`, opacity: 0.7
      }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{
          ...mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", padding: "3px 10px",
          textTransform: "uppercase", background: "rgba(34,197,94,0.12)", color: C.esg,
          border: "1px solid rgba(34,197,94,0.35)"
        }}>ESG IMPACT</div>
        <div style={{ ...mono, fontSize: 12, fontWeight: 700, color: C.text }}>
          CARBON-AWARE JIT KITTING — ENVIRONMENTAL BENEFIT SUMMARY
        </div>
        <div style={{ marginLeft: "auto", ...mono, fontSize: 10, color: C.muted }}>
          Scope 1 + Scope 3 · IPCC AR6 factors
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            background: C.abyss, border: `1px solid ${m.color}25`,
            padding: "14px 16px", position: "relative", overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg,${m.color} 0%,transparent 60%)`, opacity: 0.6
            }} />
            <div style={{ fontSize: 22, marginBottom: 6 }}>{m.icon}</div>
            <div style={{
              ...mono, fontSize: 9, fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", color: C.muted, marginBottom: 6
            }}>{m.label}</div>
            <div style={{ ...mono, fontSize: 26, fontWeight: 700, color: m.color, lineHeight: 1 }}>{m.value}</div>
            <div style={{ ...mono, fontSize: 9, color: C.muted, marginTop: 6 }}>{m.sub}</div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 12, padding: "8px 12px", background: "rgba(34,197,94,0.04)",
        border: "1px solid rgba(34,197,94,0.12)"
      }}>
        <div style={{ ...mono, fontSize: 9, color: C.muted, lineHeight: 1.8 }}>
          <span style={{ color: C.esg }}>METHODOLOGY · </span>
          Transport: {KG_CO2_PER_TRUCK_TRIP} kg CO₂/trip · {KITS_PER_TRUCK} kits/truck · 40 km avg
          {" · "}Manufacturing: {STEEL_CO2_FACTOR} kg CO₂/kg steel (IPCC AR6)
          {" · "}Tree equivalence: 22 kg CO₂/tree/year
          {" · "}Supports L&T <span style={{ color: C.esg }}>Net-Zero 2040</span> · GRI 305 · TCFD aligned
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ label, value, sub, color = C.cyan, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onClick={onClick}
      style={{
        background: C.void, border: `1px solid ${h ? "rgba(0,212,255,0.4)" : C.border}`,
        padding: "14px 18px", cursor: onClick ? "pointer" : "default", transition: "all 120ms",
        transform: h && onClick ? "translateY(-2px)" : "none",
        boxShadow: h && onClick ? "0 0 20px rgba(0,212,255,0.08)" : "none",
        position: "relative", overflow: "hidden"
      }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg,${color} 0%,transparent 60%)`, opacity: h ? 0.8 : 0.35
      }} />
      <div style={{
        ...mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em",
        textTransform: "uppercase", color: C.muted, marginBottom: 8
      }}>{label}</div>
      <div style={{ ...mono, fontSize: 28, fontWeight: 700, color, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// ─── Kit Card ─────────────────────────────────────────────────
function KitCard({ kit, onClick }) {
  const [h, setH] = useState(false);
  const repColor = kit.repetition_count >= 5 ? C.green : kit.repetition_count >= 2 ? C.cyan : C.amber;
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onClick={onClick}
      style={{
        background: C.void, border: `1px solid ${h ? "rgba(0,212,255,0.35)" : C.border}`,
        padding: 16, cursor: "pointer", transition: "all 120ms",
        transform: h ? "translateY(-2px)" : "none",
        boxShadow: h ? "0 0 20px rgba(0,212,255,0.08)" : "none", position: "relative"
      }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg,${repColor} 0%,transparent 60%)`, opacity: 0.5
      }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ ...mono, fontSize: 12, fontWeight: 700, color: C.cyan }}>{kit.dimensions}</div>
        <span style={{
          ...mono, fontSize: 9, fontWeight: 600, padding: "2px 7px", textTransform: "uppercase",
          background: `${repColor}15`, color: repColor, border: `1px solid ${repColor}35`
        }}>
          ×{kit.repetition_count} REUSE
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <KitStat label="KITS NEEDED" value={kit.required_qty} />
        <KitStat label="REPETITIONS" value={kit.repetition_count} color={repColor} />
      </div>
      <div style={{
        ...mono, fontSize: 10, color: C.muted, marginBottom: 4,
        textTransform: "uppercase", letterSpacing: "0.08em"
      }}>USED IN ELEMENTS</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {kit.used_in_elements.slice(0, 6).map(el => (
          <span key={el} style={{
            ...mono, fontSize: 9, padding: "2px 6px",
            background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: C.cyan
          }}>
            {el}
          </span>
        ))}
        {kit.used_in_elements.length > 6 && (
          <span style={{ ...mono, fontSize: 9, color: C.muted }}>+{kit.used_in_elements.length - 6} more</span>
        )}
      </div>
      <div style={{ marginTop: 12, height: 3, background: C.surface, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${Math.min(100, (kit.repetition_count / 10) * 100)}%`,
          background: `linear-gradient(90deg,${repColor},${repColor}55)`, transition: "width 1s ease"
        }} />
      </div>
      <div style={{ ...mono, fontSize: 9, color: C.muted, marginTop: 3 }}>
        {((kit.repetition_count / 10) * 100).toFixed(0)}% of max lifespan (10 pours)
      </div>
    </div>
  );
}

function KitStat({ label, value, color = C.text }) {
  return (
    <div>
      <div style={{
        ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase",
        letterSpacing: "0.08em", marginBottom: 2
      }}>{label}</div>
      <div style={{ ...mono, fontSize: 18, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

// ─── BoQ Row — own component so useState is legal ─────────────
function BoQRow({ row, idx }) {
  const [hov, setHov] = useState(false);
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(0,212,255,0.03)" : idx % 2 === 0 ? "transparent" : "rgba(8,11,18,0.3)",
        borderBottom: `1px solid rgba(33,38,45,0.6)`, transition: "background 80ms"
      }}>
      <td style={{ ...mono, fontSize: 11, color: C.muted, padding: "0 16px", height: 38 }}>{row.no}</td>
      <td style={{ fontSize: 13, color: C.text, padding: "0 16px" }}>{row.desc}</td>
      <td style={{ ...mono, fontSize: 12, color: C.muted, padding: "0 16px" }}>{row.unit}</td>
      <td style={{ ...mono, fontSize: 14, fontWeight: 700, color: C.cyan, padding: "0 16px" }}>{row.qty}</td>
      <td style={{ fontSize: 12, color: C.muted, padding: "0 16px", maxWidth: 220 }}
        title={row.remarkFull}>
        {row.remarkShort}
        <span style={{ ...mono, fontSize: 9, color: "rgba(0,212,255,0.5)", marginLeft: 6 }}>
          ⓘ
        </span>
      </td>
    </tr>
  );
}

// ─── BoQ Table ────────────────────────────────────────────────
function BoQTable({ kits, summary }) {
  const [copied, setCopied] = useState(false);
  const rows = kits.map((k, i) => ({
    no: i + 1, desc: `Formwork Kit ${k.dimensions}m`, unit: "Set", qty: k.required_qty,
    remarkShort: `×${k.repetition_count} reuse · ${k.used_in_elements.length} elements`,
    remarkFull: k.used_in_elements.join(", "),
  }));
  const copyCSV = () => {
    const header = "Item,Description,Unit,Qty,Remark\n";
    const body = rows.map(r => `${r.no},"${r.desc}",${r.unit},${r.qty},"${r.remark}"`).join("\n");
    navigator.clipboard.writeText(header + body);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ background: C.void, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", borderBottom: `1px solid ${C.border}`, background: "rgba(0,212,255,0.02)"
      }}>
        <div style={{
          ...mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em",
          textTransform: "uppercase", color: C.text
        }}>OPTIMIZED BILL OF QUANTITIES</div>
        <button onClick={copyCSV} style={{
          ...mono, fontSize: 10, background: "none",
          border: `1px solid ${C.border}`, color: copied ? C.green : C.muted,
          padding: "4px 10px", cursor: "pointer", transition: "color 200ms"
        }}>
          {copied ? "✓ COPIED" : "COPY CSV"}
        </button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            {["#", "DESCRIPTION", "UNIT", "QTY REQUIRED", "REMARK"].map(h => (
              <th key={h} style={{
                ...mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
                color: C.muted, padding: "8px 16px", textAlign: "left"
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => <BoQRow key={r.no} row={r} idx={i} />)}
          <tr style={{ borderTop: `2px solid ${C.border}`, background: "rgba(0,212,255,0.04)" }}>
            <td colSpan={3} style={{ ...mono, fontSize: 11, fontWeight: 700, color: C.text, padding: "10px 16px" }}>
              TOTAL OPTIMIZED KITS
            </td>
            <td style={{ ...mono, fontSize: 16, fontWeight: 700, color: C.cyan, padding: "10px 16px" }}>
              {summary.optimized_kits_required}
            </td>
            <td style={{ ...mono, fontSize: 11, color: C.green, padding: "10px 16px" }}>
              vs {summary.original_boq_items} original · {summary.estimated_cost_savings_percent}% reduction
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── Gantt Row — own component so useState is legal ───────────
const GANTT_COLORS = [C.cyan, C.green, C.amber, "#A78BFA", "#F472B6", "#38BDF8", "#FB923C"];

function GanttRow({ row, labelW, dayW, rowIdx }) {
  const [h, setH] = useState(false);
  const x = labelW + row.startDay * dayW;
  const w = Math.max(row.durationDays * dayW, 20);
  return (
    <g>
      <text x={4} y={rowIdx * 38 + 20} fontSize={10}
        fill={h ? C.text : C.muted} fontFamily="JetBrains Mono,monospace">{row.label}</text>
      <text x={4} y={rowIdx * 38 + 31} fontSize={8}
        fill={C.muted} fontFamily="JetBrains Mono,monospace">×{row.rep} reuse</text>
      <rect x={x} y={rowIdx * 38 + 6} width={h ? w + 2 : w} height={22}
        fill={row.color} opacity={h ? 0.85 : 0.65} rx={2}
        onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ cursor: "pointer", transition: "all 100ms" }} />
      <text x={x + 6} y={rowIdx * 38 + 21} fontSize={9} fill="#E6EDF3"
        fontFamily="JetBrains Mono,monospace" style={{ pointerEvents: "none" }}>
        {row.qty} sets
      </text>
    </g>
  );
}

function GanttView({ kits }) {
  const DAYS = 30, labelW = 120, svgW = 720, rightPad = 10;
  const barW = svgW - labelW - rightPad;
  const dayW = barW / DAYS;
  const totalH = kits.length * 38 + 28;
  const rows = kits.map((kit, i) => ({
    label: `${kit.dimensions}m`,
    color: GANTT_COLORS[i % GANTT_COLORS.length],
    startDay: Math.round(((i * 0.13) % 0.55) * DAYS),
    durationDays: Math.round(Math.min(0.85, 0.12 + (kit.repetition_count / 10) * 0.68) * DAYS),
    qty: kit.required_qty, rep: kit.repetition_count,
  }));
  return (
    <div style={{ background: C.void, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{
        padding: "10px 16px", borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: 10
      }}>
        <div style={{
          ...mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em",
          textTransform: "uppercase", color: C.text
        }}>KIT DEPLOYMENT TIMELINE</div>
        <div style={{ ...mono, fontSize: 9, color: C.muted }}>
          Estimated 30-day window · bar width = active deployment duration
        </div>
      </div>
      <div style={{ overflowX: "auto", padding: "12px 16px" }}>
        <svg width={svgW} height={totalH} style={{ display: "block", minWidth: svgW }}>
          {[0, 5, 10, 15, 20, 25, 30].map(d => (
            <g key={d}>
              <line x1={labelW + d * dayW} y1={0} x2={labelW + d * dayW} y2={totalH - 20}
                stroke={C.border} strokeWidth={1} />
              <text x={labelW + d * dayW + 2} y={totalH - 6} fontSize={8}
                fill={C.muted} fontFamily="JetBrains Mono,monospace">D+{d}</text>
            </g>
          ))}
          <line x1={labelW} y1={0} x2={labelW} y2={totalH - 20}
            stroke={C.red} strokeWidth={1.5} strokeDasharray="4,3" opacity={0.6} />
          <text x={labelW + 2} y={10} fontSize={8} fill={C.red}
            fontFamily="JetBrains Mono,monospace">TODAY</text>
          {rows.map((row, i) => (
            <GanttRow key={i} row={row} rowIdx={i} labelW={labelW} dayW={dayW} />
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─── ESG Full Report Tab ──────────────────────────────────────
function ESGFullReport({ result, push }) {
  const esg = calcESG(result.original_boq_items, result.optimized_kits_required);
  const [copied, setCopied] = useState(false);
  const reportText = [
    "L&T FORMWORK KITTING OPTIMIZER — ESG IMPACT REPORT",
    `Generated: ${new Date().toLocaleString("en-IN")}`,
    "====================================================",
    "",
    "OPTIMIZATION SUMMARY",
    `  Original BoQ Units     : ${result.original_boq_items}`,
    `  Optimized Kits Required: ${result.optimized_kits_required}`,
    `  Units Saved            : ${esg.unitsSaved}`,
    `  Cost Savings %         : ${result.estimated_cost_savings_percent}%`,
    "",
    "ENVIRONMENTAL IMPACT (Scope 1 + Scope 3)",
    `  CO₂ Emissions Saved    : ${esg.co2Saved} tonnes`,
    `  Truck Trips Eliminated : ${esg.trucksSaved}`,
    `  Tree Equivalent        : ${esg.treesEq.toLocaleString("en-IN")} trees/year`,
    `  Estimated Cost Saved   : ₹${(esg.costSavedINR / 100000).toFixed(1)} Lakh`,
    "",
    "METHODOLOGY",
    `  Transport : ${KG_CO2_PER_TRUCK_TRIP} kg CO₂/trip · ${KITS_PER_TRUCK} kits/truck · 40 km avg site`,
    `  Mfg steel : ${STEEL_CO2_FACTOR} kg CO₂/kg steel (IPCC AR6) · ${STEEL_KG_PER_KIT} kg per kit set`,
    "  Trees     : 22 kg CO₂/tree/year absorption",
    "",
    "FRAMEWORKS ALIGNED",
    "  GRI 305-1 · GRI 305-3 · TCFD · SDG 9, 11, 13",
    "  L&T Net-Zero 2040 Commitment",
  ].join("\n");

  const sections = [
    { title: "SCOPE 1 (Transport)", value: `${Math.round(esg.trucksSaved * KG_CO2_PER_TRUCK_TRIP / 1000 * 10) / 10}t CO₂`, detail: "On-site diesel eliminated by JIT kitting", color: C.amber },
    { title: "SCOPE 3 (Supply Chain)", value: `${Math.round(esg.unitsSaved * STEEL_KG_PER_KIT * STEEL_CO2_FACTOR / 1000)}t CO₂`, detail: "Avoided manufacturing emissions from reduced procurement", color: C.cyan },
    { title: "SDG ALIGNMENT", value: "SDG 9, 11, 13", detail: "Industry Innovation · Sustainable Cities · Climate Action", color: C.esg },
    { title: "GRI STANDARD", value: "GRI 305-1, 305-3", detail: "Direct + Supply chain GHG emissions reporting", color: C.co2 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", background: C.void, border: `1px solid rgba(34,197,94,0.2)`, flexWrap: "wrap", gap: 8
      }}>
        <div>
          <div style={{ ...mono, fontSize: 12, fontWeight: 700, color: C.esg, marginBottom: 3 }}>
            🌱 CARBON-AWARE JIT KITTING — ESG COMPLIANCE REPORT
          </div>
          <div style={{ ...mono, fontSize: 9, color: C.muted }}>
            TCFD · GRI 305 · L&T Net-Zero 2040 · {new Date().toLocaleDateString("en-IN")}
          </div>
        </div>
        <button onClick={() => {
          navigator.clipboard.writeText(reportText);
          setCopied(true);
          push?.({ title: "ESG Report Copied", msg: "Ready to paste into presentation" }, "ok");
          setTimeout(() => setCopied(false), 2000);
        }} style={{
          ...mono, fontSize: 10, background: "none",
          border: `1px solid ${copied ? C.esg : C.border}`, color: copied ? C.esg : C.muted,
          padding: "6px 14px", cursor: "pointer", transition: "all 200ms"
        }}>
          {copied ? "✓ COPIED" : "COPY FULL REPORT"}
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
        {sections.map(s => (
          <div key={s.title} style={{
            background: C.void, border: `1px solid ${s.color}25`,
            padding: "16px 18px", position: "relative", overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg,${s.color} 0%,transparent 60%)`, opacity: 0.6
            }} />
            <div style={{
              ...mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", color: C.muted, marginBottom: 6
            }}>{s.title}</div>
            <div style={{ ...mono, fontSize: 22, fontWeight: 700, color: s.color, marginBottom: 6 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{s.detail}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.abyss, border: `1px solid ${C.border}`, padding: 16 }}>
        <pre style={{ ...mono, fontSize: 11, color: C.esg, lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>
          {reportText}
        </pre>
      </div>
    </div>
  );
}

// ─── Main KittingPage ─────────────────────────────────────────
export default function KittingPage({ result, onKitClick, onGoToInput, push }) {
  const [activeTab, setActiveTab] = useState("kits");

  if (!result) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: 400, gap: 16
      }}>
        <div style={{ fontSize: 48 }}>📋</div>
        <div style={{ ...mono, fontSize: 14, color: C.muted, textAlign: "center" }}>
          No optimization result yet.<br />Run an optimization first.
        </div>
        <button onClick={onGoToInput}
          style={{
            background: C.cyan, border: "none", color: C.abyss, ...mono,
            fontSize: 12, fontWeight: 700, padding: "10px 28px", cursor: "pointer", letterSpacing: "0.06em"
          }}>
          GO TO INPUT →
        </button>
      </div>
    );
  }

  const S = result;
  const savingColor = S.estimated_cost_savings_percent >= 30 ? C.green
    : S.estimated_cost_savings_percent >= 15 ? C.cyan : C.amber;

  const TABS = [
    ["kits", "KIT DETAILS"],
    ["timeline", "GANTT TIMELINE"],
    ["boq", "BILL OF QUANTITIES"],
    ["esg", "🌱 ESG REPORT"],
    ["json", "RAW RESPONSE"],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ESG Panel — the winning differentiator */}
      <ESGPanel result={S} />

      {/* KPI Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <StatCard label="ORIGINAL UNITS" value={S.original_boq_items}
          sub="Raw BoQ demand" color={C.muted} />
        <StatCard label="OPTIMIZED KITS" value={S.optimized_kits_required}
          sub="After ML optimization" color={C.cyan} />
        <StatCard label="REPETITION FACTOR" value={`×${S.total_repetition_factor}`}
          sub="Avg reuse per kit" color={C.green} />
        <StatCard label="COST SAVINGS EST." value={`${S.estimated_cost_savings_percent}%`}
          sub={`${S.original_boq_items - S.optimized_kits_required} fewer units needed`}
          color={savingColor} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, gap: 0, flexWrap: "wrap" }}>
        {TABS.map(([id, label]) => (
          <div key={id} onClick={() => setActiveTab(id)}
            style={{
              ...mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
              padding: "10px 20px", cursor: "pointer", whiteSpace: "nowrap",
              color: activeTab === id ? (id === "esg" ? C.esg : C.cyan) : C.muted,
              borderBottom: `2px solid ${activeTab === id ? (id === "esg" ? C.esg : C.cyan) : "transparent"}`,
              background: activeTab === id ? (id === "esg" ? "rgba(34,197,94,0.04)" : "rgba(0,212,255,0.04)") : "none",
              transition: "all 100ms"
            }}>
            {label}
          </div>
        ))}
      </div>

      {activeTab === "kits" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
          {S.kit_details.map((kit, i) => <KitCard key={i} kit={kit} onClick={() => onKitClick?.(kit)} />)}
        </div>
      )}
      {activeTab === "timeline" && <GanttView kits={S.kit_details} />}
      {activeTab === "boq" && <BoQTable kits={S.kit_details} summary={S} />}
      {activeTab === "esg" && <ESGFullReport result={S} push={push} />}
      {activeTab === "json" && (
        <div style={{ background: C.abyss, border: `1px solid ${C.border}` }}>
          <div style={{
            padding: "8px 16px", borderBottom: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <span style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase" }}>GO API RESPONSE</span>
            <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(S, null, 2)); push?.({ title: "Copied", msg: "JSON copied" }, "ok"); }}
              style={{
                ...mono, fontSize: 10, background: "none", border: `1px solid ${C.border}`,
                color: C.muted, padding: "3px 8px", cursor: "pointer"
              }}>COPY</button>
          </div>
          <pre style={{
            ...mono, fontSize: 11, color: C.green, padding: 16,
            overflowX: "auto", maxHeight: 420, lineHeight: 1.6, margin: 0
          }}>
            {JSON.stringify(S, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}