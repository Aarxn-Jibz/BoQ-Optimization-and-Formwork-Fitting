import React from "react";
import LogStream     from "../components/logs/LogStream";
import ServicesTable from "../components/logs/ServicesTable";

export default function LogsPage({ logs, onLogClick, onServiceClick, push }) {
  return (
    <div className="slide-up" style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">FULL LOG STREAM</div>
        </div>
        <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:11, overflow:"auto", maxHeight:360 }}>
          {logs.map((l, i) => (
            <div key={l.id} className={`log-line ${l.isNew && i === 0 ? "is-new" : ""}`} onClick={() => onLogClick(l)}>
              <span className="log-time">{l.time}</span>
              <span className={`log-level lv-${l.level}`}>{l.level}</span>
              <span className="log-msg">{l.msg}</span>
              <span className="log-source">{l.src}</span>
            </div>
          ))}
        </div>
      </div>
      <ServicesTable onRowClick={onServiceClick} onViewAll={() => push({ title:"Services", msg:"Showing all services" })} />
    </div>
  );
}
