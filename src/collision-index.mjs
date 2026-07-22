export function createCollisionIndex(blocks, cellSize) {
  if (!Array.isArray(blocks) || !Number.isFinite(cellSize) || cellSize <= 0) throw new TypeError('Invalid collision index');
  const columns = new Map();
  blocks.forEach((block, index) => {
    const firstColumn = Math.floor(block.x / cellSize);
    const lastColumn = Math.floor((block.x + block.width - Number.EPSILON) / cellSize);
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      const entries = columns.get(column) ?? [];
      entries.push(index);
      columns.set(column, entries);
    }
  });

  return {
    query(left, right) {
      const start = Math.floor(Math.min(left, right) / cellSize);
      const end = Math.floor(Math.max(left, right) / cellSize);
      const indices = new Set();
      for (let column = start; column <= end; column += 1) {
        for (const index of columns.get(column) ?? []) indices.add(index);
      }
      return [...indices]
        .sort((first, second) => first - second)
        .map((index) => blocks[index])
        .filter((block) => block.x <= Math.max(left, right) && block.x + block.width >= Math.min(left, right));
    }
  };
}
