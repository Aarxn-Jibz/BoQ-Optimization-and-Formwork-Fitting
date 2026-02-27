import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { ChartTooltip } from "../components/ui/Primitives";
import { COLORS } from "../constants/tokens";

export default function MetricsPage({ cpuData, memData, rpsData, metrics }) {
  const panels = [
    { title:"CPU LOAD",   data:cpuData, color:COLORS.cyan,  metric:`${metrics.cpu.toFixed(1)}%` },
    { title:"MEMORY",     data:memData, color:COLORS.green, metric:`${(metrics.mem*0.08).toFixed(1)} GB` },
    { title:"REQUESTS/S", data:rpsData, color:COLORS.amber, metric:`${(metrics.rps/1000).toFixed(1)}K` },
  ];
  return (
    <div className="slide-up" style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        {panels.map(({ title, data, color, metric }) => (
          <div key={title} className="panel">
            <div className="panel-header">
              <div className="panel-title">{title}</div>
              <span style={{ fontFamily:"JetBrains Mono,monospace", fontSize:18, fontWeight:700, color }}>{metric}</span>
            </div>
            <div style={{ padding:"10px 4px 6px" }}>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={data} margin={{ top:4, right:12, left:-14, bottom:0 }}>
                  <defs>
                    <linearGradient id={`g${color}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={color} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="t" tick={{ fontFamily:"JetBrains Mono",fontSize:9,fill:COLORS.muted }} tickLine={false} axisLine={false} interval={5} />
                  <YAxis tick={{ fontFamily:"JetBrains Mono",fontSize:9,fill:COLORS.muted }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="v" name={title} stroke={color} strokeWidth={1.5} fill={`url(#g${color})`} dot={false} activeDot={{ r:3, fill:color }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
      <div className="panel">
        <div className="panel-header"><div className="panel-title">COMBINED METRICS — OVERLAY VIEW</div></div>
        <div style={{ padding:"12px 4px 8px" }}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={cpuData} margin={{ top:4, right:16, left:-10, bottom:0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="t" tick={{ fontFamily:"JetBrains Mono",fontSize:10,fill:COLORS.muted }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontFamily:"JetBrains Mono",fontSize:10,fill:COLORS.muted }} tickLine={false} axisLine={false} domain={[0,100]} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="v"  name="CPU"    stroke={COLORS.cyan}  strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="v2" name="Memory" stroke={COLORS.green} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
