import React from "react";
import MetricCard from "./MetricCard";
import { COLORS } from "../../constants/tokens";

// ── Compute yard stats from LIVE inventory prop ───────────────
function getYardStats(inventoryData) {
  if (!inventoryData || inventoryData.length === 0) {
    return { totalKits: 0, deployedKits: 0, available: 0, utilization: 0 };
  }
  const totalKits    = inventoryData.reduce((s, i) => s + i.total,    0);
  const deployedKits = inventoryData.reduce((s, i) => s + i.deployed, 0);
  const utilization  = totalKits > 0 ? Math.round((deployedKits / totalKits) * 100) : 0;
  return { totalKits, deployedKits, available: totalKits - deployedKits, utilization };
}

export default function MetricsGrid({ optimizationResult, inventoryData, spark, onCardClick }) {
  const yard      = getYardStats(inventoryData);
  const hasResult = !!optimizationResult;
  const hasInv    = inventoryData && inventoryData.length > 0;

  // ── Card 1: Kit Reuse Rate ────────────────────────────────
  const reuseVal    = hasResult ? `×${optimizationResult.total_repetition_factor.toFixed(1)}` : "—";
  const reusePct    = hasResult ? Math.min(100, optimizationResult.total_repetition_factor * 10) : 0;
  const reuseSev    = hasResult
    ? (optimizationResult.total_repetition_factor >= 3 ? "ok" : optimizationResult.total_repetition_factor >= 1.5 ? "warn" : "crit")
    : "ok";
  const reuseBadge  = hasResult ? (reuseSev === "ok" ? "▲ EXCELLENT" : reuseSev === "warn" ? "▲ FAIR" : "▼ LOW") : "NO RUN YET";
  const reuseBadgeV = hasResult ? (reuseSev === "ok" ? "up" : reuseSev === "warn" ? "warn" : "down") : "gray";

  // ── Card 2: Cost Savings ──────────────────────────────────
  const savingsPct    = hasResult ? optimizationResult.estimated_cost_savings_percent : 0;
  const savingsVal    = hasResult ? `${savingsPct.toFixed(1)}%` : "—";
  const savingsSev    = hasResult ? (savingsPct >= 40 ? "ok" : savingsPct >= 20 ? "warn" : "crit") : "ok";
  const savingsBadge  = hasResult ? (savingsSev === "ok" ? "▲ HIGH IMPACT" : "▲ MODERATE") : "AWAITING RUN";
  const savingsBadgeV = hasResult ? (savingsSev === "ok" ? "up" : "warn") : "gray";

  // ── Card 3: Yard Utilization ──────────────────────────────
  const yardSev    = yard.utilization >= 90 ? "crit" : yard.utilization >= 70 ? "warn" : "ok";
  const yardBadge  = !hasInv ? "NO DATA" : yard.utilization >= 90 ? "⚠ CRITICAL" : "▲ LIVE";
  const yardBadgeV = !hasInv ? "gray" : yard.utilization >= 90 ? "down" : yard.utilization >= 70 ? "warn" : "up";
  const yardBarV   = yard.utilization >= 90 ? "crit" : yard.utilization >= 70 ? "warn" : "cyan";

  // ── Card 4: Elements Tracked ──────────────────────────────
  const elemCount = hasResult ? optimizationResult.original_boq_items : 0;
  const kitsCount = hasResult ? optimizationResult.optimized_kits_required : 0;

  return (
    <div className="metric-grid slide-up">

      {/* KIT REUSE RATE */}
      <MetricCard
        label="KIT REUSE RATE"
        value={reuseVal}
        badge={reuseBadge}
        badgeVariant={reuseBadgeV}
        desc={hasResult
          ? `${optimizationResult.original_boq_items} units → ${optimizationResult.optimized_kits_required} kits`
          : "Run optimizer to see"}
        barPct={reusePct}
        barVariant={reuseSev === "ok" ? "cyan" : reuseSev === "warn" ? "warn" : "crit"}
        severity={hasResult ? reuseSev : "ok"}
        valueColor={hasResult
          ? (reuseSev === "ok" ? COLORS.cyan : reuseSev === "warn" ? COLORS.amber : COLORS.red)
          : COLORS.muted}
        onClick={() => onCardClick?.("reuse")}
      />

      {/* COST SAVINGS */}
      <MetricCard
        label="COST SAVINGS EST."
        value={savingsVal}
        badge={savingsBadge}
        badgeVariant={savingsBadgeV}
        desc={hasResult
          ? `₹${Math.round(savingsPct * 850).toLocaleString("en-IN")}K saved`
          : "Run optimizer to see"}
        barPct={savingsPct}
        barVariant={savingsSev === "ok" ? "cyan" : "warn"}
        severity={hasResult ? savingsSev : "ok"}
        valueColor={hasResult ? (savingsSev === "ok" ? COLORS.green : COLORS.amber) : COLORS.muted}
        onClick={() => onCardClick?.("savings")}
      />

      {/* YARD UTILIZATION */}
      <MetricCard
        label="YARD UTILIZATION"
        value={hasInv ? `${yard.utilization}%` : "—"}
        badge={yardBadge}
        badgeVariant={yardBadgeV}
        desc={hasInv
          ? `${yard.deployedKits} deployed · ${yard.available} available`
          : "Run optimizer to see"}
        barPct={yard.utilization}
        barVariant={yardBarV}
        severity={hasInv ? yardSev : "ok"}
        spark={hasInv ? spark : undefined}
        sparkColor={COLORS.cyan}
        valueColor={!hasInv ? COLORS.muted
          : yard.utilization >= 90 ? COLORS.red
          : yard.utilization >= 70 ? COLORS.amber
          : COLORS.text}
        onClick={() => onCardClick?.("yard")}
      />

      {/* ELEMENTS TRACKED */}
      <MetricCard
        label="ELEMENTS TRACKED"
        value={hasResult ? String(elemCount) : "—"}
        badge={hasResult ? "▲ LIVE" : "NO RUN YET"}
        badgeVariant={hasResult ? "up" : "gray"}
        desc={hasResult
          ? `${kitsCount} optimized kits · ${inventoryData?.length ?? 0} types`
          : "Run optimizer to see"}
        barPct={hasResult && elemCount > 0 ? Math.min(100, (kitsCount / elemCount) * 100) : 0}
        barVariant="cyan"
        severity="ok"
        valueColor={hasResult ? COLORS.cyan : COLORS.muted}
        onClick={() => onCardClick?.("elements")}
      />

    </div>
  );
}