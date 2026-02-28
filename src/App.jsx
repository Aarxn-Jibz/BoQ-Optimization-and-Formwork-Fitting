import React, { useCallback, useState, useEffect } from "react";
import "./index.css";
import { AppProvider, useApp, ACTIONS } from "./context/AppContext";
import { useNotifications }  from "./hooks/useNotifications";
import { useLiveMetrics }    from "./hooks/useLiveMetrics";
import { useKeyboard }       from "./hooks/useKeyboard";
import Topbar                from "./components/layout/Topbar";
import Sidebar               from "./components/layout/Sidebar";
import Drawer                from "./components/ui/Drawer";
import CommandPalette        from "./components/ui/CommandPalette";
import NotificationStack     from "./components/ui/NotificationStack";

import OverviewPage   from "./pages/OverviewPage";
import InputPage      from "./pages/InputPage";
import KittingPage    from "./pages/KittingPage";
import InventoryPage  from "./pages/InventoryPage";
import AlertsPage     from "./pages/AlertsPage";
import HistoryPage    from "./pages/HistoryPage";
import SettingsPage   from "./pages/SettingsPage";

const PAGE_TITLES = {
  overview:  "Dashboard",
  input:     "Input / BoQ",
  kitting:   "Kitting Plan",
  inventory: "Inventory",
  alerts:    "Alerts",
  history:   "Run History",
  settings:  "Settings",
};

// ── Derive live inventory from optimization kit_details ────────
// After a run, each kit type becomes an inventory row.
// deployed = simulated as ~65% for demo (real value comes from Go /api/inventory)
function deriveInventory(result) {
  if (!result?.kit_details?.length) return [];
  return result.kit_details.map((kit, i) => {
    const total     = kit.required_qty;
    const deployed  = Math.ceil(total * 0.65);        // ~65% deployed
    const available = total - deployed;
    const utilization = Math.round((deployed / total) * 100);
    return {
      kit_id:      `KIT-${String(i + 1).padStart(3, "0")}`,
      type:        kit.material
        ? `${kit.material} ${kit.dimensions}`
        : kit.dimensions,
      total,
      deployed,
      available,
      utilization,
      repetition_count: kit.repetition_count,
      elements:    kit.used_in_elements ?? [],
    };
  });
}

