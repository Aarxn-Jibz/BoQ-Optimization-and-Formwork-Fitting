import React, { useState } from "react";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { COLORS } from "../../constants/tokens";
import { ALERT_FILTERS } from "../../constants/config";

function AlertIcon({ status }) {
  if (status === "ok")   return <CheckCircle  size={14} color={COLORS.green} />;
  if (status === "warn") return <AlertTriangle size={14} color={COLORS.amber} />;
  return <XCircle size={14} color={COLORS.red} />;
}

// Compute real alerts from inventory — no more lies
function computeInventoryAlerts(inventory) {
  const alerts = [];
  inventory.forEach(item => {
    if (item.utilization >= 100) {
      alerts.push({
        id: `inv-crit-${item.kit_id}`,
        status: "err",
        title: `Inventory Overrun: ${item.kit_id}`,
        sub: `${item.type} — fully deployed, none available`,
        time: "live",
        ack: false,
      });
    } else if (item.utilization >= 80) {
      alerts.push({
        id: `inv-warn-${item.kit_id}`,
        status: "warn",
        title: `High Utilization: ${item.kit_id}`,
        sub: `${item.type} — ${item.utilization}% deployed`,
        time: "live",
        ack: false,
      });
    } else if (item.utilization === 0) {
      alerts.push({
        id: `inv-idle-${item.kit_id}`,
        status: "warn",
        title: `Idle Kit: ${item.kit_id}`,
        sub: `${item.type} — 0% utilization, may be overstocked`,
        time: "live",
        ack: false,
      });
    }
  });
  return alerts;
}

export default function AlertsPanel({ onAlertClick, onAcknowledge, inventoryData = [] }) {  const [filterState, setFilterState] = useState("all");
  const [acked, setAcked] = useState({});

  // Merge static operational alerts + live computed inventory alerts
  const inventoryAlerts = computeInventoryAlerts(inventoryData);
const allAlerts = inventoryAlerts.map(a => ({ ...a, ack: acked[a.id] ?? a.ack }));

  const filtered = filterState === "all"
    ? allAlerts
    : allAlerts.filter(a => a.status === filterState);

  const acknowledgeAll = () => {
    const newAcked = {};
    allAlerts.forEach(a => { newAcked[a.id] = true; });
    setAcked(newAcked);
    if (onAcknowledge) onAcknowledge();
  };

  return (
    <div className="panel" style={{ display:"flex", flexDirection:"column" }}>
      <div className="panel-header">
        <div className="panel-title">
          <AlertTriangle size={12} color={COLORS.cyan} />
          ACTIVE ALERTS
          <span style={{ color:COLORS.red, fontFamily:"JetBrains Mono,monospace", fontSize:10 }}>
            {allAlerts.filter(a => a.status === "err" && !a.ack).length} CRIT
          </span>
        </div>
        <div style={{ display:"flex", gap:2 }}>
          {ALERT_FILTERS.map(f => (
            <div key={f}
              className={`tab-item ${filterState === f ? "active" : ""}`}
              style={{ padding:"0 7px", fontSize:9, height:28, display:"flex", alignItems:"center" }}
              onClick={() => setFilterState(f)}>
              {f.toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      <div style={{ overflow:"auto", maxHeight:200 }}>
        {filtered.map(a => (
          <div key={a.id}
            className="alert-item"
            style={{ opacity: a.ack ? 0.45 : 1, transition:"opacity 200ms" }}
            onClick={() => onAlertClick(a)}>
            <AlertIcon status={a.status} />
            <div style={{ flex:1 }}>
              <div className="alert-title">{a.title}</div>
              <div className="alert-sub">{a.sub}</div>
            </div>
            <div className="alert-time">{a.time}</div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding:"20px 16px", fontFamily:"JetBrains Mono,monospace",
            fontSize:11, color:COLORS.muted, textAlign:"center" }}>
            NO ALERTS
          </div>
        )}
      </div>

      <div className="log-footer" style={{ padding:"8px 16px" }}>
        <button className="btn-ghost"
          style={{ width:"100%", justifyContent:"center" }}
          onClick={acknowledgeAll}>
          ACKNOWLEDGE ALL
        </button>
      </div>
    </div>
  );
}