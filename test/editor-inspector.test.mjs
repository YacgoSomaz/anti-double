import test from 'node:test';
import assert from 'node:assert/strict';
import { contactsForPlayer, hitboxForPlayer, predictTrajectory } from '../public/editor-inspector.js';

const world = { cellSize: 34, originY: 425 };

test('derives the recovered normal and inverted player hitboxes', () => {
  assert.deepEqual(hitboxForPlayer({ x: 100, y: 200, gravity: 1 }), { left: 116, top: 219, right: 153, bottom: 267, width: 37, height: 48 });
  assert.deepEqual(hitboxForPlayer({ x: 100, y: 200, gravity: -1 }), { left: 116, top: 209, right: 153, bottom: 257, width: 37, height: 48 });
});

test('reports static blocks touching the selected player hitbox', () => {
  const contacts = contactsForPlayer({ x: 100, y: 200, gravity: 1 }, [{ x: 3, y: 6 }, { x: 0, y: 0 }], world);
  assert.deepEqual(contacts, [{ x: 3, y: 6, type: 'overlap' }]);
});

test('predicts a bounded local trajectory without mutating the player', () => {
  const player = { x: 100, y: 200, vx: 300, vy: 0, gravity: 1 };
  const trajectory = predictTrajectory(player, { steps: 4, dt: 1 / 40, gravityAcceleration: 30000 });
  assert.equal(trajectory.length, 5);
  assert.equal(trajectory[0].x, 100);
  assert.equal(trajectory.at(-1).x > 100, true);
  assert.equal(trajectory.at(-1).y > 200, true);
  assert.deepEqual(player, { x: 100, y: 200, vx: 300, vy: 0, gravity: 1 });
});
