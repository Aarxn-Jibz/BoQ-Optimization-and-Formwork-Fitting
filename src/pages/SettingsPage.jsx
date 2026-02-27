import React, { useState } from "react";
import { API_CONFIG } from "../data/constants";

const C = { cyan:"#00D4FF",green:"#3FB950",red:"#F85149",amber:"#D29922",
  void:"#0D1117",surface:"#161B22",border:"#21262D",text:"#E6EDF3",muted:"#7D8590",abyss:"#080B12" };
const mono = { fontFamily:"'JetBrains Mono',monospace" };

function SettingRow({ label, description, children }) {
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
      padding:"14px 20px",borderBottom:`1px solid ${C.border}` }}>
      <div>
        <div style={{ fontSize:13,color:C.text,marginBottom:2 }}>{label}</div>
        <div style={{ ...mono,fontSize:10,color:C.muted }}>{description}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div onClick={() => onChange(!checked)}
      style={{ width:40,height:20,background:checked?"rgba(0,212,255,0.3)":C.surface,
        border:`1px solid ${checked?C.cyan:C.border}`,borderRadius:10,
        position:"relative",cursor:"pointer",transition:"all 200ms" }}>
      <div style={{ width:14,height:14,borderRadius:"50%",
        background:checked?C.cyan:C.muted,position:"absolute",top:2,
        left:checked?22:2,transition:"left 200ms" }}/>
    </div>
  );
}

export default function SettingsPage({ push }) {
  const [baseUrl, setBaseUrl]     = useState("http://localhost:3000");
  const [mockMode, setMockMode]   = useState(true);
  const [maxRep, setMaxRep]       = useState(10);
  const [timeout, setTimeout_]    = useState(30);
  const [status, setStatus]       = useState(null);

  const testConnection = async () => {
    setStatus("testing");
    try {
      const res = await fetch(`${baseUrl}/api/health`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) { setStatus("ok"); push({title:"Connected",msg:`Go server at ${baseUrl}`},"ok"); }
      else { setStatus("err"); push({title:"Error",msg:`HTTP ${res.status}`},"err"); }
    } catch {
      setStatus("err"); push({title:"Connection Failed",msg:"Go server not reachable"},"err");
    }
  };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
      {[
        {
          title: "API CONFIGURATION",
          rows: [
            <SettingRow label="Backend URL" description="Go server endpoint (localhost:3000)">
              <input value={baseUrl} onChange={e => setBaseUrl(e.target.value)}
                style={{ ...mono,fontSize:11,background:C.surface,border:`1px solid ${C.border}`,
                  color:C.text,padding:"5px 10px",outline:"none",width:240 }}/>
            </SettingRow>,
            <SettingRow label="Mock Mode" description="Use mock data instead of real Go API">
              <Toggle checked={mockMode} onChange={v => {
                setMockMode(v);
                push({title:"Mock Mode",msg:v?"Enabled — using mock data":"Disabled — using Go API"},v?"info":"ok");
              }}/>
            </SettingRow>,
            <SettingRow label="Request Timeout" description="Max wait for ML optimization (seconds)">
              <input type="number" value={timeout} onChange={e => setTimeout_(Number(e.target.value))}
                style={{ ...mono,fontSize:11,background:C.surface,border:`1px solid ${C.border}`,
                  color:C.text,padding:"5px 10px",outline:"none",width:80 }}/>
            </SettingRow>,
            <SettingRow label="Connection" description={`POST /api/optimize-kitting`}>
              <button onClick={testConnection}
                style={{ ...mono,fontSize:10,fontWeight:600,padding:"6px 14px",cursor:"pointer",
                  background:"none",border:`1px solid ${status==="ok"?C.green:status==="err"?C.red:C.border}`,
                  color:status==="ok"?C.green:status==="err"?C.red:C.muted }}>
                {status==="testing"?"TESTING…":status==="ok"?"✓ CONNECTED":status==="err"?"✕ FAILED":"TEST CONNECTION"}
              </button>
            </SettingRow>,
          ]
        },
        {
          title: "ML PARAMETERS",
          rows: [
            <SettingRow label="Max Repetition Limit" description="Plywood degrades after N pours (Go constant: MaxRepetitionLimit)">
              <input type="number" value={maxRep} onChange={e => setMaxRep(Number(e.target.value))}
                style={{ ...mono,fontSize:11,background:C.surface,border:`1px solid ${C.border}`,
                  color:C.cyan,padding:"5px 10px",outline:"none",width:80 }}/>
            </SettingRow>,
          ]
        },
        {
          title: "ENDPOINTS",
          rows: [
            ...Object.entries(API_CONFIG.ENDPOINTS).map(([k,v]) => (
              <SettingRow key={k} label={k} description={v}>
                <code style={{ ...mono,fontSize:10,color:C.cyan,background:"rgba(0,212,255,0.08)",
                  padding:"2px 8px",border:`1px solid rgba(0,212,255,0.2)` }}>{v}</code>
              </SettingRow>
            ))
          ]
        }
      ].map(section => (
        <div key={section.title} style={{ background:C.void,border:`1px solid ${C.border}`,overflow:"hidden" }}>
          <div style={{ padding:"10px 20px",borderBottom:`1px solid ${C.border}`,
            background:"rgba(0,212,255,0.02)" }}>
            <div style={{ ...mono,fontSize:10,fontWeight:600,color:C.text,
              textTransform:"uppercase",letterSpacing:"0.12em" }}>{section.title}</div>
          </div>
          {section.rows.map((row, i) => <React.Fragment key={i}>{row}</React.Fragment>)}
        </div>
      ))}
    </div>
  );
}
