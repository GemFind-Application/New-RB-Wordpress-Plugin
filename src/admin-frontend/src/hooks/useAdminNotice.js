import { useCallback, useEffect, useRef, useState } from "react";

const AUTO_DISMISS_MS = 5200;

/** Admin-only toast notices (Diamond Link parity). */
export function useAdminNotice() {
  const [notice, setNotice] = useState(null);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const showNotice = useCallback(
    (type, msg) => {
      if (!msg) return;
      clearTimer();
      setNotice({ type, msg: String(msg) });
      timerRef.current = setTimeout(() => {
        setNotice(null);
        timerRef.current = null;
      }, AUTO_DISMISS_MS);
    },
    [clearTimer]
  );

  const showSuccess = useCallback((msg) => showNotice("success", msg), [showNotice]);
  const showError = useCallback((msg) => showNotice("error", msg), [showNotice]);

  useEffect(() => clearTimer, [clearTimer]);

  return { notice, showSuccess, showError };
}
