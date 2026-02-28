import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { ChartTooltip } from "../ui/Primitives";
import { COLORS } from "../../constants/tokens";
import { TrendingUp } from "lucide-react";

export default function VolumeChart({ optimizationResult }) {

  // ── No run yet → empty state ──────────────────────────────
  if (!optimizationResult) {
    return (
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <TrendingUp size={12} color={COLORS.cyan} />
            KIT COST vs SAVINGS
          </div>
        </div>
        <div style={{ height:160, display:"flex", alignItems:"center",
          justifyContent:"center", fontFamily:"JetBrains Mono,monospace",
          fontSize:11, color:COLORS.muted, letterSpacing:"0.08em" }}>
          RUN OPTIMIZATION TO SEE CHART
        </div>
      </div>
    );
  }

  // ── Build chart data from real result ─────────────────────
  const original = optimizationResult.original_boq_items;
  const optimized = optimizationResult.optimized_kits_required;
  const savedUnits = original - optimized;

  // Spread across months — simulate how savings accumulate over time
  // using kit_details breakdown per material type
  const byMaterial = {};
  (optimizationResult.kit_details ?? []).forEach(kit => {
    const mat = kit.material ?? "Other";
    if (!byMaterial[mat]) byMaterial[mat] = { cost: 0, saving: 0 };
    byMaterial[mat].cost   += kit.required_qty;
    byMaterial[mat].saving += (kit.repetition_count - 1) * kit.required_qty;
  });

  // Turn into monthly-style bars (one bar per material group)
  const data = Object.entries(byMaterial).map(([mat, vals]) => ({
    d:      mat,
    cost:   Math.round(vals.cost),
    saving: Math.round(Math.max(0, vals.saving)),
  }));

  const totalSaved = data.reduce((s, d) => s + d.saving, 0);
  const totalCost  = data.reduce((s, d) => s + d.cost,   0);
  const savingPct  = totalCost + totalSaved > 0
    ? Math.round((totalSaved / (totalCost + totalSaved)) * 100)
    : 0;

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <TrendingUp size={12} color={COLORS.cyan} />
          KIT COST vs SAVINGS — BY MATERIAL
        </div>
        <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:10,
          color:COLORS.green, letterSpacing:"0.06em" }}>
          {totalSaved} UNITS SAVED · {savingPct}% REDUCTION
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
              tickFormatter={v => `${v}`} />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              wrapperStyle={{ fontFamily:"JetBrains Mono,monospace", fontSize:9,
                paddingTop:4, color:COLORS.muted }} />
            <Bar dataKey="cost"   name="Kits Required"
              fill={COLORS.cyan}  opacity={0.5} radius={[2,2,0,0]} />
            <Bar dataKey="saving" name="Units Saved via Repetition"
              fill={COLORS.green} opacity={0.85} radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}