export function normalizeUniqueName(value) {
  return value.trim().replace(/\s+/g, " ");
}

export function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
