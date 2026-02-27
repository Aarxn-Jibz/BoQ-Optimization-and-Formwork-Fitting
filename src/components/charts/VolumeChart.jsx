import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { ChartTooltip } from "../ui/Primitives";
import { COLORS } from "../../constants/tokens";
import { TrendingUp } from "lucide-react";
import { TREND_DATA } from "../../data/constants";

const data = TREND_DATA.map(d => ({
  d:       d.month,
  cost:    Math.round(d.cost / 1000),    // in ₹K
  saving:  Math.round(d.saving / 1000),  // in ₹K
}));

export default function VolumeChart() {
  const totalSaved = data.reduce((s, d) => s + d.saving, 0);
  const totalCost  = data.reduce((s, d) => s + d.cost,   0);
  const savingPct  = Math.round((totalSaved / (totalCost + totalSaved)) * 100);

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <TrendingUp size={12} color={COLORS.cyan} />
          KIT COST vs SAVINGS — 6 MONTHS
        </div>
        <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:10,
          color:COLORS.green, letterSpacing:"0.06em" }}>
          ₹{totalSaved}K SAVED · {savingPct}% REDUCTION
        </div>
      </div>

      <div style={{ padding:"12px 4px 8px" }}>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={data} margin={{ top:4, right:16, left:-10, bottom:0 }}>
            <CartesianGrid strokeDasharray="2 4"
              stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="d"
              tick={{ fontFamily:"JetBrains Mono", fontSize:10, fill:COLORS.muted }}
              tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fontFamily:"JetBrains Mono", fontSize:10, fill:COLORS.muted }}
              tickLine={false} axisLine={false}
              tickFormatter={v => `₹${v}K`} />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              wrapperStyle={{ fontFamily:"JetBrains Mono,monospace", fontSize:9,
                paddingTop:4, color:COLORS.muted }} />
            <Bar dataKey="cost"   name="Procurement Cost"
              fill={COLORS.cyan}  opacity={0.5} radius={[2,2,0,0]} />
            <Bar dataKey="saving" name="Savings via Kitting"
              fill={COLORS.green} opacity={0.85} radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}