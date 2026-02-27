import React from "react";
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { COLORS } from "../../constants/tokens";

const ICONS = {
  ok:   <CheckCircle  size={14} color={COLORS.green} />,
  warn: <AlertTriangle size={14} color={COLORS.amber} />,
  err:  <XCircle     size={14} color={COLORS.red}   />,
  info: <Info        size={14} color={COLORS.cyan}  />,
};

export default function NotificationStack({ notifications, onDismiss }) {
  return (
    <div className="notif-stack">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`notif ${n.type}`}
          onClick={() => onDismiss(n.id)}
          style={{ cursor: "pointer" }}
        >
          {ICONS[n.type] ?? ICONS.info}
          <div style={{ flex: 1 }}>
            <div className="notif-title">{n.title}</div>
            <div className="notif-msg">{n.msg}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
