import React, { useEffect, useRef } from "react";
import {
  LayoutDashboard, Activity, FileText, AlertTriangle,
  Key, RefreshCw, PanelLeft, Settings
} from "lucide-react";
import { CMD_ITEMS } from "../../constants/config";
import { COLORS } from "../../constants/tokens";
import { useApp, ACTIONS } from "../../context/AppContext";
import { useKeyboard } from "../../hooks/useKeyboard";

const ICONS = { LayoutDashboard, Activity, FileText, AlertTriangle, Key, RefreshCw, PanelLeft, Settings };

export default function CommandPalette({ onAction }) {
  const { state, dispatch, closeCmd, navigate, toggleSidebar } = useApp();
  const { open, query, selected } = state.cmd;
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const filtered = CMD_ITEMS.filter(
    (i) => !query || i.label.toLowerCase().includes(query.toLowerCase())
  );

  useKeyboard({
    "Escape":    () => { if (open) closeCmd(); },
    "ArrowDown": () => { if (open) dispatch({ type: ACTIONS.SET_CMD_SELECTED, payload: Math.min(selected + 1, filtered.length - 1) }); },
    "ArrowUp":   () => { if (open) dispatch({ type: ACTIONS.SET_CMD_SELECTED, payload: Math.max(selected - 1, 0) }); },
    "Enter":     () => { if (open && filtered[selected]) executeItem(filtered[selected]); },
  });

  const executeItem = (item) => {
    closeCmd();
    if (item.nav) navigate(item.nav);
    if (item.action === "refresh") onAction("refresh");
    if (item.action === "sidebar") toggleSidebar();
  };

  if (!open) return null;

  return (
    <div className="cmd-overlay" onClick={closeCmd}>
      <div className="cmd-palette" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="cmd-input"
          placeholder="Type a command or search…"
          value={query}
          onChange={(e) => dispatch({ type: ACTIONS.SET_CMD_QUERY, payload: e.target.value })}
        />
        <div className="cmd-section">Commands</div>
        {filtered.map((item, i) => {
          const Ic = ICONS[item.icon] ?? Activity;
          return (
            <div key={i} className={`cmd-item ${selected === i ? "sel" : ""}`}
              onMouseEnter={() => dispatch({ type: ACTIONS.SET_CMD_SELECTED, payload: i })}
              onClick={() => executeItem(item)}>
              <Ic size={14} color={selected === i ? COLORS.cyan : COLORS.muted} />
              <span className="cmd-item-label">{item.label}</span>
              <span className="cmd-item-hint">{item.hint}</span>
            </div>
          );
        })}
        <div className="cmd-footer">
          {[["↑↓","Navigate"],["↵","Select"],["ESC","Close"]].map(([k, v]) => (
            <div key={k} className="kbd-hint">
              <span className="kbd">{k}</span>{v}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
