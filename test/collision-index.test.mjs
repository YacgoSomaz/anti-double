import test from 'node:test';
import assert from 'node:assert/strict';
import { createCollisionIndex } from '../src/collision-index.mjs';

test('returns horizontal collision candidates in their original source order', () => {
  const firstInSecondColumn = { id: 'first-in-second', x: 34, y: 0, width: 34, height: 34 };
  const blocks = [
    { id: 'later-column', x: 102, y: 0, width: 34, height: 34 },
    firstInSecondColumn,
    { id: 'first-column', x: 0, y: 0, width: 34, height: 34 },
    { id: 'second-in-second', x: 34, y: 34, width: 34, height: 34 }
  ];
  const index = createCollisionIndex(blocks, 34);

  assert.deepEqual(index.query(20, 70), [firstInSecondColumn, blocks[2], blocks[3]]);
  assert.deepEqual(index.query(90, 120), [blocks[0]]);
  assert.equal(index.find(20, 70, () => true), firstInSecondColumn);
  assert.deepEqual(index.filter(20, 70, (block) => block.id.includes('second')), [firstInSecondColumn, blocks[3]]);
});
