import React, { useState, useRef, useCallback } from "react";
import { DEFAULT_INPUT_ITEMS, EMPTY_ITEM, ELEMENT_PRESETS, validatePayload } from "../data/constants";
import { runOptimization } from "../services/api";

const C = {
  cyan:"#00D4FF", green:"#3FB950", red:"#F85149", amber:"#D29922",
  void:"#0D1117", surface:"#161B22", border:"#21262D",
  text:"#E6EDF3", muted:"#7D8590", abyss:"#080B12",
};
const mono = { fontFamily:"'JetBrains Mono',monospace" };

const MATERIALS = ["Steel", "Plywood", "Aluform"];
const MATERIAL_LIMITS = { Steel:10, Plywood:15, Aluform:100 };
const MATERIAL_COLORS = { Steel:C.cyan, Plywood:C.amber, Aluform:C.green };

// Sample dataset matching the Python pipeline output
const SAMPLE_DATASET = [
  { element_id:"ZONE1-METRO-PIER-CAP-0001", material:"Steel",   length:2.4, width:1.2, quantity:20, start_date:"2026-03-01", end_date:"2026-03-04" },
  { element_id:"ZONE1-METRO-PIER-CAP-0002", material:"Steel",   length:2.4, width:1.2, quantity:20, start_date:"2026-03-05", end_date:"2026-03-08" },
  { element_id:"ZONE2-TOWER-COLUMN-0003",   material:"Aluform", length:3.0, width:0.6, quantity:15, start_date:"2026-03-02", end_date:"2026-03-10" },
  { element_id:"ZONE2-TOWER-COLUMN-0004",   material:"Aluform", length:3.0, width:0.6, quantity:15, start_date:"2026-03-11", end_date:"2026-03-18" },
  { element_id:"ZONE3-PODIUM-SLAB-0005",    material:"Plywood", length:1.8, width:1.8, quantity:30, start_date:"2026-03-03", end_date:"2026-03-12" },
  { element_id:"ZONE3-PODIUM-SLAB-0006",    material:"Plywood", length:1.8, width:1.8, quantity:30, start_date:"2026-03-13", end_date:"2026-03-22" },
  { element_id:"ZONE4-RETAINING-WALL-0007", material:"Aluform", length:2.4, width:2.4, quantity:10, start_date:"2026-03-05", end_date:"2026-03-15" },
  { element_id:"ZONE1-BRIDGE-GIRDER-0008",  material:"Steel",   length:4.0, width:0.4, quantity:8,  start_date:"2026-03-08", end_date:"2026-03-20" },
];

function FieldInput({ value, onChange, error, type="text", placeholder, style }) {
  const [focused, setFocused] = useState(false);
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ width:"100%", background:C.surface,
        border:`1px solid ${error?C.red:focused?C.cyan:C.border}`,
        color:C.text, ...mono, fontSize:12, padding:"5px 8px", outline:"none",
        boxShadow:focused?`0 0 0 2px ${error?"rgba(248,81,73,0.15)":"rgba(0,212,255,0.1)"}`:  "none",
        transition:"border-color 100ms, box-shadow 100ms", ...style,
      }}
    />
  );
}