function InnerApp() {
  const { state, dispatch, openDrawer, openCmd, setLoading, toggleSidebar } = useApp();
  const { notifications, push, dismiss } = useNotifications();

  // ── Global state ──────────────────────────────────────────
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [inventoryData,      setInventoryData]      = useState([]);   // empty until run
  const [runHistory, setRunHistory] = useState([]);
  // Listen for nav events fired by child components
  useEffect(() => {
    const handler = (e) => dispatch({ type: ACTIONS.SET_ACTIVE_NAV, payload: e.detail });
    window.addEventListener("kit-nav", handler);
    return () => window.removeEventListener("kit-nav", handler);
  }, [dispatch]);

  const onNewLog = useCallback((log) => {
    if (log.level === "ERROR") push({ title: "Yard Alert", msg: log.msg }, "err");
  }, [push]);

  const { metrics, cpuChart, sparkCpu, refresh } = useLiveMetrics(onNewLog);

  useKeyboard({
    "k+any": openCmd,
    "b+any": toggleSidebar,
    "1+any": () => dispatch({ type: ACTIONS.SET_ACTIVE_NAV, payload: "overview"  }),
    "2+any": () => dispatch({ type: ACTIONS.SET_ACTIVE_NAV, payload: "input"     }),
    "3+any": () => dispatch({ type: ACTIONS.SET_ACTIVE_NAV, payload: "kitting"   }),
    "4+any": () => dispatch({ type: ACTIONS.SET_ACTIVE_NAV, payload: "inventory" }),
  });

  function handleRefresh() {
    setLoading(true);
    refresh();
    setTimeout(() => {
      setLoading(false);
      push({ title: "Refreshed", msg: "All data updated" }, "ok");
    }, 1000);
  }

  // Drawer openers
  const openAlertDrawer     = (alert)   => openDrawer({ type: "alert",     alert     });
  const openServiceDrawer   = (service) => openDrawer({ type: "service",   service   });
  const openKitDrawer       = (kit)     => openDrawer({ type: "kit",       kit       });
  const openInventoryDrawer = (item)    => openDrawer({ type: "inventory", item      });
  const openHistoryDrawer   = (run)     => openDrawer({ type: "history",   run       });

  const handleDrawerAction = (action, payload) => {
    if (action === "alert-set") push({ title: "Alert Set",    msg: `Threshold for ${payload}` }, "ok");
    if (action === "ack")       push({ title: "Acknowledged", msg: payload?.title              }, "ok");
    if (action === "escalate")  push({ title: "Escalated",    msg: "Sent to site engineer"     }, "warn");
    if (action === "rerun")     push({ title: "Re-running",   msg: payload?.id                 }, "info");
  };

  // ── Called when optimization completes ───────────────────
  const handleOptimizationComplete = useCallback((result) => {
  setOptimizationResult(result);
  const derived = deriveInventory(result);
  setInventoryData(derived);

  // Save to history
  setRunHistory(prev => [{
    id:       `RUN-${Date.now()}`,
    date:     new Date().toLocaleString(),
    elements: result.kit_details?.length ?? 0,
    qty:      result.original_boq_items,
    kits:     result.optimized_kits_required,
    saving:   `${result.estimated_cost_savings_percent.toFixed(1)}%`,
    status:   "completed",
  }, ...prev]);

  dispatch({ type: ACTIONS.SET_ACTIVE_NAV, payload: "kitting" });
  push({
    title: "Optimization Complete",
    msg:   `${result.estimated_cost_savings_percent.toFixed(1)}% savings · ${result.optimized_kits_required} kits`,
  }, "ok");
}, [dispatch, push]);

  const renderPage = () => {
    switch (state.activeNav) {
      case "input":
        return <InputPage push={push} setLoading={setLoading} onComplete={handleOptimizationComplete} />;

      case "kitting":
        return (
          <KittingPage
            result={optimizationResult}
            onKitClick={openKitDrawer}
            onGoToInput={() => dispatch({ type: ACTIONS.SET_ACTIVE_NAV, payload: "input" })}
            push={push}
          />
        );

      case "inventory":
        return (
          <InventoryPage
            inventoryData={inventoryData}
            onItemClick={openInventoryDrawer}
            push={push}
          />
        );

      case "alerts":
        return <AlertsPage onAlertClick={openAlertDrawer} push={push} />;

      case "history":
        return (
    <HistoryPage
      history={runHistory}
      onRunClick={openHistoryDrawer}
      onRerun={run => { push({ title: "Loading Run", msg: run.id }, "info"); openHistoryDrawer(run); }}
      push={push}
    />
  );

      case "settings":
        return <SettingsPage push={push} />;

      default: // overview
        return (
          <OverviewPage
            metrics={metrics}
            spark={sparkCpu}
            optimizationResult={optimizationResult}
            inventoryData={inventoryData}
            onCardClick={type => openDrawer({ type, value: metrics[type] })}
            onAlertClick={openAlertDrawer}
            onServiceClick={openServiceDrawer}
            onGoToInput={() => dispatch({ type: ACTIONS.SET_ACTIVE_NAV, payload: "input" })}
            onRefresh={handleRefresh}
            push={push}
          />
        );
    }
  };

  return (
    <div className="obs-root">
      {state.loading && <div className="progress-bar" />}

      <Topbar
        onRefresh={handleRefresh}
        onOpenCmd={openCmd}
        sidebarCollapsed={state.sidebarCollapsed}
      />

      <div className="layout">
        <Sidebar onToggle={toggleSidebar} />

        <main className="main">
          <div className="breadcrumb">
            <span style={{ color: "#484F58", fontFamily: "JetBrains Mono,monospace" }}>Kit-Optima</span>
            <span className="bc-sep">›</span>
            <span className="bc-current">{PAGE_TITLES[state.activeNav] ?? "Dashboard"}</span>

            {optimizationResult && (
              <span style={{
                marginLeft: "auto",
                fontFamily: "'JetBrains Mono',monospace", fontSize: 11,
                background: "rgba(63,185,80,0.1)", border: "1px solid rgba(63,185,80,0.3)",
                color: "#3FB950", padding: "2px 12px", letterSpacing: "0.06em", fontWeight: 700,
              }}>
                ✓ {optimizationResult.estimated_cost_savings_percent.toFixed(1)}% SAVINGS ACTIVE
              </span>
            )}
          </div>

          <div className="content">{renderPage()}</div>
        </main>
      </div>

      <Drawer data={state.drawer.data} chartData={cpuChart} onAction={handleDrawerAction} />
      <CommandPalette onAction={a => a === "refresh" && handleRefresh()} />
      <NotificationStack notifications={notifications} onDismiss={dismiss} />
    </div>
  );
}

export default function App() {
  return <AppProvider><InnerApp /></AppProvider>;
}