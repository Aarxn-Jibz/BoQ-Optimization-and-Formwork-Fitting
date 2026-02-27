import { useState, useCallback } from "react";

let _id = 0;

/**
 * useNotifications — manages a toast notification stack
 * Usage: const { notifications, push, dismiss } = useNotifications();
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  const push = useCallback(({ title, msg }, type = "info", duration = 4000) => {
    const id = ++_id;
    setNotifications((prev) => [...prev, { id, title, msg, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications, push, dismiss };
}
