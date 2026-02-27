import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { ChartTooltip, LiveIndicator } from "../ui/Primitives";
import { COLORS } from "../../constants/tokens";
import { RefreshCw } from "lucide-react";
import { TREND_DATA } from "../../data/constants";

// Build chart data from TREND_DATA (formwork history)
const reuseData = TREND_DATA.map(d => ({
  t: d.month,
  v:  d.repetition,
  v2: d.repetition * 0.85,
}));

const savingsData = TREND_DATA.map(d => ({
  t: d.month,
  v:  Math.round((d.saving / d.cost) * 100),
  v2: Math.round((d.saving / d.cost) * 80),
}));

const yardData = TREND_DATA.map((d, i) => ({
  t: d.month,
  v:  50 + i * 4 + Math.random() * 5,
  v2: 40 + i * 3,
}));

const TABS = [
  { id:"reuse",   label:"REUSE RATE",    unit:"%", desc:"kit.reuse.avg", color:COLORS.green },
  { id:"savings", label:"COST SAVINGS",  unit:"%", desc:"cost.savings.pct", color:COLORS.cyan },
  { id:"yard",    label:"YARD UTIL",     unit:"%", desc:"yard.utilization.live", color:COLORS.amber },
];

const DATA_MAP = { reuse: reuseData, savings: savingsData, yard: yardData };

export default function LiveChart({ onRefresh }) {
  const [tab, setTab] = useState("reuse");
  const active = TABS.find(t => t.id === tab);
  const data   = DATA_MAP[tab];

  return (
    <div className="panel slide-up">
      <div className="panel-header">
        <div className="panel-title">
          <span style={{ color:COLORS.cyan }}>◈</span>
          FORMWORK PERFORMANCE TRENDS
          <span style={{ color:COLORS.muted, fontWeight:400 }}>— {active.desc}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {TABS.map(t => (
            <div key={t.id}
              className={`tab-item ${tab === t.id ? "active" : ""}`}
              style={{ padding:"0 10px", height:36, display:"flex", alignItems:"center" }}
              onClick={() => setTab(t.id)}>
              {t.label}
            </div>
          ))}
          <LiveIndicator />
          <button className="btn-ghost" onClick={onRefresh}>
            <RefreshCw size={11} />REFRESH
          </button>
        </div>
      </div>

      <div style={{ padding:"12px 4px 8px" }}>
        <ResponsiveContainer width="100%" height={165}>
          <AreaChart data={data} margin={{ top:4, right:16, left:-10, bottom:0 }}>
            <defs>
              <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={active.color} stopOpacity={0.18}/>
                <stop offset="95%" stopColor={active.color} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={COLORS.green} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={COLORS.green} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="t"
              tick={{ fontFamily:"JetBrains Mono", fontSize:10, fill:COLORS.muted }}
              tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fontFamily:"JetBrains Mono", fontSize:10, fill:COLORS.muted }}
              tickLine={false} axisLine={false}
              tickFormatter={v => `${v}${active.unit}`} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="v"
              name={active.label}
              stroke={active.color} strokeWidth={1.5}
              fill="url(#gC)" dot={false}
              activeDot={{ r:4, fill:active.color, stroke:COLORS.void, strokeWidth:2 }} />
            <Area type="monotone" dataKey="v2"
              name="Previous Period"
              stroke={COLORS.muted} strokeWidth={1} strokeDasharray="3 3"
              fill="url(#gG)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Inline summary stats */}
      <div style={{ display:"flex", gap:0, borderTop:`1px solid ${COLORS.border}` }}>
        {[
          { label:"6-MONTH AVG", value:`${Math.round(data.reduce((s,d)=>s+d.v,0)/data.length)}%`, color:active.color },
          { label:"PEAK",        value:`${Math.round(Math.max(...data.map(d=>d.v)))}%`,            color:COLORS.green },
          { label:"LATEST",      value:`${Math.round(data.at(-1)?.v ?? 0)}%`,                     color:COLORS.cyan  },
          { label:"TREND",       value: data.at(-1)?.v > data[0]?.v ? "▲ IMPROVING" : "▼ DECLINING",
            color: data.at(-1)?.v > data[0]?.v ? COLORS.green : COLORS.red },
        ].map(s => (
          <div key={s.label} style={{ flex:1, padding:"8px 16px",
            borderRight:`1px solid ${COLORS.border}` }}>
            <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:9,
              color:COLORS.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>
              {s.label}
            </div>
            <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:13,
              fontWeight:700, color:s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}