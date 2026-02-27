import React from "react";
import MetricsGrid   from "../components/metrics/MetricsGrid";
import LiveChart     from "../components/charts/LiveChart";
import VolumeChart   from "../components/charts/VolumeChart";
import LogStream     from "../components/logs/LogStream";
import AlertsPanel   from "../components/alerts/AlertsPanel";
import ServicesTable from "../components/logs/ServicesTable";
import { INVENTORY_DATA } from "../data/constants";

const C = {
  cyan:"#00D4FF", green:"#3FB950", red:"#F85149", amber:"#D29922",
  void:"#0D1117", border:"#21262D", text:"#E6EDF3", muted:"#7D8590",
};
const mono = { fontFamily:"'JetBrains Mono',monospace" };

// Compute today's priorities from inventory
function getTodayPriorities(inventory) {
  const priorities = [];
  inventory.forEach(item => {
    if (item.utilization === 100)
      priorities.push({ level:"err",  text:`${item.kit_id} fully deployed — reorder or strip now`, kit:item.kit_id });
    else if (item.utilization >= 80)
      priorities.push({ level:"warn", text:`${item.kit_id} at ${item.utilization}% — monitor closely`, kit:item.kit_id });
  });
  if (priorities.length === 0)
    priorities.push({ level:"ok", text:"All kit sets within safe utilization limits", kit:null });
  return priorities;
}

function TodayCard({ onGoToInput, onGoToInventory }) {
  const priorities = getTodayPriorities(INVENTORY_DATA);
  const hasIssues  = priorities.some(p => p.level !== "ok");

  return (
    <div style={{ background:C.void, border:`1px solid ${hasIssues?"rgba(248,81,73,0.25)":C.border}`,
      padding:"18px 22px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute",top:0,left:0,right:0,height:2,
        background:`linear-gradient(90deg,${hasIssues?C.red:C.green} 0%,transparent 50%)`,opacity:0.6 }}/>

      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
        gap:16, flexWrap:"wrap" }}>
        <div style={{ flex:1 }}>
          <div style={{ ...mono,fontSize:10,fontWeight:700,letterSpacing:"0.12em",
            textTransform:"uppercase", color:hasIssues?C.red:C.green, marginBottom:10 }}>
            {hasIssues ? "⚠ TODAY'S PRIORITIES" : "✓ TODAY'S STATUS"}
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {priorities.map((p,i) => (
              <div key={i} style={{ display:"flex",alignItems:"center",gap:10 }}>
                <div style={{ width:6,height:6,borderRadius:"50%",flexShrink:0,
                  background:p.level==="err"?C.red:p.level==="warn"?C.amber:C.green }}/>
                <span style={{ fontSize:13,color:p.level==="ok"?C.muted:C.text }}>{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:"flex",gap:10,flexShrink:0 }}>
          <button onClick={onGoToInput}
            style={{ background:C.cyan,border:"none",color:"#080B12",...mono,
              fontSize:11,fontWeight:700,padding:"10px 20px",cursor:"pointer",
              letterSpacing:"0.06em",boxShadow:"0 0 16px rgba(0,212,255,0.25)" }}>
            ▶ RUN OPTIMIZATION
          </button>
          <button onClick={onGoToInventory}
            style={{ background:"none",border:`1px solid ${C.border}`,color:C.muted,...mono,
              fontSize:11,padding:"10px 16px",cursor:"pointer",letterSpacing:"0.06em" }}>
            VIEW INVENTORY
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultBanner({ result, onView }) {
  const esgCO2 = Math.round(
    ((result.original_boq_items - result.optimized_kits_required) * 1200 * 1.85) / 1000
  );
  const stats = [
    { label:"Original Units",  value:result.original_boq_items,               color:C.muted  },
    { label:"Optimized Kits",  value:result.optimized_kits_required,           color:C.cyan   },
    { label:"Reuse Factor",    value:`×${result.total_repetition_factor}`,     color:C.green  },
    { label:"Cost Reduction",  value:`${result.estimated_cost_savings_percent}%`, color:C.green },
    { label:"CO₂ Saved",       value:`${esgCO2}t`,                             color:"#22C55E"},
    ...(result.execution_time_ms?[{ label:"Go Engine",   value:result.execution_time_ms, color:C.cyan }]:[]),
  ];
  return (
    <div style={{ background:C.void,border:"1px solid rgba(63,185,80,0.25)",
      padding:"14px 22px",position:"relative",overflow:"hidden" }}>
      <div style={{ position:"absolute",top:0,left:0,right:0,height:2,
        background:"linear-gradient(90deg,#3FB950 0%,transparent 50%)",opacity:0.6 }}/>
      <div style={{ display:"flex",alignItems:"center",gap:24,flexWrap:"wrap" }}>
        <div style={{ ...mono,fontSize:10,fontWeight:700,color:C.green,
          textTransform:"uppercase",letterSpacing:"0.1em",flexShrink:0 }}>
          ✓ LATEST RUN
        </div>
        {stats.map(s => (
          <div key={s.label}>
            <div style={{ ...mono,fontSize:9,color:C.muted,textTransform:"uppercase",
              letterSpacing:"0.08em",marginBottom:2 }}>{s.label}</div>
            <div style={{ ...mono,fontSize:18,fontWeight:700,color:s.color,lineHeight:1 }}>{s.value}</div>
          </div>
        ))}
        <button onClick={onView} style={{ marginLeft:"auto",background:"none",
          border:"1px solid rgba(63,185,80,0.35)",color:C.green,...mono,
          fontSize:10,fontWeight:600,padding:"6px 14px",cursor:"pointer" }}>
          VIEW FULL PLAN →
        </button>
      </div>
    </div>
  );
}

export default function OverviewPage({
  metrics, spark, logs,
  optimizationResult,
  onCardClick, onLogClick, onAlertClick, onServiceClick,
  onGoToInput, onRefresh, push,
}) {
  // dispatch is in App so we pass nav as callback
  const goToInventory = () => {
    // fire a custom event App.jsx listens to — simplest approach
    window.dispatchEvent(new CustomEvent("kit-nav", { detail:"inventory" }));
  };

  return (
    <>
      {/* Priority 1: What to do today */}
      <TodayCard
        onGoToInput={onGoToInput}
        onGoToInventory={goToInventory}
      />

      {/* Show result banner only when a run has happened */}
      {optimizationResult && (
        <ResultBanner result={optimizationResult} onView={onGoToInput} />
      )}

      {/* KPI cards */}
      <MetricsGrid
        metrics={metrics} spark={spark}
        onCardClick={onCardClick}
        optimizationResult={optimizationResult}
      />

      {/* Performance trends */}
      <LiveChart onRefresh={onRefresh} />

      {/* Logs + Alerts side by side */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:14 }}>
        <LogStream logs={logs} onLogClick={onLogClick} />
        <AlertsPanel onAlertClick={onAlertClick}
          onAcknowledge={() => push({ title:"All Clear", msg:"All alerts acknowledged" },"ok")} />
      </div>

      {/* Cost chart + Zone status */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <VolumeChart />
        <ServicesTable
          onRowClick={onServiceClick}
          onViewAll={() => push({ title:"Zones", msg:"All deployment zones" },"info")} />
      </div>
    </>
  );
}