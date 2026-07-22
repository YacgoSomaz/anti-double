export function preserveSelectIndex(previousValue, optionCount) {
  const count = Math.max(0, Math.floor(Number(optionCount) || 0));
  if (!count) return 0;
  const candidate = Number(previousValue);
  if (!Number.isFinite(candidate)) return 0;
  return Math.max(0, Math.min(count - 1, Math.floor(candidate)));
}
