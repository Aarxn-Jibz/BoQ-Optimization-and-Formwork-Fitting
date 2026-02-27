import React from "react";
import { Badge, MiniBar, Sparkline } from "../ui/Primitives";

/**
 * MetricCard
 * Props:
 *  label, value, badge, badgeVariant, desc
 *  barPct, barVariant
 *  spark, sparkColor
 *  severity: "ok" | "warn" | "crit"
 *  valueColor
 *  onClick
 */
export default function MetricCard({
  label, value, badge, badgeVariant = "ok", desc,
  barPct, barVariant = "cyan",
  spark, sparkColor,
  severity = "ok",
  valueColor,
  onClick,
}) {
  const severityClass = severity === "crit" ? "crit" : severity === "warn" ? "warn" : "";
  return (
    <div className={`metric-card ${severityClass}`} onClick={onClick}>
      <div className="metric-label">{label}</div>
      <div className="metric-value" style={valueColor ? { color: valueColor } : {}}>
        {value}
      </div>
      <div className="metric-sub">
        {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
        {desc  && <span className="metric-desc">{desc}</span>}
      </div>
      {barPct  !== undefined && <MiniBar pct={barPct} variant={barVariant} />}
      {spark && <Sparkline data={spark} color={sparkColor} />}
    </div>
  );
}
