/** Return the integer grid cell containing a world-space point. */
export function cellFromWorld({ x, y, originY, size }) {
  if (![x, y, originY, size].every(Number.isFinite) || size <= 0) throw new TypeError('网格坐标无效');
  return { x: Math.floor(x / size), y: Math.floor((originY - y) / size) };
}