function JsonModal({ onClose, onApply }) {
  const [text, setText] = useState("");
  const [err, setErr]   = useState("");
  const apply = () => {
    try {
      const parsed = JSON.parse(text);
      const items  = parsed.items ?? parsed;
      if (!Array.isArray(items)) throw new Error("Expected { items: [...] } or an array");
      onApply(items); onClose();
    } catch (e) { setErr(e.message); }
  };
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(8,11,18,0.88)",
      zIndex:500,display:"flex",alignItems:"center",justifyContent:"center" }}
      onClick={onClose}>
      <div style={{ background:C.surface,border:`1px solid rgba(0,212,255,0.25)`,
        width:560,padding:24,boxShadow:"0 20px 60px rgba(0,0,0,0.6)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ ...mono,fontSize:12,fontWeight:700,color:C.text,
          textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12 }}>
          PASTE JSON PAYLOAD
        </div>
        <div style={{ ...mono,fontSize:10,color:C.muted,marginBottom:8 }}>
          Schema: {"{ \"items\": [{ element_id, material, length, width, quantity, start_date, end_date }] }"}
        </div>
        <textarea autoFocus value={text}
          onChange={e => { setText(e.target.value); setErr(""); }}
          placeholder='{ "items": [...] }'
          style={{ width:"100%",height:200,background:C.abyss,border:`1px solid ${C.border}`,
            color:C.cyan,...mono,fontSize:11,padding:10,outline:"none",resize:"vertical" }}
        />
        {err && <div style={{ color:C.red,...mono,fontSize:11,marginTop:6 }}>⚠ {err}</div>}
        <div style={{ display:"flex",gap:10,marginTop:14 }}>
          <button onClick={apply} style={{ flex:1,background:C.cyan,border:"none",
            color:C.abyss,...mono,fontSize:11,fontWeight:700,padding:"8px 0",cursor:"pointer" }}>
            APPLY JSON
          </button>
          <button onClick={onClose} style={{ flex:1,background:"none",
            border:`1px solid ${C.border}`,color:C.muted,...mono,fontSize:11,padding:"8px 0",cursor:"pointer" }}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

function GhostBtn({ onClick, danger, children }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background:"none",
        border:`1px solid ${h?(danger?C.red:C.cyan):C.border}`,
        color:h?(danger?C.red:C.cyan):C.muted,
        ...mono,fontSize:10,fontWeight:600,padding:"5px 12px",
        cursor:"pointer",letterSpacing:"0.06em",transition:"all 80ms" }}>
      {children}
    </button>
  );
}

function TableRow({ item, idx, errors, onChange, onRemove, onPreset }) {
  const [hovered, setHovered] = useState(false);
  return (
    <tr onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background:hovered?"rgba(0,212,255,0.025)":idx%2===0?"transparent":"rgba(8,11,18,0.3)",
        borderBottom:`1px solid ${C.border}`,transition:"background 80ms" }}>

      {/* Element ID */}
      <td style={{ padding:"6px 8px" }}>
        <FieldInput value={item.element_id} placeholder="ZONE1-COLUMN-0001"
          error={errors.element_id}
          onChange={e => onChange(idx,"element_id",e.target.value)} />
        {errors.element_id && <div style={{ color:C.red,...mono,fontSize:9,marginTop:2 }}>{errors.element_id}</div>}
      </td>

      {/* Material */}
      <td style={{ padding:"6px 8px" }}>
        <select value={item.material || "Steel"}
          onChange={e => onChange(idx,"material",e.target.value)}
          style={{ background:C.surface,border:`1px solid ${C.border}`,
            color:MATERIAL_COLORS[item.material||"Steel"],...mono,fontSize:11,
            padding:"5px 6px",cursor:"pointer",width:"100%" }}>
          {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <div style={{ ...mono,fontSize:8,color:C.muted,marginTop:2 }}>
          max {MATERIAL_LIMITS[item.material||"Steel"]} pours
        </div>
      </td>

      {/* Length */}
      <td style={{ padding:"6px 8px" }}>
        <FieldInput value={item.length} type="number" placeholder="2.4"
          error={errors.length} style={{ width:72 }}
          onChange={e => onChange(idx,"length",e.target.value)} />
        {errors.length && <div style={{ color:C.red,...mono,fontSize:9,marginTop:2 }}>{errors.length}</div>}
      </td>

      {/* Width */}
      <td style={{ padding:"6px 8px" }}>
        <FieldInput value={item.width} type="number" placeholder="1.2"
          error={errors.width} style={{ width:72 }}
          onChange={e => onChange(idx,"width",e.target.value)} />
        {errors.width && <div style={{ color:C.red,...mono,fontSize:9,marginTop:2 }}>{errors.width}</div>}
      </td>

      {/* Qty */}
      <td style={{ padding:"6px 8px" }}>
        <FieldInput value={item.quantity} type="number" placeholder="10"
          error={errors.quantity} style={{ width:60 }}
          onChange={e => onChange(idx,"quantity",e.target.value)} />
        {errors.quantity && <div style={{ color:C.red,...mono,fontSize:9,marginTop:2 }}>{errors.quantity}</div>}
      </td>

      {/* Start date */}
      <td style={{ padding:"6px 8px" }}>
        <FieldInput value={item.start_date} type="date"
          error={errors.start_date}
          onChange={e => onChange(idx,"start_date",e.target.value)} />
        {errors.start_date && <div style={{ color:C.red,...mono,fontSize:9,marginTop:2 }}>{errors.start_date}</div>}
      </td>

      {/* End date */}
      <td style={{ padding:"6px 8px" }}>
        <FieldInput value={item.end_date} type="date"
          error={errors.end_date}
          onChange={e => onChange(idx,"end_date",e.target.value)} />
        {errors.end_date && <div style={{ color:C.red,...mono,fontSize:9,marginTop:2 }}>{errors.end_date}</div>}
      </td>

      {/* Preset */}
      <td style={{ padding:"6px 8px" }}>
        <select onChange={e => { const p = ELEMENT_PRESETS[e.target.value]; if(p) onPreset(idx,p); e.target.value=""; }}
          defaultValue=""
          style={{ background:C.surface,border:`1px solid ${C.border}`,
            color:C.muted,...mono,fontSize:10,padding:"5px 6px",cursor:"pointer" }}>
          <option value="" disabled>Quick fill</option>
          {ELEMENT_PRESETS.map((p,i) => <option key={i} value={i}>{p.label}</option>)}
        </select>
      </td>

      {/* Remove */}
      <td style={{ padding:"6px 8px" }}>
        <button onClick={() => onRemove(idx)}
          style={{ background:"none",border:`1px solid rgba(248,81,73,0.3)`,
            color:C.red,cursor:"pointer",padding:"4px 8px",...mono,fontSize:11 }}>
          ✕
        </button>
      </td>
    </tr>
  );
}

