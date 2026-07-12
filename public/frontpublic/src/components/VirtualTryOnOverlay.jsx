import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./VirtualTryOnOverlay.css";

/**
 * Shopify v1 parity: fullscreen fixed iframe as a direct child of document.body.
 * Nested popups / backdrop-filter break Camweara AWS credential initialization
 * (web-client-credentials-overrides.js → .create on undefined).
 */
export default function VirtualTryOnOverlay({ src, onClose, onCamwearaMessage }) {
  const iframeRef = useRef(null);
  const [iframeSrc, setIframeSrc] = useState("");
  const onCloseRef = useRef(onClose);
  const onCamwearaMessageRef = useRef(onCamwearaMessage);

  useEffect(() => {
    onCloseRef.current = onClose;
    onCamwearaMessageRef.current = onCamwearaMessage;
  }, [onClose, onCamwearaMessage]);

  useEffect(() => {
    if (!src) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Assign src after iframe is in the DOM (Shopify show-on-click flow).
    const frameId = requestAnimationFrame(() => {
      setIframeSrc(src);
    });

    const onMessage = (event) => {
      if (!event?.origin?.includes("camweara.com")) {
        return;
      }
      if (event.data === "closeIframe") {
        onCloseRef.current();
        return;
      }
      onCamwearaMessageRef.current?.(event.data, event);
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    };

    window.addEventListener("message", onMessage);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(frameId);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("message", onMessage);
      window.removeEventListener("keydown", onKeyDown);
      if (iframeRef.current) {
        iframeRef.current.src = "about:blank";
      }
      setIframeSrc("");
    };
  }, [src]);

  if (!src || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <>
      <iframe
        ref={iframeRef}
        id="tryoniframe"
        className="gemfindrb-tryoniframe"
        title="Virtual Try On"
        src={iframeSrc || undefined}
        allow="camera; microphone; fullscreen; autoplay"
        referrerPolicy="no-referrer-when-downgrade"
        width="100%"
        height="100%"
      />
      <button
        type="button"
        className="gemfindrb-tryon-close"
        onClick={onClose}
        aria-label="Close Virtual Try On"
      >
        Close
      </button>
    </>,
    document.body
  );
}
