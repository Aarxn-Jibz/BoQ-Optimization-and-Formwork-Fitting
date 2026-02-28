import React, { useState, useRef, useCallback } from "react";
import { runOptimization } from "../services/api";

const C = {
  cyan:"#00D4FF", green:"#3FB950", red:"#F85149", amber:"#D29922",
  void:"#0D1117", surface:"#161B22", border:"#21262D",
  text:"#E6EDF3", muted:"#7D8590", abyss:"#080B12",
};
const mono = { fontFamily:"'JetBrains Mono',monospace" };

const MATERIALS   = ["Steel","Plywood","Aluform"];
const MAT_LIMITS  = { Steel:10, Plywood:15, Aluform:100 };
const MAT_COLORS  = { Steel:C.cyan, Plywood:C.amber, Aluform:C.green };

const EMPTY_ITEM = {
  element_id:"", material:"Steel", length:"", width:"",
  quantity:"", start_date:"", end_date:"",
};

const SAMPLE_ITEMS = [
  { element_id:"ZONE1-METRO-PIER-CAP-0001", material:"Steel",   length:2.4, width:1.2, quantity:10, start_date:"2026-03-01", end_date:"2026-03-04" },
  { element_id:"ZONE2-TOWER-COLUMN-0002",   material:"Aluform", length:3.0, width:0.6, quantity:15, start_date:"2026-03-02", end_date:"2026-03-09" },
  { element_id:"ZONE1-PODIUM-SLAB-0003",    material:"Plywood", length:1.8, width:1.8, quantity:20, start_date:"2026-03-05", end_date:"2026-03-12" },
  { element_id:"ZONE3-RETAINING-WALL-0004", material:"Aluform", length:2.4, width:2.4, quantity:8,  start_date:"2026-03-03", end_date:"2026-03-08" },
  { element_id:"ZONE2-BRIDGE-GIRDER-0005",  material:"Steel",   length:4.0, width:0.4, quantity:12, start_date:"2026-03-06", end_date:"2026-03-15" },
  { element_id:"ZONE4-METRO-PIER-CAP-0006", material:"Steel",   length:2.4, width:1.2, quantity:10, start_date:"2026-03-04", end_date:"2026-03-07" },
  { element_id:"ZONE3-TOWER-COLUMN-0007",   material:"Aluform", length:3.0, width:0.6, quantity:15, start_date:"2026-03-10", end_date:"2026-03-17" },
  { element_id:"ZONE1-PODIUM-SLAB-0008",    material:"Plywood", length:1.8, width:1.8, quantity:20, start_date:"2026-03-13", end_date:"2026-03-20" },
];

// ── CSV parser — handles Python ETL output and manual CSVs ────
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/[^a-z_]/g,""));
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = line.split(",");
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || "").trim(); });
    return {
      element_id: obj.element_id || obj.elementid || "",
      material:   obj.material   || "Steel",
      length:     parseFloat(obj.length)   || "",
      width:      parseFloat(obj.width)    || "",
      quantity:   parseInt(obj.quantity)   || "",
      start_date: obj.start_date || obj.startdate || "",
      end_date:   obj.end_date   || obj.enddate   || "",
    };
  }).filter(r => r.element_id);
}

// ── Validate a single row ─────────────────────────────────────
function validateRow(item) {
  const e = {};
  if (!item.element_id?.toString().trim()) e.element_id = "Required";
  if (!item.length   || Number(item.length)   <= 0) e.length     = "Must be > 0";
  if (!item.width    || Number(item.width)    <= 0) e.width      = "Must be > 0";
  if (!item.quantity || Number(item.quantity) <= 0) e.quantity   = "Must be > 0";
  if (!item.start_date) e.start_date = "Required";
  if (!item.end_date)   e.end_date   = "Required";
  if (item.start_date && item.end_date && item.start_date >= item.end_date)
    e.end_date = "Must be after start";
  return e;
}


