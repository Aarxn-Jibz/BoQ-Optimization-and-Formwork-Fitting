import React from "react";
import MetricCard from "./MetricCard";
import { COLORS } from "../../constants/tokens";

/*
  These 4 cards now show FORMWORK KPIs — not server metrics.
  They read from `metrics` (live) AND `optimizationResult` (last run).
  When no run has happened yet, cards show yard baseline data.
*/

export default function MetricsGrid({ metrics, spark, onCardClick, optimizationResult }) {

  // ── Card 1: Kit Utilization (avg reuse rate) ──────────────────
  const reuseRate = optimizationResult
    ? optimizationResult.total_repetition_factor
    : 0;
  const reuseMax  = 10; // max designed reuse cycles
  const reusePct  = Math.min(100, (reuseRate / reuseMax) * 100);
  const reuseSev  = reuseRate >= 5 ? "ok" : reuseRate >= 2 ? "warn" : "crit";
  const reuseBadge = reuseRate >= 5 ? "▲ EXCELLENT" : reuseRate >= 2 ? "▲ MODERATE" : "▼ LOW";
  const reuseBadgeVar = reuseRate >= 5 ? "up" : reuseRate >= 2 ? "warn" : "down";

  // ── Card 2: Cost Savings % ─────────────────────────────────────
  const savings    = optimizationResult ? optimizationResult.estimated_cost_savings_percent : 0;
  const savingsSev = savings >= 30 ? "ok" : savings >= 15 ? "warn" : "crit";
  const savingsBadgeVar = savings >= 30 ? "up" : savings >= 15 ? "warn" : "down";

  // ── Card 3: Kits in Yard (from inventory) ─────────────────────
  const deployed  = metrics.deployed  ?? 33;   // total deployed kit sets
  const available = metrics.available ?? 25;   // available in yard
  const totalKits = deployed + available;
  const yardUtil  = totalKits > 0 ? Math.round((deployed / totalKits) * 100) : 0;
  const yardSev   = yardUtil >= 90 ? "crit" : yardUtil >= 70 ? "warn" : "ok";

  // ── Card 4: Active Elements (from last run) ────────────────────
  const activeElements = optimizationResult
    ? optimizationResult.kit_details?.reduce((s, k) => s + k.used_in_elements.length, 0) ?? 0
    : 0;
  const totalUnits = optimizationResult ? optimizationResult.original_boq_items : 0;

  return (
    <div className="metric-grid slide-up">

      {/* Card 1 — Kit Reuse Rate */}
      <MetricCard
        label="KIT REUSE RATE"
        value={optimizationResult ? `×${reuseRate}` : "—"}
        badge={optimizationResult ? reuseBadge : "NO RUN YET"}
        badgeVariant={optimizationResult ? reuseBadgeVar : "warn"}
        desc={optimizationResult ? `of ${reuseMax} max cycles` : "Run optimizer to see"}
        barPct={reusePct}
        barVariant={reuseSev === "ok" ? "cyan" : reuseSev === "warn" ? "warn" : "crit"}
        severity={optimizationResult ? reuseSev : "warn"}
        valueColor={
          !optimizationResult ? COLORS.muted :
          reuseSev === "ok"   ? COLORS.green :
          reuseSev === "warn" ? COLORS.amber : COLORS.red
        }
        onClick={() => onCardClick?.("reuse")}
      />

      {/* Card 2 — Cost Savings */}
      <MetricCard
        label="COST SAVINGS EST."
        value={optimizationResult ? `${savings}%` : "—"}
        badge={optimizationResult
          ? (savings >= 30 ? "▲ HIGH IMPACT" : savings >= 15 ? "▲ MODERATE" : "▼ LOW")
          : "AWAITING RUN"
        }
        badgeVariant={optimizationResult ? savingsBadgeVar : "warn"}
        desc={optimizationResult
          ? `${optimizationResult.original_boq_items - optimizationResult.optimized_kits_required} fewer units`
          : "Run optimizer to see"
        }
        barPct={savings}
        barVariant={savingsSev === "ok" ? "cyan" : savingsSev === "warn" ? "warn" : "crit"}
        severity={optimizationResult ? savingsSev : "warn"}
        valueColor={
          !optimizationResult ? COLORS.muted :
          savings >= 30 ? COLORS.green :
          savings >= 15 ? COLORS.cyan : COLORS.amber
        }
        onClick={() => onCardClick?.("savings")}
      />

      {/* Card 3 — Yard Utilization (live from inventory) */}
      <MetricCard
        label="YARD UTILIZATION"
        value={`${yardUtil}%`}
        badge="▲ LIVE"
        badgeVariant="up"
        desc={`${deployed} deployed · ${available} available`}
        spark={spark}
        sparkColor={
          yardSev === "crit" ? COLORS.red :
          yardSev === "warn" ? COLORS.amber : COLORS.cyan
        }
        severity={yardSev}
        valueColor={
          yardSev === "crit" ? COLORS.red :
          yardSev === "warn" ? COLORS.amber : COLORS.text
        }
        onClick={() => onCardClick?.("yard")}
      />

      {/* Card 4 — Elements / Units Tracked */}
      <MetricCard
        label="ELEMENTS TRACKED"
        value={optimizationResult ? activeElements : metrics.agents ?? "—"}
        badge={optimizationResult ? "▲ OPTIMIZED" : "▲ LIVE"}
        badgeVariant={optimizationResult ? "up" : "ok"}
        desc={optimizationResult
          ? `${totalUnits} total units · ${optimizationResult.kit_details?.length ?? 0} kit types`
          : `${metrics.agents ?? 3} active zones`
        }
        barPct={optimizationResult ? Math.min(100, (activeElements / 20) * 100) : 40}
        barVariant="cyan"
        severity="ok"
        valueColor={COLORS.cyan}
        onClick={() => onCardClick?.("elements")}
      />

    </div>
  );
}