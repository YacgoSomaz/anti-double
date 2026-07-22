export function createCollisionIndex(blocks, cellSize) {
  if (!Array.isArray(blocks) || !Number.isFinite(cellSize) || cellSize <= 0) throw new TypeError('Invalid collision index');
  const columns = new Map();
  blocks.forEach((block, index) => {
    const firstColumn = Math.floor(block.x / cellSize);
    const lastColumn = Math.floor((block.x + block.width - Number.EPSILON) / cellSize);
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      const entries = columns.get(column) ?? [];
      entries.push({ block, index });
      columns.set(column, entries);
    }
  });

  const visit = (left, right, callback) => {
    const minimum = Math.min(left, right);
    const maximum = Math.max(left, right);
    const firstColumn = Math.floor(minimum / cellSize);
    const lastColumn = Math.floor(maximum / cellSize);
    const buckets = [];
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      const entries = columns.get(column);
      if (entries?.length) buckets.push({ entries, cursor: 0 });
    }
    let previousIndex = -1;
    while (buckets.length) {
      let selected = 0;
      for (let index = 1; index < buckets.length; index += 1) {
        if (buckets[index].entries[buckets[index].cursor].index < buckets[selected].entries[buckets[selected].cursor].index) selected = index;
      }
      const bucket = buckets[selected];
      const entry = bucket.entries[bucket.cursor];
      bucket.cursor += 1;
      if (bucket.cursor === bucket.entries.length) buckets.splice(selected, 1);
      if (entry.index === previousIndex) continue;
      previousIndex = entry.index;
      if (entry.block.x > maximum || entry.block.x + entry.block.width < minimum) continue;
      if (callback(entry.block) === false) return;
    }
  };

  return {
    query(left, right) {
      const matches = [];
      visit(left, right, (block) => { matches.push(block); });
      return matches;
    },
    find(left, right, predicate) {
      let found;
      visit(left, right, (block) => {
        if (!predicate(block)) return true;
        found = block;
        return false;
      });
      return found;
    },
    filter(left, right, predicate) {
      const matches = [];
      visit(left, right, (block) => {
        if (predicate(block)) matches.push(block);
      });
      return matches;
    }
  };
}
