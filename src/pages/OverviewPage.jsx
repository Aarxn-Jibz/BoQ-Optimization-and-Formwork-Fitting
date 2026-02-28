import React from "react";
import MetricsGrid   from "../components/metrics/MetricsGrid";
import LiveChart     from "../components/charts/LiveChart";
import VolumeChart   from "../components/charts/VolumeChart";
import AlertsPanel   from "../components/alerts/AlertsPanel";
import ServicesTable from "../components/logs/ServicesTable";

const C = {
  cyan: "#00D4FF", green: "#3FB950", red: "#F85149", amber: "#D29922",
  void: "#0D1117", border: "#21262D", text: "#E6EDF3", muted: "#7D8590",
};
const mono = "'JetBrains Mono', monospace";

// ── Compute priority bullets from LIVE inventory state ────────
function getPriorities(inventoryData) {
  if (!inventoryData || inventoryData.length === 0) {
    return [{ level: "info", text: "No optimization run yet — upload a BoQ and run optimization to see live data" }];
  }
  const out = [];
  inventoryData.forEach(item => {
    if (item.utilization >= 100)
      out.push({ level: "err",  text: `${item.kit_id} (${item.type}) fully deployed — strip or reorder now` });
    else if (item.utilization >= 80)
      out.push({ level: "warn", text: `${item.kit_id} at ${item.utilization}% — only ${item.available} sets left` });
    else if (item.utilization === 0)
      out.push({ level: "info", text: `${item.kit_id} idle — consider redeployment` });
  });
  if (out.length === 0)
    out.push({ level: "ok", text: "All kit sets within safe utilization limits" });
  return out;
}

// ── TODAY CARD ────────────────────────────────────────────────
function TodayCard({ onGoToInput, inventoryData }) {
  const items     = getPriorities(inventoryData);
  const hasIssues = items.some(p => p.level === "err" || p.level === "warn");
  const isNew     = !inventoryData || inventoryData.length === 0;
  const accent    = isNew ? C.cyan : hasIssues ? C.red : C.green;
  const dotColor  = { err: C.red, warn: C.amber, ok: C.green, info: C.cyan };

  return (
    <div style={{
      background: C.void,
      border: `1px solid ${isNew ? "rgba(0,212,255,0.2)" : hasIssues ? "rgba(248,81,73,0.25)" : "rgba(63,185,80,0.2)"}`,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg,${accent} 0%,transparent 60%)`, opacity: 0.8 }} />

      <div style={{ padding: "18px 22px" }}>
        {/* Row 1 — title + buttons */}
        <div style={{ display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
          <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.14em", textTransform: "uppercase", color: accent }}>
            {isNew ? "▶  GET STARTED" : hasIssues ? "⚠  TODAY'S PRIORITIES" : "✓  ALL SYSTEMS NOMINAL"}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
            <button onClick={onGoToInput} style={{
              background: C.cyan, border: "none", color: "#080B12",
              fontFamily: mono, fontSize: 11, fontWeight: 700,
              padding: "9px 22px", cursor: "pointer", letterSpacing: "0.06em",
              boxShadow: "0 0 16px rgba(0,212,255,0.25)",
            }}>
              ▶  RUN OPTIMIZATION
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("kit-nav", { detail: "inventory" }))}
              style={{
                background: "none", border: `1px solid ${C.border}`,
                color: C.muted, fontFamily: mono, fontSize: 11,
                padding: "9px 16px", cursor: "pointer", letterSpacing: "0.04em",
              }}>
              VIEW INVENTORY
            </button>
          </div>
        </div>

        {/* Row 2 — bullets */}
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {items.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 5,
                background: dotColor[p.level] ?? C.muted,
                boxShadow: `0 0 5px ${dotColor[p.level] ?? C.muted}`,
              }} />
              <span style={{ fontSize: 13, lineHeight: 1.5,
                color: p.level === "ok" ? C.muted : C.text,
                fontFamily: "'Inter',sans-serif" }}>
                {p.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── RESULT BANNER ─────────────────────────────────────────────
function ResultBanner({ result }) {
  const esgCO2 = Math.round(
    ((result.original_boq_items - result.optimized_kits_required) * 1200 * 1.85) / 1000
  );
  const stats = [
    { label: "Original Units", value: String(result.original_boq_items),                     color: C.muted  },
    { label: "Optimized Kits", value: String(result.optimized_kits_required),                 color: C.cyan   },
    { label: "Reuse Factor",   value: `×${result.total_repetition_factor.toFixed(1)}`,        color: C.green  },
    { label: "Cost Reduction", value: `${result.estimated_cost_savings_percent.toFixed(1)}%`, color: C.green  },
    { label: "CO₂ Avoided",    value: `${esgCO2}t`,                                          color: "#22C55E"},
    ...(result.execution_time_ms ? [{ label: "Engine Time", value: result.execution_time_ms, color: C.cyan }] : []),
  ];
  return (
    <div style={{ background: C.void, border: "1px solid rgba(63,185,80,0.22)",
      padding: "12px 22px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg,#3FB950,transparent 55%)", opacity: 0.7 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: C.green,
          textTransform: "uppercase", letterSpacing: "0.1em", flexShrink: 0 }}>
          ✓ LATEST RUN
        </div>
        {stats.map(s => (
          <div key={s.label}>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.muted,
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
              {s.label}
            </div>
            <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 700, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
          </div>
        ))}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("kit-nav", { detail: "kitting" }))}
          style={{ marginLeft: "auto", background: "none",
            border: "1px solid rgba(63,185,80,0.35)", color: C.green,
            fontFamily: mono, fontSize: 11, fontWeight: 600,
            padding: "7px 16px", cursor: "pointer", letterSpacing: "0.04em" }}>
          VIEW FULL PLAN →
        </button>
      </div>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────
export default function OverviewPage({
  metrics, spark,
  optimizationResult,
  inventoryData,
  onCardClick, onAlertClick, onServiceClick,
  onGoToInput, onRefresh, push,
}) {
  return (
    <>
      <TodayCard onGoToInput={onGoToInput} inventoryData={inventoryData} />

      {optimizationResult && <ResultBanner result={optimizationResult} />}

      <MetricsGrid
        spark={spark}
        onCardClick={onCardClick}
        optimizationResult={optimizationResult}
        inventoryData={inventoryData}
      />

      <LiveChart onRefresh={onRefresh} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 14 }}>
        <VolumeChart optimizationResult={optimizationResult}/>
        <AlertsPanel
          onAlertClick={onAlertClick}
          onAcknowledge={() => push?.({ title: "All Clear", msg: "Alerts acknowledged" }, "ok")}
        />
      </div>

      <ServicesTable
        onRowClick={onServiceClick}
        onViewAll={() => push?.({ title: "Zones", msg: "Zone deployment view" }, "info")}
      />
    </>
  );
}