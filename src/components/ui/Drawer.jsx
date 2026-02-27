import React from "react";
import { X, CheckCircle, Package, BarChart2, Clock } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { DrawerField } from "../ui/Primitives";
import { COLORS } from "../../constants/tokens";
import { useApp } from "../../context/AppContext";

const mono = { fontFamily:"'JetBrains Mono',monospace" };
const C = COLORS;

// Reusable stat block inside drawer
function DrawerStat({ label, value, color = C.cyan }) {
  return (
    <div style={{ background:"#080B12",border:`1px solid ${C.border}`,padding:"10px 14px",marginBottom:8 }}>
      <div style={{ ...mono,fontSize:9,color:C.muted,textTransform:"uppercase",
        letterSpacing:"0.1em",marginBottom:4 }}>{label}</div>
      <div style={{ ...mono,fontSize:20,fontWeight:700,color }}>{value}</div>
    </div>
  );
}

export default function Drawer({ data, chartData, onAction }) {
  const { state, closeDrawer } = useApp();
  const open = state.drawer.open;

  const title = {
    log:       "LOG ENTRY",
    alert:     "ALERT DETAIL",
    service:   `SERVICE: ${data?.service?.service?.toUpperCase() ?? ""}`,
    kit:       `KIT: ${data?.kit?.dimensions ?? ""}`,
    inventory: `INVENTORY: ${data?.item?.kit_id ?? ""}`,
    history:   `RUN: ${data?.run?.id ?? ""}`,
    reuse:     "KIT REUSE RATE",
    savings:   "COST SAVINGS",
    yard:      "YARD UTILIZATION",
    elements:  "ELEMENTS TRACKED",
  }[data?.type] ?? "DETAIL";

  return (
    <>
      <div className={`drawer-overlay ${open ? "open" : ""}`} onClick={closeDrawer} />
      <div className={`drawer ${open ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-title">{title}</div>
          <button className="icon-btn" onClick={closeDrawer}><X size={14} /></button>
        </div>

        <div className="drawer-body">

          {/* ── Log drawer ── */}
          {data?.type === "log" && (
            <div className="fade-in">
              <DrawerField label="Timestamp" value={data.log?.time} />
              <DrawerField label="Level"     value={data.log?.level} />
              <DrawerField label="Source"    value={data.log?.src} />
              <DrawerField label="Message"   value={data.log?.msg} />
              <DrawerField label="Trace ID"  value={`trace-${Math.random().toString(36).slice(2,10)}`} />
              <button className="btn-ghost"
                style={{ width:"100%",justifyContent:"center",marginTop:8 }}
                onClick={() => onAction("view-trace", data.log)}>
                VIEW FULL TRACE
              </button>
            </div>
          )}

          {/* ── Alert drawer ── */}
          {data?.type === "alert" && (
            <div className="fade-in">
              <DrawerField label="Alert"    value={data.alert?.title} />
              <DrawerField label="Detail"   value={data.alert?.sub} />
              <DrawerField label="Severity" value={data.alert?.status?.toUpperCase()} />
              <DrawerField label="Fired"    value={data.alert?.time} />
              <div style={{ display:"flex",gap:8,marginTop:16 }}>
                <button className="btn-primary"
                  onClick={() => { onAction("ack", data.alert); closeDrawer(); }}>
                  <CheckCircle size={13} />ACKNOWLEDGE
                </button>
                <button className="btn-danger"
                  onClick={() => onAction("escalate", data.alert)}>
                  ESCALATE
                </button>
              </div>
            </div>
          )}

          {/* ── Service drawer ── */}
          {data?.type === "service" && (
            <div className="fade-in">
              {Object.entries(data.service ?? {}).map(([k,v]) => (
                <DrawerField key={k} label={k.toUpperCase()} value={String(v)} />
              ))}
            </div>
          )}

          {/* ── Kit drawer ── */}
          {data?.type === "kit" && (() => {
            const kit = data.kit ?? {};
            const repColor = kit.repetition_count >= 5 ? C.green
              : kit.repetition_count >= 2 ? C.cyan : C.amber;
            return (
              <div className="fade-in">
                <DrawerStat label="DIMENSIONS"      value={kit.dimensions}      color={C.cyan}    />
                <DrawerStat label="KITS REQUIRED"   value={kit.required_qty}    color={C.text}    />
                <DrawerStat label="REPETITION COUNT" value={`×${kit.repetition_count}`} color={repColor} />
                <div style={{ ...mono,fontSize:9,color:C.muted,textTransform:"uppercase",
                  letterSpacing:"0.1em",marginBottom:6,marginTop:4 }}>USED IN ELEMENTS</div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginBottom:12 }}>
                  {(kit.used_in_elements ?? []).map(el => (
                    <span key={el} style={{ ...mono,fontSize:9,padding:"2px 6px",
                      background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.2)",
                      color:C.cyan }}>{el}</span>
                  ))}
                </div>
                <div style={{ height:3,background:C.surface,overflow:"hidden",marginBottom:4 }}>
                  <div style={{ height:"100%",
                    width:`${Math.min(100,(kit.repetition_count/10)*100)}%`,
                    background:`linear-gradient(90deg,${repColor},${repColor}55)` }}/>
                </div>
                <div style={{ ...mono,fontSize:9,color:C.muted }}>
                  {((kit.repetition_count/10)*100).toFixed(0)}% of max lifespan (10 pours)
                </div>
                <div style={{ ...mono,fontSize:9,color:C.muted,marginTop:12,
                  padding:"8px",background:"rgba(0,212,255,0.04)",
                  border:"1px solid rgba(0,212,255,0.1)" }}>
                  🌱 CO₂ impact: ~{Math.round(kit.required_qty * 1200 * 1.85 / 1000)}t manufacturing
                  emissions avoided vs. not reusing
                </div>
              </div>
            );
          })()}

          {/* ── Inventory drawer ── */}
          {data?.type === "inventory" && (() => {
            const item = data.item ?? {};
            const utilColor = item.utilization >= 90 ? C.red
              : item.utilization >= 60 ? C.amber
              : item.utilization === 0 ? C.muted : C.green;
            return (
              <div className="fade-in">
                <DrawerStat label="KIT ID"       value={item.kit_id}       color={C.cyan}     />
                <DrawerStat label="TYPE"         value={item.type}         color={C.text}     />
                <DrawerStat label="TOTAL SETS"   value={item.total}        color={C.text}     />
                <DrawerStat label="DEPLOYED"     value={item.deployed}     color={C.cyan}     />
                <DrawerStat label="AVAILABLE"    value={item.available}    color={C.green}    />
                <DrawerStat label="UTILIZATION"  value={`${item.utilization}%`} color={utilColor} />
                <div style={{ height:3,background:C.surface,overflow:"hidden",marginTop:4 }}>
                  <div style={{ height:"100%",width:`${item.utilization}%`,
                    background:`linear-gradient(90deg,${utilColor},${utilColor}55)` }}/>
                </div>
              </div>
            );
          })()}

          {/* ── History / Run drawer ── */}
          {data?.type === "history" && (() => {
            const run = data.run ?? {};
            return (
              <div className="fade-in">
                <DrawerStat label="RUN ID"       value={run.id}       color={C.cyan}  />
                <DrawerStat label="DATE"         value={run.date}     color={C.text}  />
                <DrawerStat label="ELEMENTS"     value={run.elements} color={C.text}  />
                <DrawerStat label="TOTAL UNITS"  value={run.qty}      color={C.text}  />
                <DrawerStat label="KITS CREATED" value={run.kits}     color={C.cyan}  />
                <DrawerStat label="SAVINGS"      value={run.saving}   color={run.status==="completed"?C.green:C.muted} />
                <button className="btn-primary" style={{ width:"100%",justifyContent:"center",marginTop:12 }}
                  onClick={() => { onAction("rerun", run); closeDrawer(); }}>
                  <Clock size={13} /> RERUN THIS CONFIG
                </button>
              </div>
            );
          })()}

          {/* ── KPI metric drawers (reuse / savings / yard / elements) ── */}
          {["reuse","savings","yard","elements"].includes(data?.type) && (
            <div className="fade-in">
              <div style={{ ...mono,fontSize:44,fontWeight:700,color:C.cyan,marginBottom:16 }}>
                {data?.value ?? "—"}
              </div>
              <div style={{ marginBottom:20 }}>
                <ResponsiveContainer width="100%" height={110}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="dg2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={C.cyan} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={C.cyan} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={C.cyan}
                      strokeWidth={1.5} fill="url(#dg2)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {{
                reuse:    <DrawerField label="Metric" value="Average kit reuse cycles per formwork set" />,
                savings:  <DrawerField label="Metric" value="Estimated cost reduction vs. unoptimized procurement" />,
                yard:     <DrawerField label="Metric" value="Kit sets deployed vs. total in yard" />,
                elements: <DrawerField label="Metric" value="Unique formwork elements tracked in this run" />,
              }[data?.type]}
              <button className="btn-ghost"
                style={{ width:"100%",justifyContent:"center",marginTop:8 }}
                onClick={() => onAction("alert-set", data?.type)}>
                SET ALERT THRESHOLD
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}