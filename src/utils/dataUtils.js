import { LOG_ENTRIES } from "../constants/config";

/** Generate time-series chart points */
export const generateChartData = (points = 20, base = 50, variance = 20) =>
  Array.from({ length: points }, (_, i) => {
    const h = String(12 + Math.floor(i / 4)).padStart(2, "0");
    const m = String((i % 4) * 15).padStart(2, "0");
    return {
      t:  `${h}:${m}`,
      v:  clamp(base + (Math.random() - 0.5) * variance * 2,  2, 100),
      v2: clamp(base * 0.65 + (Math.random() - 0.5) * variance, 2, 100),
    };
  });

/** Append a new data point to an existing series */
export const appendChartPoint = (prev) => [
  ...prev.slice(1),
  {
    t:  new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    v:  clamp(prev.at(-1).v + (Math.random() - 0.5) * 14, 2, 100),
    v2: clamp(prev.at(-1).v2 + (Math.random() - 0.5) * 10, 2, 100),
  },
];

/** Generate a random log line */
export const generateLogLine = () => {
  const [level, msg, src] = LOG_ENTRIES[Math.floor(Math.random() * LOG_ENTRIES.length)];
  const now  = new Date();
  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return { id: `${Date.now()}-${Math.random()}`, time, level, msg, src, isNew: true };
};

/** Simulate metric drift */
export const driftMetric = (current, min, max, speed = 5) =>
  clamp(current + (Math.random() - 0.5) * speed * 2, min, max);

/** Generate weekly bar data */
export const generateBarData = () =>
  ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => ({
    d,
    req: 6000 + Math.random() * 10000,
    err: Math.random() * 300,
  }));

/** Clamp a number between min/max */
export const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

/** Format large numbers */
export const fmt = (n) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toFixed(0);
};

/** Determine severity color */
export const severityColor = (val, { warn, crit }, colors) => {
  if (val >= crit) return colors.red;
  if (val >= warn) return colors.amber;
  return colors.cyan;
};

/** Determine badge class */
export const severityBadge = (val, { warn, crit }) => {
  if (val >= crit) return "badge-down";
  if (val >= warn) return "badge-warn";
  return "badge-ok";
};

/** Determine severity label */
export const severityLabel = (val, { warn, crit }, labels = ["NORMAL","ELEVATED","CRITICAL"]) => {
  if (val >= crit) return labels[2];
  if (val >= warn) return labels[1];
  return labels[0];
};
