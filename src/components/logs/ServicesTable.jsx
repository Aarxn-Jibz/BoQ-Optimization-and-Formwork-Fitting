import React, { useState } from "react";
import { Layers } from "lucide-react";
import { Badge } from "../ui/Primitives";
import { COLORS } from "../../constants/tokens";

// Real formwork zone deployment data
const ZONE_DATA = [
  { zone:"Zone-A · Cols",   kit:"KIT-001", pours:10, rem:0,  status:"critical", next:"2026-03-05" },
  { zone:"Zone-B · Slabs",  kit:"KIT-002", pours:6,  rem:4,  status:"warn",     next:"2026-03-08" },
  { zone:"Zone-C · Beams",  kit:"KIT-003", pours:3,  rem:7,  status:"ok",       next:"2026-03-10" },
  { zone:"Zone-D · Walls",  kit:"KIT-004", pours:0,  rem:10, status:"idle",     next:"TBD"        },
  { zone:"Zone-E · Found",  kit:"KIT-005", pours:2,  rem:8,  status:"ok",       next:"2026-03-12" },
  { zone:"Zone-F · Piers",  kit:"KIT-006", pours:8,  rem:2,  status:"warn",     next:"2026-03-06" },
];

const statusVariant = s =>
  ({ critical:"down", warn:"warn", ok:"ok", idle:"gray" }[s] ?? "gray");

const COLS = ["ZONE", "KIT", "POURS DONE", "POURS LEFT", "NEXT STRIP", "STATUS"];

export default function ServicesTable({ onRowClick, onViewAll }) {
  const [sort, setSort] = useState({ col:"zone", dir:1 });

  const sorted = [...ZONE_DATA].sort((a,b) => {
    const av = a[sort.col] ?? "";
    const bv = b[sort.col] ?? "";
    if (typeof av === "number") return (av - bv) * sort.dir;
    return String(av).localeCompare(String(bv)) * sort.dir;
  });

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <Layers size={12} color={COLORS.cyan} />
          KIT ZONE DEPLOYMENT
        </div>
        <button className="btn-ghost" onClick={onViewAll}>VIEW ALL</button>
      </div>
      <div style={{ overflow:"auto", maxHeight:172 }}>
        <table className="data-table">
          <thead>
            <tr>
              {COLS.map(c => (
                <th key={c}
                  onClick={() => setSort(s => ({
                    col: c.toLowerCase().replace(/ /g,"_"),
                    dir: s.col === c.toLowerCase().replace(/ /g,"_") ? -s.dir : 1
                  }))}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(r => (
              <tr key={r.zone} onClick={() => onRowClick?.(r)}>
                <td className="mono" style={{ color:COLORS.cyan }}>{r.zone}</td>
                <td className="mono">{r.kit}</td>
                <td className="mono" style={{
                  color: r.pours >= 8 ? COLORS.red : r.pours >= 5 ? COLORS.amber : COLORS.text
                }}>{r.pours}</td>
                <td className="mono" style={{
                  color: r.rem <= 2 ? COLORS.red : r.rem <= 4 ? COLORS.amber : COLORS.green
                }}>{r.rem}</td>
                <td className="mono" style={{ color:COLORS.muted }}>{r.next}</td>
                <td><Badge variant={statusVariant(r.status)}>{r.status.toUpperCase()}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}