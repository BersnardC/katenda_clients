// Normaliza cualquier formato de color (HEX, rgb()/rgba(), hsl()/hsla())
// a HEX canónico de 6 dígitos en minúsculas (#rrggbb). Devuelve null si es inválido.
export function normalizeHex(input: string): string | null {
  const s = input.trim();
  if (!s) return null;

  const short = s.match(/^#?([0-9a-f]{3})$/i);
  if (short) {
    return `#${short[1].split("").map((c) => c + c).join("").toLowerCase()}`;
  }

  const hex = s.match(/^#?([0-9a-f]{6})$/i);
  if (hex) {
    return `#${hex[1].toLowerCase()}`;
  }

  const rgb = s.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*[\d.]+)?\s*\)$/i,
  );
  if (rgb) {
    const [r, g, b] = [rgb[1], rgb[2], rgb[3]].map((n) =>
      toHex(Math.max(0, Math.min(255, Number(n)))),
    );
    return `#${r}${g}${b}`;
  }

  const hsl = s.match(
    /^hsla?\(\s*([\d.]+)(?:deg)?\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*[\d.]+)?\s*\)$/i,
  );
  if (hsl) {
    const h = ((Number(hsl[1]) % 360) + 360) % 360;
    const sat = Number(hsl[2]) / 100;
    const lig = Number(hsl[3]) / 100;
    return `#${hslToHex(h, sat, lig)}`;
  }

  return null;
}

function toHex(v: number): string {
  return Math.round(v).toString(16).padStart(2, "0");
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
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
  return `${toHex((r + m) * 255)}${toHex((g + m) * 255)}${toHex((b + m) * 255)}`;
}
