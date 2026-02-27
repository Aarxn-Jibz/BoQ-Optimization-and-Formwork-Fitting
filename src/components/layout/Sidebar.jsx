import React from "react";
import {
  LayoutDashboard, ClipboardList, Layers,
  Package, AlertTriangle, History,
  Settings, ChevronLeft, ChevronRight
} from "lucide-react";
import { useApp, ACTIONS } from "../../context/AppContext";
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED } from "../../constants/tokens";

const NAV = [
  { id:"overview",  label:"Overview",     icon:LayoutDashboard, hint:"Home dashboard"     },
  { id:"input",     label:"Input / BoQ",  icon:ClipboardList,   hint:"Enter elements"     },
  { id:"kitting",   label:"Kitting Plan", icon:Layers,          hint:"Optimization result"},
  { id:"inventory", label:"Inventory",    icon:Package,         hint:"Yard kit status"    },
  { id:"alerts",    label:"Alerts",       icon:AlertTriangle,   hint:"Active site alerts" },
  { id:"history",   label:"Run History",  icon:History,         hint:"Past optimizations" },
];

export default function Sidebar({ onToggle }) {
  const { state, dispatch } = useApp();
  const collapsed = state.sidebarCollapsed;
  const width = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH;

  return (
    <aside className="sidebar" style={{ width }}>
      <div className="sidebar-body">
        {NAV.map(item => {
          const Ic = item.icon;
          const active = state.activeNav === item.id;
          return (
            <div key={item.id}
              className={`nav-item ${active ? "active" : ""}`}
              onClick={() => dispatch({ type:ACTIONS.SET_ACTIVE_NAV, payload:item.id })}
              title={collapsed ? item.label : undefined}>
              <Ic size={16} style={{ flexShrink:0 }} />
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        {!collapsed ? (
          <button className="btn-ghost"
            style={{ width:"100%", justifyContent:"center" }}
            onClick={onToggle}>
            <ChevronLeft size={12} />COLLAPSE
          </button>
        ) : (
          <button className="icon-btn"
            style={{ margin:"0 auto", display:"flex" }}
            onClick={onToggle}>
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </aside>
  );
}