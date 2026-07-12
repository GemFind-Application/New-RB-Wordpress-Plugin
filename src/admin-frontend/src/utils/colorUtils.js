export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function hexToRgb(hex) {
  const sanitized = (hex || "#000000").replace("#", "");
  const valid = sanitized.length === 6 ? sanitized : "000000";
  return {
    r: parseInt(valid.slice(0, 2), 16),
    g: parseInt(valid.slice(2, 4), 16),
    b: parseInt(valid.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }) {
  const toHex = (v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function hexToHsb(hex) {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let hue = 0;
  if (delta !== 0) {
    if (max === rn) hue = ((gn - bn) / delta) % 6;
    else if (max === gn) hue = (bn - rn) / delta + 2;
    else hue = (rn - gn) / delta + 4;
  }
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;
  const saturation = max === 0 ? 0 : delta / max;
  const brightness = max;
  return { hue, saturation, brightness };
}

export function hsbToHex({ hue, saturation, brightness }) {
  const h = clamp(hue, 0, 360);
  const s = clamp(saturation, 0, 1);
  const v = clamp(brightness, 0, 1);
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return rgbToHex({ r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 });
}

export function hsbToCssHue(hue) {
  return `hsl(${Math.round(hue)}, 100%, 50%)`;
}
