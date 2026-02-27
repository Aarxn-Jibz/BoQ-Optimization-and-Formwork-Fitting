import React, { useState, useEffect } from "react";
import { fetchHistory } from "../services/api";

const C = { cyan:"#00D4FF",green:"#3FB950",red:"#F85149",amber:"#D29922",
  void:"#0D1117",surface:"#161B22",border:"#21262D",text:"#E6EDF3",muted:"#7D8590",abyss:"#080B12" };
const mono = { fontFamily:"'JetBrains Mono',monospace" };

// Isolated row — fixes hooks-in-map crash
function HistoryRow({ run, idx, onRunClick, onRerun }) {
  const [h, setH] = useState(false);
  const statColor = run.status === "completed" ? C.green : C.red;
  return (
    <tr
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background:h?"rgba(0,212,255,0.03)":idx%2===0?"transparent":"rgba(8,11,18,0.3)",
        borderBottom:`1px solid rgba(33,38,45,0.6)`,transition:"background 80ms" }}>
      <td style={{ ...mono,fontSize:12,color:C.cyan,padding:"0 16px",height:42,cursor:"pointer" }}
        onClick={() => onRunClick?.(run)}>{run.id}</td>
      <td style={{ ...mono,fontSize:12,color:C.text,padding:"0 16px" }}>{run.date}</td>
      <td style={{ ...mono,fontSize:12,color:C.text,padding:"0 16px" }}>{run.elements}</td>
      <td style={{ ...mono,fontSize:12,color:C.text,padding:"0 16px" }}>{run.qty}</td>
      <td style={{ ...mono,fontSize:12,color:C.cyan,padding:"0 16px" }}>{run.kits}</td>
      <td style={{ ...mono,fontSize:13,fontWeight:700,
        color:run.status==="completed"?C.green:C.muted,padding:"0 16px" }}>
        {run.saving}
      </td>
      <td style={{ padding:"0 16px" }}>
        <span style={{ ...mono,fontSize:9,fontWeight:600,padding:"2px 7px",textTransform:"uppercase",
          color:statColor,background:`${statColor}15`,border:`1px solid ${statColor}35` }}>
          {run.status}
        </span>
      </td>
      <td style={{ padding:"0 16px" }}>
        {run.status === "completed" && (
          <button onClick={() => onRerun?.(run)}
            style={{ ...mono,fontSize:9,background:"none",
              border:`1px solid rgba(0,212,255,0.3)`,color:C.cyan,
              padding:"3px 8px",cursor:"pointer" }}>
            RERUN
          </button>
        )}
      </td>
    </tr>
  );
}

export default function HistoryPage({ onRunClick, onRerun, push }) {
  const [runs, setRuns]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory()
      .then(d => { setRuns(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalSaved = runs
    .filter(r => r.status === "completed" && r.saving !== "—")
    .reduce((s, r) => s + parseFloat(r.saving), 0);

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:16 }}>

      {/* KPI row */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12 }}>
        {[
          { label:"TOTAL RUNS",     value:runs.length,                                       color:C.text  },
          { label:"COMPLETED",      value:runs.filter(r=>r.status==="completed").length,      color:C.green },
          { label:"FAILED",         value:runs.filter(r=>r.status==="failed").length,          color:C.red   },
          { label:"AVG SAVINGS",    value:runs.filter(r=>r.status==="completed").length
              ? `${(totalSaved/runs.filter(r=>r.status==="completed").length).toFixed(1)}%`
              : "—",                                                                           color:C.cyan  },
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

      {/* Table */}
      <div style={{ background:C.void,border:`1px solid ${C.border}`,overflow:"hidden" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"10px 16px",borderBottom:`1px solid ${C.border}`,background:"rgba(0,212,255,0.02)" }}>
          <div style={{ ...mono,fontSize:10,fontWeight:600,color:C.text,
            textTransform:"uppercase",letterSpacing:"0.12em" }}>OPTIMIZATION RUN HISTORY</div>
          <div style={{ ...mono,fontSize:10,color:C.muted }}>{runs.length} runs</div>
        </div>

        {loading ? (
          <div style={{ padding:40,textAlign:"center",...mono,fontSize:12,color:C.muted }}>
            LOADING HISTORY…
          </div>
        ) : (
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                {["RUN ID","DATE","ELEMENTS","TOTAL UNITS","KITS","SAVINGS","STATUS",""].map(h => (
                  <th key={h} style={{ ...mono,fontSize:10,fontWeight:600,letterSpacing:"0.08em",
                    color:C.muted,padding:"8px 16px",textAlign:"left",whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runs.map((run, i) => (
                <HistoryRow
                  key={run.id} run={run} idx={i}
                  onRunClick={onRunClick} onRerun={onRerun}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}