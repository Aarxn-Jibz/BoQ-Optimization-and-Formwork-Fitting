# 🖤 Obsidian Core — System Dashboard

> "Engineered for those who look closer."

A dark, dense, premium engineering dashboard built with **React + Vite + Recharts**.

---

## 📁 Project Structure

```
obsidian-core/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                   # React entry point
    ├── App.jsx                    # Root orchestrator — state, hooks, layout
    │
    ├── styles/
    │   ├── tokens.css             # CSS design tokens (colors, spacing, etc.)
    │   └── globals.css            # Reset, animations, utility classes
    │
    ├── data/
    │   └── constants.js           # Nav items, seed data, live data generators
    │
    ├── hooks/
    │   └── index.js               # useLiveMetrics, useLiveChart, useLiveLogs,
    │                              #   useNotifications, useDrawer, useCommandPalette
    │
    └── components/
        ├── layout/
        │   ├── Topbar.jsx         # Logo, top nav, search, avatar
        │   └── Sidebar.jsx        # Collapsible nav with status footer
        │
        ├── ui/
        │   ├── index.jsx          # Badge, Button, Tooltip, StatusDot, MiniBar,
        │   │                      #   Sparkline, LiveBadge, SearchInput, TopProgressBar
        │   ├── Panel.jsx          # Panel, PanelHeader, PanelTitle, PanelActions
        │   └── Overlays.jsx       # Drawer, CommandPalette, NotificationStack
        │
        ├── dashboard/
        │   ├── MetricCards.jsx    # 4-col animated metric cards
        │   └── DataPanels.jsx     # LogStream, AlertsPanel, ServiceTable
        │
        └── charts/
            └── LiveChart.jsx      # LiveChart (area) + VolumeChart (bar)
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action             |
|----------|--------------------|
| `⌘K`    | Open command palette |
| `⌘B`    | Toggle sidebar       |
| `⌘R`    | Refresh data         |
| `Esc`   | Close overlay        |
| `↑↓`    | Navigate command palette |
| `↵`     | Execute command      |

---

## 🎨 Design System

### Colors
| Token | Value | Use |
|-------|-------|-----|
| `--color-abyss` | `#080B12` | Page background |
| `--color-void` | `#0D1117` | Panels, sidebar |
| `--color-surface` | `#161B22` | Cards, inputs |
| `--color-cyan` | `#00D4FF` | Primary accent |
| `--color-green` | `#3FB950` | Success states |
| `--color-red` | `#F85149` | Error states |
| `--color-amber` | `#D29922` | Warning states |

### Typography
- **Headings / Labels / Values**: JetBrains Mono
- **Body**: Inter
- **Scale**: 10px → 11px → 13px → 14px → 18px → 24px → 32px

### Motion
- Instant interactions: `60ms`
- Hover transitions: `100ms`
- Drawer slide: `220ms ease-out`
- Live data: instant swap (no animation)

---

## 🔧 Tech Stack

- **React 18** — UI framework
- **Vite** — Build tool
- **Recharts** — Area & bar charts
- **Lucide React** — Icon system
- **CSS Custom Properties** — Design tokens

---

## 📦 Features

- ✅ Live metric cards (CPU, Memory, RPS, Error Rate) updating every 2s
- ✅ Real-time area chart with tab switching (CPU / Memory / RPS)
- ✅ 7-day request volume bar chart
- ✅ Live log stream with auto-generated entries and level filtering
- ✅ Alerts panel with severity filtering and acknowledge actions
- ✅ Sortable service overview table
- ✅ Slide-in detail drawer for any clickable element
- ✅ `⌘K` command palette with keyboard navigation
- ✅ Notification toast stack
- ✅ Collapsible sidebar (240px ↔ 56px icon mode)
- ✅ Top loading progress bar
- ✅ Sparkline mini-charts
- ✅ All hover effects, glows, and micro-animations
- ✅ Full keyboard shortcut system
