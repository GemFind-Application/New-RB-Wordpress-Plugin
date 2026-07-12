import React, { useRef, useState, useCallback, useEffect } from "react";
import { clamp, hexToHsb, hsbToHex, hsbToCssHue, hexToRgb, rgbToHex } from "../utils/colorUtils";

export default function ColorCard({ label, hint, value, onChange }) {
  const safeHex = /^#[0-9A-Fa-f]{6}$/.test(value || "") ? value : "#000000";
  const [hsb, setHsb] = useState(() => hexToHsb(safeHex));
  const [hexInput, setHexInput] = useState(safeHex.toUpperCase());
  const svRef = useRef(null);
  const hueRef = useRef(null);
  const dragRef = useRef(null);
  const hsbRef = useRef(hsb);

  hsbRef.current = hsb;

  useEffect(() => {
    if (/^#[0-9A-Fa-f]{6}$/.test(value || "")) {
      const next = hexToHsb(value);
      setHsb(next);
      setHexInput(value.toUpperCase());
    }
  }, [value]);

  const emit = (nextHsb) => {
    setHsb(nextHsb);
    const hex = hsbToHex(nextHsb);
    setHexInput(hex.toUpperCase());
    onChange(hex);
  };

  const onSvPointer = (clientX, clientY) => {
    const rect = svRef.current.getBoundingClientRect();
    const s = clamp((clientX - rect.left) / rect.width, 0, 1);
    const v = 1 - clamp((clientY - rect.top) / rect.height, 0, 1);
    const { hue } = hsbRef.current;
    emit({ hue, saturation: s, brightness: v });
  };

  const onHuePointer = (clientX) => {
    const rect = hueRef.current.getBoundingClientRect();
    const hue = clamp((clientX - rect.left) / rect.width, 0, 1) * 360;
    const { saturation, brightness } = hsbRef.current;
    emit({ hue, saturation, brightness });
  };

  useEffect(() => {
    const onMove = (e) => {
      if (dragRef.current === "sv") onSvPointer(e.clientX, e.clientY);
      if (dragRef.current === "hue") onHuePointer(e.clientX);
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const startDrag = (type) => (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = type;
    if (type === "sv") onSvPointer(e.clientX, e.clientY);
    else onHuePointer(e.clientX);
  };

  const commitHex = () => {
    let raw = hexInput.trim();
    if (!raw.startsWith("#") && /^[0-9a-fA-F]{3,8}$/.test(raw)) {
      raw = `#${raw}`;
    }
    if (/^#[0-9A-Fa-f]{6}$/.test(raw)) {
      emit(hexToHsb(raw));
    }
  };

  const rgb = hexToRgb(hsbToHex(hsb));
  const hueBg = hsbToCssHue(hsb.hue);

  return (
    <div className="wpdl-css-card">
      <div className="wpdl-css-card__head">
        <span className="wpdl-css-card__title">{label}</span>
        {hint ? (
          <span className="wpdl-css-card__info" title={hint}>
            i
          </span>
        ) : null}
      </div>

      <div
        ref={svRef}
        className="wpdl-css-card__sv"
        style={{
          background: `linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, ${hueBg})`,
        }}
        onPointerDown={startDrag("sv")}
        role="presentation"
      >
        <div
          className="wpdl-css-card__sv-thumb"
          style={{
            left: `${hsb.saturation * 100}%`,
            top: `${(1 - hsb.brightness) * 100}%`,
            borderColor: hsb.brightness > 0.55 ? "rgba(0,0,0,.35)" : "rgba(255,255,255,.85)",
            background: `rgb(${rgb.r},${rgb.g},${rgb.b})`,
          }}
        />
      </div>

      <div
        ref={hueRef}
        className="wpdl-css-card__slider-track wpdl-css-card__slider-track--hue"
        onPointerDown={startDrag("hue")}
        role="presentation"
      >
        <div className="wpdl-css-card__slider-thumb" style={{ left: `${(hsb.hue / 360) * 100}%` }} />
      </div>

      <div className="wpdl-css-card__inputs">
        <input
          className="wpdl-css-card__hex"
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value)}
          onBlur={commitHex}
          onKeyDown={(e) => e.key === "Enter" && commitHex()}
          aria-label={`${label} hex`}
        />
        <div className="wpdl-css-card__rgba">
          {["r", "g", "b"].map((ch) => (
            <label key={ch}>
              {ch.toUpperCase()}
              <input
                type="number"
                min="0"
                max="255"
                value={rgb[ch]}
                onChange={(e) => {
                  const n = clamp(parseInt(e.target.value, 10) || 0, 0, 255);
                  emit(hexToHsb(rgbToHex({ ...rgb, [ch]: n })));
                }}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
