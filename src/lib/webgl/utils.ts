// src/lib/webgl/utils.ts

export interface FilterValues {
  brightness: number;
  contrast: number;
  saturation: number;
}

export function parseFilterString(filterString: string): FilterValues {
  const values = {
    brightness: 1.0,
    contrast: 1.0,
    saturation: 1.0,
  };

  if (!filterString || filterString === "none") return values;

  const regex = /([a-z-]+)\(([\d.]+)\)/g;
  let match;

  while ((match = regex.exec(filterString)) !== null) {
    const name = match[1];
    const value = parseFloat(match[2]);

    if (name === "brightness") values.brightness = value;
    else if (name === "contrast") values.contrast = value;
    else if (name === "saturate") values.saturation = value;
  }

  return values;
}
