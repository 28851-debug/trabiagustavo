export function parseMoneyCents(value) {
  if (!Number.isSafeInteger(value) || value < 0) throw new TypeError("Money must be safe non-negative integer cents.");
  return value;
}
