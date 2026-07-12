import React from "react";
import { createPortal } from "react-dom";

/** Fixed top-right toast — admin only (portaled to body for reliable stacking). */
export default function AdminToast({ notice }) {
  if (!notice?.msg || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={`wpdl-toast wpdl-toast--${notice.type || "success"}`}
      role="status"
      aria-live="polite"
    >
      {notice.msg}
    </div>,
    document.body
  );
}