function JsonPreview({ items }) {
  const [open, setOpen] = useState(false);
  const clean = items.map(({ _id,...r }) => ({
    ...r,
    length:   Number(r.length)   || 0,
    width:    Number(r.width)    || 0,
    quantity: Number(r.quantity) || 0,
  }));
  return (
    <div style={{ background:C.abyss,border:`1px solid ${C.border}` }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"8px 14px",borderBottom:open?`1px solid ${C.border}`:"none",cursor:"pointer" }}
        onClick={() => setOpen(o => !o)}>
        <span style={{ ...mono,fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em" }}>
          {open?"▼":"▶"} JSON PAYLOAD PREVIEW
        </span>
        <span style={{ ...mono,fontSize:10,color:C.cyan }}>
          {items.length} items · {items.reduce((s,i) => s+(Number(i.quantity)||0),0)} units
        </span>
      </div>
      {open && (
        <pre style={{ ...mono,fontSize:11,color:C.cyan,padding:14,
          overflowX:"auto",maxHeight:260,lineHeight:1.6,margin:0 }}>
          {JSON.stringify({ items:clean },null,2)}
        </pre>
      )}
    </div>
  );
}

export default function InputPage({ push, setLoading, onComplete }) {
  const [items, setItems]       = useState(DEFAULT_INPUT_ITEMS.map(i => ({ ...i, _id:Math.random() })));
  const [errors, setErrors]     = useState([]);
  const [running, setRunning]   = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [lastExecTime, setLastExecTime] = useState(null);
  const fileRef = useRef();

  const addRow    = () => setItems(p => [...p, { ...EMPTY_ITEM, material:"Steel", _id:Math.random() }]);
  const removeRow = idx => setItems(p => p.filter((_,i) => i !== idx));
  const updateRow = (idx, field, val) => {
    setItems(p => p.map((r,i) => i===idx ? {...r,[field]:val} : r));
    setErrors(p => p.map((e,i) => i===idx ? {...e,[field]:undefined} : e));
  };
  const applyPreset = (idx, preset) => {
    setItems(p => p.map((r,i) => i===idx
      ? { ...r, length:preset.length, width:preset.width, material:preset.material||r.material }
      : r));
  };
  const clearAll = () => { setItems([{ ...EMPTY_ITEM, material:"Steel", _id:Math.random() }]); setErrors([]); };

  const loadSample = () => {
    setItems(SAMPLE_DATASET.map(i => ({ ...i, _id:Math.random() })));
    setErrors([]);
    push({ title:"Sample Data Loaded", msg:`${SAMPLE_DATASET.length} L&T project elements ready` }, "ok");
  };

  const handleCSV = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const lines   = ev.target.result.trim().split("\n");
      const headers = lines[0].split(",").map(h => h.trim());
      const parsed  = lines.slice(1).map(line => {
        const vals = line.split(",");
        const obj  = {};
        headers.forEach((h,i) => { obj[h] = vals[i]?.trim() ?? ""; });
        return { ...obj, material:obj.material||"Steel", _id:Math.random() };
      });
      setItems(parsed);
      push({ title:"CSV Loaded", msg:`${parsed.length} rows imported` }, "ok");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleRun = async () => {
    const clean = items.map(({ _id,...rest }) => ({
      ...rest,
      length:   Number(rest.length),
      width:    Number(rest.width),
      quantity: Number(rest.quantity),
      material: rest.material || "Steel",
    }));
    const errs = validatePayload(clean);
    if (errs.some(e => Object.keys(e).length > 0)) {
      setErrors(errs);
      push({ title:"Validation Failed", msg:"Fix errors before running" }, "err");
      return;
    }
    setRunning(true); setLoading(true);
    push({ title:"Running Optimization", msg:`Sending ${items.length} elements to Go engine…` }, "info");
    try {
      const result = await runOptimization(clean);
      if (result.execution_time_ms) setLastExecTime(result.execution_time_ms);
      onComplete(result);
    } catch (err) {
      push({ title:"API Error", msg:err.message }, "err");
    } finally {
      setRunning(false); setLoading(false);
    }
  };

  // Material breakdown summary
  const matSummary = items.reduce((acc, i) => {
    const m = i.material || "Steel";
    acc[m] = (acc[m] || 0) + (Number(i.quantity) || 0);
    return acc;
  }, {});

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:16 }}>

      {/* Header */}
      <div style={{ background:C.void,border:`1px solid ${C.border}`,padding:"14px 20px",
        display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:0,left:0,right:0,height:1,
          background:`linear-gradient(90deg,${C.cyan} 0%,transparent 60%)`,opacity:0.5 }}/>
        <div>
          <div style={{ ...mono,fontSize:13,fontWeight:700,color:C.text,letterSpacing:"0.06em" }}>
            FORMWORK ELEMENT INPUT
          </div>
          <div style={{ ...mono,fontSize:10,color:C.muted,marginTop:2 }}>
            Define elements → Run optimization → Get kitting plan & BoQ · Material limits: Steel ×10 · Plywood ×15 · Aluform ×100
          </div>
        </div>
        <div style={{ marginLeft:"auto",display:"flex",gap:8,flexWrap:"wrap" }}>
          <GhostBtn onClick={loadSample}>⚡ LOAD SAMPLE</GhostBtn>
          <GhostBtn onClick={() => setShowJson(true)}>📋 PASTE JSON</GhostBtn>
          <GhostBtn onClick={() => fileRef.current?.click()}>📁 UPLOAD CSV</GhostBtn>
          <input ref={fileRef} type="file" accept=".csv" style={{ display:"none" }} onChange={handleCSV} />
          <GhostBtn onClick={addRow}>+ ADD ROW</GhostBtn>
          <GhostBtn onClick={clearAll} danger>CLEAR ALL</GhostBtn>
        </div>
      </div>

      {/* Material summary pills */}
      {Object.keys(matSummary).length > 0 && (
        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
          {Object.entries(matSummary).map(([mat,qty]) => (
            <div key={mat} style={{ ...mono,fontSize:10,padding:"4px 12px",
              background:`${MATERIAL_COLORS[mat]}12`,
              border:`1px solid ${MATERIAL_COLORS[mat]}35`,
              color:MATERIAL_COLORS[mat] }}>
              {mat}: {qty} units · max ×{MATERIAL_LIMITS[mat]} reuse
            </div>
          ))}
          <div style={{ ...mono,fontSize:10,padding:"4px 12px",
            background:"rgba(0,212,255,0.06)",border:`1px solid rgba(0,212,255,0.2)`,color:C.muted }}>
            TOTAL: {items.reduce((s,i) => s+(Number(i.quantity)||0),0)} units
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background:C.void,border:`1px solid ${C.border}`,overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"rgba(0,212,255,0.03)",borderBottom:`1px solid ${C.border}` }}>
                {["ELEMENT ID","MATERIAL","LENGTH (m)","WIDTH (m)","QTY","START DATE","END DATE","PRESET",""].map(c => (
                  <th key={c} style={{ ...mono,fontSize:10,fontWeight:600,letterSpacing:"0.1em",
                    color:C.muted,padding:"10px 8px",textAlign:"left",whiteSpace:"nowrap" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item,idx) => (
                <TableRow key={item._id} item={item} idx={idx}
                  errors={errors[idx]||{}}
                  onChange={updateRow} onRemove={removeRow} onPreset={applyPreset} />
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding:"10px 12px",borderTop:`1px solid ${C.border}`,
          display:"flex",alignItems:"center",gap:10 }}>
          <button onClick={addRow} style={{ ...mono,fontSize:10,color:C.cyan,
            background:"none",border:`1px dashed rgba(0,212,255,0.3)`,padding:"4px 14px",
            cursor:"pointer",letterSpacing:"0.08em" }}>
            + ADD ELEMENT ROW
          </button>
          <span style={{ ...mono,fontSize:10,color:C.muted }}>
            {items.length} element{items.length!==1?"s":""} · {items.reduce((s,i) => s+(Number(i.quantity)||0),0)} total units
          </span>
        </div>
      </div>

      <JsonPreview items={items} />

      {/* Run button */}
      <div style={{ display:"flex",alignItems:"center",gap:12,flexWrap:"wrap" }}>
        <button onClick={handleRun} disabled={running}
          style={{ background:running?"rgba(0,212,255,0.4)":C.cyan,
            border:"none",color:C.abyss,...mono,fontSize:13,fontWeight:700,
            padding:"12px 36px",cursor:running?"not-allowed":"pointer",
            letterSpacing:"0.08em",transition:"all 120ms",
            boxShadow:running?"none":`0 0 20px rgba(0,212,255,0.3)` }}>
          {running ? "⟳ RUNNING GO ENGINE…" : "▶ RUN OPTIMIZATION"}
        </button>

        {running && (
          <div style={{ ...mono,fontSize:11,color:C.cyan }}>
            Go concurrent sweep-line · {items.length} elements · material-aware limits
          </div>
        )}

        {lastExecTime && !running && (
          <div style={{ ...mono,fontSize:10,padding:"4px 12px",
            background:"rgba(63,185,80,0.08)",border:"1px solid rgba(63,185,80,0.25)",
            color:"#3FB950" }}>
            ⚡ Last run: {lastExecTime} · Go engine
          </div>
        )}

        <div style={{ marginLeft:"auto",...mono,fontSize:10,color:C.muted }}>
          POST → localhost:3000/api/optimize-kitting
        </div>
      </div>

      {showJson && (
        <JsonModal
          onClose={() => setShowJson(false)}
          onApply={parsed => {
            setItems(parsed.map(i => ({ ...i, material:i.material||"Steel", _id:Math.random() })));
            push({ title:"JSON Applied", msg:`${parsed.length} elements loaded` }, "ok");
          }}
        />
      )}
    </div>
  );
}