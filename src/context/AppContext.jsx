import React, { createContext, useContext, useReducer, useCallback } from "react";

const AppContext = createContext(null);

// ─── ACTION TYPES ──────────────────────────────────────────────
export const ACTIONS = {
  SET_ACTIVE_NAV:    "SET_ACTIVE_NAV",
  SET_ACTIVE_TOPNAV: "SET_ACTIVE_TOPNAV",
  TOGGLE_SIDEBAR:    "TOGGLE_SIDEBAR",
  OPEN_DRAWER:       "OPEN_DRAWER",
  CLOSE_DRAWER:      "CLOSE_DRAWER",
  OPEN_CMD:          "OPEN_CMD",
  CLOSE_CMD:         "CLOSE_CMD",
  SET_CMD_QUERY:     "SET_CMD_QUERY",
  SET_CMD_SELECTED:  "SET_CMD_SELECTED",
  SET_LOADING:       "SET_LOADING",
};

// ─── INITIAL STATE ─────────────────────────────────────────────
const initialState = {
  activeNav:       "overview",
  activeTopNav:    "dashboard",
  sidebarCollapsed: false,
  drawer:          { open: false, data: null },
  cmd:             { open: false, query: "", selected: 0 },
  loading:         false,
};

// ─── REDUCER ───────────────────────────────────────────────────
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_ACTIVE_NAV:
      return { ...state, activeNav: action.payload };
    case ACTIONS.SET_ACTIVE_TOPNAV:
      return { ...state, activeTopNav: action.payload };
    case ACTIONS.TOGGLE_SIDEBAR:
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case ACTIONS.OPEN_DRAWER:
      return { ...state, drawer: { open: true, data: action.payload } };
    case ACTIONS.CLOSE_DRAWER:
      return { ...state, drawer: { open: false, data: null } };
    case ACTIONS.OPEN_CMD:
      return { ...state, cmd: { ...state.cmd, open: true } };
    case ACTIONS.CLOSE_CMD:
      return { ...state, cmd: { open: false, query: "", selected: 0 } };
    case ACTIONS.SET_CMD_QUERY:
      return { ...state, cmd: { ...state.cmd, query: action.payload, selected: 0 } };
    case ACTIONS.SET_CMD_SELECTED:
      return { ...state, cmd: { ...state.cmd, selected: action.payload } };
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

// ─── PROVIDER ──────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const navigate    = useCallback((nav) => dispatch({ type: ACTIONS.SET_ACTIVE_NAV, payload: nav }), []);
  const openDrawer  = useCallback((data) => dispatch({ type: ACTIONS.OPEN_DRAWER, payload: data }), []);
  const closeDrawer = useCallback(() => dispatch({ type: ACTIONS.CLOSE_DRAWER }), []);
  const openCmd     = useCallback(() => dispatch({ type: ACTIONS.OPEN_CMD }), []);
  const closeCmd    = useCallback(() => dispatch({ type: ACTIONS.CLOSE_CMD }), []);
  const setLoading  = useCallback((v) => dispatch({ type: ACTIONS.SET_LOADING, payload: v }), []);
  const toggleSidebar = useCallback(() => dispatch({ type: ACTIONS.TOGGLE_SIDEBAR }), []);

  return (
    <AppContext.Provider value={{ state, dispatch, navigate, openDrawer, closeDrawer, openCmd, closeCmd, setLoading, toggleSidebar }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
