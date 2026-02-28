import React, { useState } from "react";
import { Layers } from "lucide-react";
import { COLORS } from "../../constants/tokens";
import { SERVICES_DATA } from "../../constants/config";

const statusConfig = {
  crit: { label: "CRITICAL",  cls: "badge-down" },
  warn: { label: "WARNING",   cls: "badge-warn" },
  ok:   { label: "ON TRACK",  cls: "badge-ok"   },
  idle: { label: "IDLE",      cls: "badge-gray"  },
};

export default function ServicesTable({ onRowClick, onViewAll }) {
  const [sort, setSort] = useState({ col: "zone", dir: 1 });

  const handleSort = (col) =>
    setSort(s => ({ col, dir: s.col === col ? -s.dir : 1 }));

  const sorted = [...SERVICES_DATA].sort((a, b) =>
    String(a[sort.col] ?? "").localeCompare(String(b[sort.col] ?? "")) * sort.dir
  );

  return (
    <div className="panel" style={{ display: "flex", flexDirection: "column" }}>
      <div className="panel-header">
        <div className="panel-title">
          <Layers size={12} color={COLORS.cyan} />
          ZONE DEPLOYMENT STATUS
        </div>
        {onViewAll && (
          <button className="btn-ghost" onClick={onViewAll}>VIEW ALL</button>
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              {[
                { col: "zone",       label: "ZONE"       },
                { col: "kit",        label: "KIT"        },
                { col: "pours_done", label: "POURS DONE" },
                { col: "pours_left", label: "POURS LEFT" },
                { col: "next_strip", label: "NEXT STRIP" },
                { col: "status",     label: "STATUS"     },
              ].map(({ col, label }) => (
                <th key={col} onClick={() => handleSort(col)}>
                  {label}{sort.col === col ? (sort.dir === 1 ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const st         = statusConfig[row.status] ?? statusConfig.ok;
              const doneColor  = row.pours_done >= 8 ? COLORS.red : row.pours_done >= 5 ? COLORS.amber : COLORS.text;
              const leftColor  = row.pours_left <= 2 ? COLORS.red : row.pours_left <= 4 ? COLORS.amber : COLORS.green;
              return (
                <tr key={i} onClick={() => onRowClick?.(row)} style={{ cursor: "pointer" }}>
                  <td style={{ color: COLORS.text, fontWeight: 500 }}>{row.zone}</td>
                  <td className="mono" style={{ color: COLORS.cyan }}>{row.kit}</td>
                  <td className="mono" style={{ color: doneColor, fontWeight: 700 }}>{row.pours_done}</td>
                  <td className="mono" style={{ color: leftColor, fontWeight: 700 }}>{row.pours_left}</td>
                  <td className="mono" style={{ color: COLORS.muted }}>{row.next_strip}</td>
                  <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}