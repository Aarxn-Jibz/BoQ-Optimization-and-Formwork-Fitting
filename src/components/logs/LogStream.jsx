import React, { useState } from "react";
import { FileText, Filter, Download } from "lucide-react";
import { LiveIndicator } from "../ui/Primitives";
import { COLORS } from "../../constants/tokens";

const LEVEL_FILTERS = ["ALL", "INFO", "WARN", "ERROR", "DEBUG"];

export default function LogStream({ logs, onLogClick }) {
  const [filter, setFilter] = useState("ALL");
  const filtered = filter === "ALL" ? logs : logs.filter((l) => l.level === filter);

  return (
    <div className="panel" style={{ display: "flex", flexDirection: "column" }}>
      <div className="panel-header">
        <div className="panel-title">
          <FileText size={12} color={COLORS.cyan} />
          SYSTEM LOG STREAM
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LiveIndicator />
          <select
            style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`,
              color: COLORS.muted, fontFamily: "'JetBrains Mono',monospace",
              fontSize: 10, padding: "2px 6px", outline: "none", cursor: "pointer",
            }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {LEVEL_FILTERS.map((f) => <option key={f}>{f}</option>)}
          </select>
          <button className="btn-ghost">
            <Download size={11} />EXPORT
          </button>
        </div>
      </div>

      <div className="log-body" style={{ height: 200 }}>
        {filtered.map((l, i) => (
          <div
            key={l.id}
            className={`log-line ${l.isNew && i === 0 ? "is-new" : ""}`}
            onClick={() => onLogClick(l)}
          >
            <span className="log-time">{l.time}</span>
            <span className={`log-level lv-${l.level}`}>{l.level}</span>
            <span className="log-msg">{l.msg}</span>
            <span className="log-source">{l.src}</span>
          </div>
        ))}
      </div>

      <div className="log-footer">
        Showing <span className="log-count" style={{ margin:"0 4px" }}>{filtered.length}</span> of 18,492 entries
        <button className="btn-ghost" style={{ marginLeft: "auto" }}>← OLDER</button>
      </div>
    </div>
  );
}
