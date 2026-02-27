import { useState, useEffect, useCallback } from "react";
import {
  generateChartData,
  appendChartPoint,
  generateLogLine,
  generateBarData,
  driftMetric,
} from "../utils/dataUtils";

const INITIAL_METRICS = {
  cpu:    67.2,
  mem:    72.1,
  rps:    14200,
  err:    0.003,
  uptime: 99.98,
  agents: 3,
  disk:   54.0,
  net:    320,
};

/**
 * useLiveMetrics
 * Manages all live-updating metric state and returns data + controls.
 */
export function useLiveMetrics(onNewLog) {
  const [metrics,   setMetrics]   = useState(INITIAL_METRICS);
  const [cpuChart,  setCpuChart]  = useState(() => generateChartData(20, 60, 15));
  const [memChart,  setMemChart]  = useState(() => generateChartData(20, 40, 12));
  const [rpsChart,  setRpsChart]  = useState(() => generateChartData(20, 55, 20));
  const [barData,   setBarData]   = useState(() => generateBarData());
  const [sparkCpu,  setSparkCpu]  = useState(() => Array.from({ length: 24 }, () => Math.random() * 100));
  const [logs,      setLogs]      = useState(() => Array.from({ length: 10 }, generateLogLine).map((l) => ({ ...l, isNew: false })));
  const [paused,    setPaused]    = useState(false);
  const [tickCount, setTickCount] = useState(0);

  const addLog = useCallback((log) => {
    setLogs((prev) => [{ ...log, isNew: true }, ...prev.slice(0, 49)]);
    if (onNewLog) onNewLog(log);
  }, [onNewLog]);

  // Metric + chart update every 2s
  useEffect(() => {
    if (paused) return;
    const iv = setInterval(() => {
      setMetrics((m) => ({
        ...m,
        cpu: driftMetric(m.cpu, 10, 95, 6),
        mem: driftMetric(m.mem, 30, 90, 4),
        rps: driftMetric(m.rps, 5000, 28000, 900),
        err: driftMetric(m.err, 0, 5, 0.25),
        net: driftMetric(m.net, 50, 900, 80),
      }));
      setCpuChart(appendChartPoint);
      setMemChart(appendChartPoint);
      setRpsChart(appendChartPoint);
      setSparkCpu((d) => [...d.slice(1), Math.random() * 100]);
      setTickCount((t) => t + 1);
    }, 2000);
    return () => clearInterval(iv);
  }, [paused]);

  // Log stream every 3.5s
  useEffect(() => {
    if (paused) return;
    const iv = setInterval(() => {
      addLog(generateLogLine());
    }, 3500);
    return () => clearInterval(iv);
  }, [paused, addLog]);

  // Refresh bar data every 30s
  useEffect(() => {
    const iv = setInterval(() => setBarData(generateBarData()), 30000);
    return () => clearInterval(iv);
  }, []);

  const refresh = useCallback(() => {
    setCpuChart(generateChartData(20, 60, 15));
    setMemChart(generateChartData(20, 40, 12));
    setRpsChart(generateChartData(20, 55, 20));
    setBarData(generateBarData());
  }, []);

  return {
    metrics, cpuChart, memChart, rpsChart, barData,
    sparkCpu, logs, paused, tickCount,
    setPaused, addLog, refresh,
  };
}
