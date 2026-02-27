import React, { useState } from "react";
import { INITIAL_ALERTS } from "../data/constants";

const C = { cyan:"#00D4FF",green:"#3FB950",red:"#F85149",amber:"#D29922",
  void:"#0D1117",surface:"#161B22",border:"#21262D",text:"#E6EDF3",muted:"#7D8590" };
const mono = { fontFamily:"'JetBrains Mono',monospace" };

// Isolated row — useState can't live inside .map()
function AlertRow({ alert, onAlertClick, onAck, colors, icons }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 16px",
        borderBottom:`1px solid ${C.border}`,
        background:h?"rgba(0,212,255,0.025)":"transparent",
        opacity:alert.ack?0.5:1,transition:"all 80ms" }}>
      <div style={{ width:20,height:20,display:"grid",placeItems:"center",
        color:colors[alert.status],fontSize:14,fontWeight:700,flexShrink:0 }}>
        {icons[alert.status]}
      </div>
      <div style={{ flex:1,cursor:"pointer" }} onClick={() => onAlertClick?.(alert)}>
        <div style={{ fontSize:13,color:C.text,marginBottom:2 }}>{alert.title}</div>
        <div style={{ ...mono,fontSize:10,color:C.muted }}>{alert.sub}</div>
      </div>
      <div style={{ ...mono,fontSize:10,color:C.muted,flexShrink:0 }}>{alert.time}</div>
      {!alert.ack && (
        <button onClick={() => onAck(alert.id)}
          style={{ ...mono,fontSize:9,background:"none",
            border:`1px solid ${C.border}`,color:C.muted,
            padding:"3px 8px",cursor:"pointer",flexShrink:0 }}>
          ACK
        </button>
      )}
      {alert.ack && (
        <span style={{ ...mono,fontSize:9,color:C.green }}>✓ RESOLVED</span>
      )}
    </div>
  );
}

export default function AlertsPage({ onAlertClick, push }) {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [filter, setFilter] = useState("all");

  const ack = (id) => {
    setAlerts(a => a.map(x => x.id===id ? {...x,ack:true} : x));
    push({ title:"Acknowledged", msg:"Alert marked as resolved" }, "ok");
  };
  const ackAll = () => {
    setAlerts(a => a.map(x => ({...x,ack:true})));
    push({ title:"All Acknowledged", msg:"All alerts resolved" }, "ok");
  };

  const icons  = { err:"✕", warn:"⚠", ok:"✓" };
  const colors = { err:C.red, warn:C.amber, ok:C.green };
  const unacked = alerts.filter(a => !a.ack).length;

  const filtered = alerts.filter(a =>
    filter==="all" || a.status===filter || (filter==="unread" && !a.ack));

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
      {/* Summary KPIs */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12 }}>
        {[
          { label:"TOTAL ALERTS",   value:alerts.length,                            color:C.text  },
          { label:"CRITICAL",       value:alerts.filter(a=>a.status==="err").length, color:C.red   },
          { label:"WARNINGS",       value:alerts.filter(a=>a.status==="warn").length,color:C.amber },
          { label:"UNACKNOWLEDGED", value:unacked, color:unacked>0?C.red:C.green },
        ].map(k => (
          <div key={k.label} style={{ background:C.void,border:`1px solid ${C.border}`,
            padding:"14px 18px",position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:0,left:0,right:0,height:1,
              background:`linear-gradient(90deg,${k.color} 0%,transparent 60%)`,opacity:0.4 }}/>
            <div style={{ ...mono,fontSize:10,fontWeight:600,letterSpacing:"0.12em",
              textTransform:"uppercase",color:C.muted,marginBottom:8 }}>{k.label}</div>
            <div style={{ ...mono,fontSize:26,fontWeight:700,color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Alert list */}
      <div style={{ background:C.void,border:`1px solid ${C.border}`,overflow:"hidden" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"10px 16px",borderBottom:`1px solid ${C.border}`,background:"rgba(0,212,255,0.02)",
          flexWrap:"wrap",gap:8 }}>
          <div style={{ ...mono,fontSize:10,fontWeight:600,color:C.text,
            textTransform:"uppercase",letterSpacing:"0.12em" }}>FORMWORK ALERTS</div>
          <div style={{ display:"flex",gap:8,alignItems:"center" }}>
            <div style={{ display:"flex",gap:4 }}>
              {["all","err","warn","ok","unread"].map(f => (
                <div key={f} onClick={() => setFilter(f)}
                  style={{ ...mono,fontSize:9,fontWeight:600,padding:"3px 8px",cursor:"pointer",
                    textTransform:"uppercase",letterSpacing:"0.08em",
                    color:filter===f?C.cyan:C.muted,
                    background:filter===f?"rgba(0,212,255,0.1)":"none",
                    border:`1px solid ${filter===f?"rgba(0,212,255,0.4)":C.border}`,
                    transition:"all 80ms" }}>
                  {f}
                </div>
              ))}
            </div>
            <button onClick={ackAll}
              style={{ ...mono,fontSize:10,background:"none",
                border:`1px solid ${C.border}`,color:C.muted,padding:"4px 10px",cursor:"pointer" }}>
              ACK ALL
            </button>
          </div>
        </div>

        {filtered.map(alert => (
          <AlertRow
            key={alert.id}
            alert={alert}
            onAlertClick={onAlertClick}
            onAck={ack}
            colors={colors}
            icons={icons}
          />
        ))}

        {filtered.length === 0 && (
          <div style={{ padding:"32px",textAlign:"center",...mono,fontSize:12,color:C.muted }}>
            NO ALERTS MATCHING FILTER
          </div>
        )}
      </div>
    </div>
  );
}