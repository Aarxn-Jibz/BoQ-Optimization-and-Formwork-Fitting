import React, { useState, useEffect } from "react";
import { RefreshCw, Bell, Settings, Command } from "lucide-react";
import { Tooltip } from "../ui/Primitives";
import { useApp, ACTIONS } from "../../context/AppContext";
import { checkHealth } from "../../services/api";

export default function Topbar({ onRefresh, onOpenCmd, sidebarCollapsed }) {
  const { state, dispatch } = useApp();
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    const check = () => {
      checkHealth()
        .then(res => setApiStatus(res.mode === "mock" ? "mock" : "ok"))
        .catch(() => setApiStatus("err"));
    };
    check();
    const iv = setInterval(check, 15000);
    return () => clearInterval(iv);
  }, []);

  const dot = {
    ok:       { color:"#3FB950", label:"GO API LIVE" },
    mock:     { color:"#D29922", label:"READY TO CONNECT" },
    err:      { color:"#F85149", label:"API OFFLINE" },
    checking: { color:"#7D8590", label:"CHECKING…" },
  }[apiStatus];

  return (
    <header className="topbar">
      {/* Logo */}
      <div className="topbar-logo" style={{ width: sidebarCollapsed ? 56 : 240 }}>
        <div className="logo-diamond" />
        {!sidebarCollapsed && (
          <div className="logo-text">KIT<span>OPTIMA</span></div>
        )}
      </div>

      {/* Product name — centre */}
      <div style={{
        fontFamily:"'JetBrains Mono',monospace",
        fontSize:11, fontWeight:600, letterSpacing:"0.12em",
        color:"#7D8590", textTransform:"uppercase",
        paddingLeft:20,
      }}>
        L&T Formwork Kitting Optimizer
      </div>

      <div className="topbar-right">
        {/* API health pill */}
        <Tooltip tip={`Backend: ${dot.label}`}>
          <div style={{
            display:"flex", alignItems:"center", gap:6,
            padding:"4px 10px",
            border:`1px solid ${dot.color}40`,
            background:`${dot.color}10`,
            cursor:"default",
          }}>
            <div style={{
              width:7, height:7, borderRadius:"50%",
              background:dot.color,
              boxShadow:`0 0 6px ${dot.color}`,
              animation: apiStatus==="ok" ? "pulse 2s infinite" : "none",
            }}/>
            <span style={{
              fontFamily:"'JetBrains Mono',monospace",
              fontSize:9, fontWeight:700,
              color:dot.color, letterSpacing:"0.08em",
              textTransform:"uppercase",
            }}>
              {dot.label}
            </span>
          </div>
        </Tooltip>

        {/* Command search */}
        <Tooltip tip="⌘K — Command palette">
          <div className="obs-input"
            style={{ width:180, display:"flex", alignItems:"center",
              gap:6, cursor:"pointer", userSelect:"none" }}
            onClick={onOpenCmd}>
            <Command size={11} color="#7D8590" />
            <span style={{ color:"#7D8590", fontSize:11 }}>Search…</span>
            <span style={{ marginLeft:"auto", fontFamily:"JetBrains Mono,monospace",
              fontSize:10, color:"#484F58" }}>⌘K</span>
          </div>
        </Tooltip>

        <Tooltip tip="Refresh">
          <button className="icon-btn" onClick={onRefresh}><RefreshCw size={13} /></button>
        </Tooltip>
        <Tooltip tip="Alerts">
          <button className="icon-btn"
            onClick={() => dispatch({ type:ACTIONS.SET_ACTIVE_NAV, payload:"alerts" })}>
            <Bell size={13} />
          </button>
        </Tooltip>
        <Tooltip tip="Settings">
          <button className="icon-btn"
            onClick={() => dispatch({ type:ACTIONS.SET_ACTIVE_NAV, payload:"settings" })}>
            <Settings size={13} />
          </button>
        </Tooltip>
        <div className="avatar">SR</div>
      </div>
    </header>
  );
}