function FInput({ value, onChange, error, type="text", placeholder, readOnly }) {
  const [focused, setFocused] = useState(false);
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      readOnly={readOnly}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        width:"100%", background:C.surface,
        border:`1px solid ${error ? C.red : focused ? C.cyan : C.border}`,
        color:C.text, ...mono, fontSize:12, padding:"5px 8px", outline:"none",
        boxShadow: focused ? `0 0 0 2px ${error ? "rgba(248,81,73,0.1)" : "rgba(0,212,255,0.1)"}` : "none",
      }}
    />
  );
}

function FSel({ value, onChange, options }) {
  return (
    <select value={value} onChange={onChange}
      style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`,
        color:C.text, ...mono, fontSize:12, padding:"5px 8px", outline:"none",
        cursor:"pointer" }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ── Single editable row ───────────────────────────────────────
function ItemRow({ item, idx, errors, onChange, onRemove, total }) {
  const upd = (field, val) => onChange(idx, { ...item, [field]: val });
  const matColor = MAT_COLORS[item.material] || C.cyan;

  return (
    <tr style={{ borderBottom:`1px solid rgba(33,38,45,0.6)`, background: idx%2===0?"transparent":"rgba(8,11,18,0.25)" }}>
      {/* # */}
      <td style={{ ...mono, fontSize:11, color:C.muted, padding:"4px 8px", textAlign:"center", width:32 }}>
        {idx+1}
      </td>

      {/* Element ID */}
      <td style={{ padding:"4px 6px", minWidth:160 }}>
        <FInput value={item.element_id} error={errors?.element_id}
          placeholder="e.g. ZONE1-COL-001"
          onChange={e => upd("element_id", e.target.value)} />
      </td>

      {/* Material */}
      <td style={{ padding:"4px 6px", minWidth:100 }}>
        <FSel value={item.material} options={MATERIALS}
          onChange={e => upd("material", e.target.value)} />
        <div style={{ ...mono, fontSize:9, color:matColor, marginTop:2 }}>
          max {MAT_LIMITS[item.material]} pours
        </div>
      </td>

      {/* Length */}
      <td style={{ padding:"4px 6px", width:70 }}>
        <FInput value={item.length} error={errors?.length} type="number"
          placeholder="2.4" onChange={e => upd("length", e.target.value)} />
      </td>

      {/* Width */}
      <td style={{ padding:"4px 6px", width:70 }}>
        <FInput value={item.width} error={errors?.width} type="number"
          placeholder="1.2" onChange={e => upd("width", e.target.value)} />
      </td>

      {/* Quantity */}
      <td style={{ padding:"4px 6px", width:70 }}>
        <FInput value={item.quantity} error={errors?.quantity} type="number"
          placeholder="10" onChange={e => upd("quantity", e.target.value)} />
      </td>

      {/* Start Date */}
      <td style={{ padding:"4px 6px", width:120 }}>
        <FInput value={item.start_date} error={errors?.start_date} type="date"
          onChange={e => upd("start_date", e.target.value)} />
      </td>

      {/* End Date */}
      <td style={{ padding:"4px 6px", width:120 }}>
        <FInput value={item.end_date} error={errors?.end_date} type="date"
          onChange={e => upd("end_date", e.target.value)} />
      </td>

      {/* Remove */}
      <td style={{ padding:"4px 8px", textAlign:"center" }}>
        {total > 1 && (
          <button onClick={() => onRemove(idx)}
            style={{ background:"none", border:"none", color:C.muted,
              cursor:"pointer", fontSize:14, lineHeight:1, padding:"2px 4px" }}
            title="Remove row">×</button>
        )}
      </td>
    </tr>
  );
}

// ── Main InputPage ────────────────────────────────────────────
export default function InputPage({ push, setLoading, onComplete }) {
  const [items,   setItems]   = useState([{ ...EMPTY_ITEM }]);
  const [errors,  setErrors]  = useState([]);
  const [running, setRunning] = useState(false);
  const [status,  setStatus]  = useState(null);     // "running" | "done" | "error"
  const [showJson, setShowJson] = useState(false);
  const fileRef = useRef();

  // ── Item CRUD ───────────────────────────────────────────────
  const updateItem = useCallback((idx, updated) => {
    setItems(prev => prev.map((it, i) => i === idx ? updated : it));
    setErrors(prev => prev.map((e, i) => i === idx ? {} : e));
  }, []);

  const addRow = () => {
    setItems(prev => [...prev, { ...EMPTY_ITEM }]);
    setErrors(prev => [...prev, {}]);
  };

  const removeRow = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
    setErrors(prev => prev.filter((_, i) => i !== idx));
  };

  const loadSample = () => {
    setItems(SAMPLE_ITEMS.map(i => ({ ...i })));
    setErrors([]);
    push?.({ title:"Sample Loaded", msg:"8 L&T elements ready to optimize" }, "ok");
  };

  // ── File upload (CSV or JSON) ───────────────────────────────
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        let parsed = [];

        if (file.name.endsWith(".json")) {
          // Handle Python ETL output: { "items": [...] } or plain array
          const raw = JSON.parse(text);
          const arr = raw.items ?? raw;
          if (!Array.isArray(arr)) throw new Error("JSON must be { items: [...] } or an array");
          parsed = arr.map(r => ({
            element_id: r.element_id || "",
            material:   r.material   || "Steel",
            length:     parseFloat(r.length)   || "",
            width:      parseFloat(r.width)    || "",
            quantity:   parseInt(r.quantity)   || "",
            start_date: r.start_date || "",
            end_date:   r.end_date   || "",
          })).filter(r => r.element_id);
        } else {
          // CSV — handle Python-generated or manual
          parsed = parseCSV(text);
        }

        if (parsed.length === 0) throw new Error("No valid rows found in file");
        setItems(parsed);
        setErrors([]);
        push?.({ title:"File Loaded", msg:`${parsed.length} elements from ${file.name}` }, "ok");
      } catch (err) {
        push?.({ title:"File Error", msg: err.message }, "err");
      }
    };
    reader.readAsText(file);
    e.target.value = "";   // reset so same file can be re-uploaded
  };

  // ── Run optimization ────────────────────────────────────────
  const handleRun = async () => {
    // Validate all rows
    const allErrors = items.map(validateRow);
    const hasErrors = allErrors.some(e => Object.keys(e).length > 0);
    if (hasErrors) {
      setErrors(allErrors);
      push?.({ title:"Validation Failed", msg:"Fix highlighted fields" }, "err");
      return;
    }

    setRunning(true);
    setStatus("running");
    setLoading?.(true);

    try {
      const payload = items.map(item => ({
        element_id:    String(item.element_id).trim().toUpperCase(),
        material:      item.material || "Steel",
        length:        Number(item.length),
        width:         Number(item.width),
        area_sqm:      Math.round(Number(item.length) * Number(item.width) * 1000) / 1000,
        quantity:      Number(item.quantity),
        start_date:    item.start_date,
        end_date:      item.end_date,
        duration_days: Math.max(0, Math.round(
          (new Date(item.end_date) - new Date(item.start_date)) / 86400000
        )),
      }));

      const result = await runOptimization(payload);
      setStatus("done");
      onComplete?.(result);
      push?.({ title:"Optimization Complete",
        msg:`${result.estimated_cost_savings_percent.toFixed(1)}% savings in ${result.execution_time_ms}` }, "ok");
    } catch (err) {
      setStatus("error");
      push?.({ title:"Optimization Failed", msg: err.message }, "err");
    } finally {
      setRunning(false);
      setLoading?.(false);
    }
  };

  // ── Summary stats ───────────────────────────────────────────
  const totalQty = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
  const byMat    = items.reduce((acc, i) => {
    const m = i.material || "Steel";
    acc[m] = (acc[m] || 0) + (Number(i.quantity) || 0);
    return acc;
  }, {});

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* ── Header panel ──────────────────────────────────── */}
      <div style={{ background:C.void, border:`1px solid ${C.border}`,
        padding:"16px 20px", display:"flex", alignItems:"center",
        justifyContent:"space-between", flexWrap:"wrap", gap:12,
        position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
          background:`linear-gradient(90deg,${C.cyan} 0%,transparent 55%)`, opacity:0.6 }} />

        <div>
          <div style={{ ...mono, fontSize:10, fontWeight:700, color:C.cyan,
            letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:6 }}>
            FORMWORK BILL OF QUANTITIES
          </div>
          <div style={{ fontSize:13, color:C.muted, fontFamily:"Inter,sans-serif" }}>
            Upload the Python-generated JSON, a CSV, or enter elements manually below
          </div>
        </div>

        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {/* Load sample */}
          <button onClick={loadSample}
            style={{ background:"rgba(0,212,255,0.08)", border:`1px solid rgba(0,212,255,0.3)`,
              color:C.cyan, ...mono, fontSize:10, fontWeight:700,
              padding:"8px 14px", cursor:"pointer", letterSpacing:"0.06em" }}>
            ⚡ LOAD SAMPLE
          </button>

          {/* Upload file */}
          <input ref={fileRef} type="file" accept=".csv,.json"
            style={{ display:"none" }} onChange={handleFile} />
          <button onClick={() => fileRef.current?.click()}
            style={{ background:"none", border:`1px solid ${C.border}`,
              color:C.muted, ...mono, fontSize:10, fontWeight:600,
              padding:"8px 14px", cursor:"pointer", letterSpacing:"0.06em" }}>
            📂 UPLOAD CSV / JSON
          </button>

          {/* Paste JSON */}
          <button onClick={() => setShowJson(v => !v)}
            style={{ background:"none", border:`1px solid ${C.border}`,
              color:C.muted, ...mono, fontSize:10, fontWeight:600,
              padding:"8px 14px", cursor:"pointer", letterSpacing:"0.06em" }}>
            { } PASTE JSON
          </button>
        </div>
      </div>

      {/* ── JSON paste modal ──────────────────────────────── */}
      {showJson && (
        <JsonPaste
          onApply={(parsed) => {
            setItems(parsed);
            setErrors([]);
            setShowJson(false);
            push?.({ title:"JSON Applied", msg:`${parsed.length} elements loaded` }, "ok");
          }}
          onClose={() => setShowJson(false)}
        />
      )}

      {/* ── Summary strip ─────────────────────────────────── */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
        <StatPill label="ELEMENTS" value={items.length} color={C.cyan} />
        <StatPill label="TOTAL UNITS" value={totalQty} color={C.text} />
        {Object.entries(byMat).map(([mat, qty]) => (
          <StatPill key={mat} label={mat.toUpperCase()} value={`${qty} units`}
            color={MAT_COLORS[mat] || C.muted} />
        ))}
      </div>

      {/* ── Table ─────────────────────────────────────────── */}
      <div style={{ background:C.void, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"rgba(0,212,255,0.02)",
                borderBottom:`1px solid ${C.border}` }}>
                {["#","ELEMENT ID","MATERIAL","LEN (m)","WID (m)","QTY","START DATE","END DATE",""].map(h => (
                  <th key={h} style={{ ...mono, fontSize:10, fontWeight:600,
                    letterSpacing:"0.08em", color:C.muted, padding:"8px 6px",
                    textAlign:"left", whiteSpace:"nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <ItemRow
                  key={idx}
                  idx={idx}
                  item={item}
                  errors={errors[idx] || {}}
                  onChange={updateItem}
                  onRemove={removeRow}
                  total={items.length}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Add row */}
        <div style={{ padding:"10px 16px", borderTop:`1px solid ${C.border}` }}>
          <button onClick={addRow}
            style={{ background:"none", border:`1px solid ${C.border}`,
              color:C.muted, ...mono, fontSize:10, fontWeight:600,
              padding:"6px 14px", cursor:"pointer", letterSpacing:"0.06em" }}>
            + ADD ROW
          </button>
        </div>
      </div>

      {/* ── RUN button ─────────────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
        <button
          onClick={handleRun}
          disabled={running}
          style={{
            background: running ? "rgba(0,212,255,0.4)" : C.cyan,
            border:"none", color:"#080B12",
            ...mono, fontSize:13, fontWeight:700,
            padding:"13px 36px", cursor: running ? "not-allowed" : "pointer",
            letterSpacing:"0.06em",
            boxShadow: running ? "none" : "0 0 24px rgba(0,212,255,0.35)",
            transition:"all 120ms",
          }}>
          {running ? "⏳  RUNNING…" : "▶  RUN OPTIMIZATION"}
        </button>

        {status === "running" && (
          <span style={{ ...mono, fontSize:11, color:C.amber, letterSpacing:"0.06em" }}>
            Sending {items.length} elements to Go engine…
          </span>
        )}
        {status === "done" && (
          <span style={{ ...mono, fontSize:11, color:C.green, letterSpacing:"0.06em" }}>
            ✓ Complete — navigating to Kitting Plan
          </span>
        )}
        {status === "error" && (
          <span style={{ ...mono, fontSize:11, color:C.red, letterSpacing:"0.06em" }}>
            ✕ Check that Go server is running on localhost:3000
          </span>
        )}
      </div>
    </div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────
function StatPill({ label, value, color }) {
  return (
    <div style={{ background:C.void, border:`1px solid ${C.border}`,
      padding:"8px 14px", display:"flex", flexDirection:"column", gap:3 }}>
      <div style={{ ...mono, fontSize:9, fontWeight:600, color:C.muted,
        textTransform:"uppercase", letterSpacing:"0.1em" }}>{label}</div>
      <div style={{ ...mono, fontSize:16, fontWeight:700, color }}>{value}</div>
    </div>
  );
}

// ── JSON paste panel ──────────────────────────────────────────
function JsonPaste({ onApply, onClose }) {
  const [text, setText] = useState("");
  const [err,  setErr]  = useState("");

  const apply = () => {
    try {
      const raw  = JSON.parse(text);
      const arr  = raw.items ?? raw;
      if (!Array.isArray(arr)) throw new Error("Must be { items: [...] } or an array");
      const parsed = arr.map(r => ({
        element_id: r.element_id || "",
        material:   r.material   || "Steel",
        length:     parseFloat(r.length) || "",
        width:      parseFloat(r.width)  || "",
        quantity:   parseInt(r.quantity) || "",
        start_date: r.start_date || "",
        end_date:   r.end_date   || "",
      })).filter(r => r.element_id);
      if (parsed.length === 0) throw new Error("No valid elements found");
      onApply(parsed);
    } catch (e) { setErr(e.message); }
  };

  return (
    <div style={{ background:C.surface, border:`1px solid rgba(0,212,255,0.25)`,
      padding:"16px 20px" }}>
      <div style={{ ...mono, fontSize:10, fontWeight:700, color:C.cyan,
        textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:10 }}>
        PASTE JSON — Python ETL output or manual
      </div>
      <div style={{ ...mono, fontSize:10, color:C.muted, marginBottom:8 }}>
        Format: {"{ \"items\": [{\"element_id\":..., \"material\":..., \"length\":..., \"width\":..., \"quantity\":..., \"start_date\":..., \"end_date\":...}] }"}
      </div>
      <textarea
        value={text} onChange={e => { setText(e.target.value); setErr(""); }}
        rows={8}
        placeholder='{ "items": [ { "element_id": "ZONE1-COL-001", "material": "Steel", "length": 2.4, "width": 1.2, "quantity": 10, "start_date": "2026-03-01", "end_date": "2026-03-04" } ] }'
        style={{ width:"100%", background:C.void, border:`1px solid ${err ? C.red : C.border}`,
          color:C.text, ...mono, fontSize:11, padding:"10px", outline:"none",
          resize:"vertical", boxSizing:"border-box" }}
      />
      {err && (
        <div style={{ ...mono, fontSize:10, color:C.red, marginTop:6 }}>✕ {err}</div>
      )}
      <div style={{ display:"flex", gap:8, marginTop:10 }}>
        <button onClick={apply}
          style={{ background:C.cyan, border:"none", color:"#080B12",
            ...mono, fontSize:11, fontWeight:700, padding:"8px 20px",
            cursor:"pointer", letterSpacing:"0.06em" }}>
          APPLY
        </button>
        <button onClick={onClose}
          style={{ background:"none", border:`1px solid ${C.border}`,
            color:C.muted, ...mono, fontSize:11, padding:"8px 16px",
            cursor:"pointer", letterSpacing:"0.06em" }}>
          CANCEL
        </button>
      </div>
    </div>
  );
}