export function formatGCodeNumber(value) {
  if (value === undefined || value === null || isNaN(value)) return '0.';
  const rounded = Math.round(value * 10000) / 10000;
  const str = rounded.toString();
  if (Number.isInteger(rounded)) return str + '.';
  return str;
}
