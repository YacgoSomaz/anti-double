import { GameRoom } from './game-room.mjs';

const ROOM_CODE = /^[A-Z0-9_-]{3,12}$/;

export class MatchManager {
  #level;
  #rooms = new Map();
  #memberships = new Map();

  constructor(level) {
    this.#level = level;
  }

  join(roomCode, id) {
    const room = String(roomCode ?? '').trim().toUpperCase();
    if (!ROOM_CODE.test(room)) return { ok: false, error: 'invalid_room' };
    this.leave(id);
    const game = this.#rooms.get(room) ?? new GameRoom(this.#level);
    const result = game.join(id);
    if (!result.ok) return result;
    this.#rooms.set(room, game);
    this.#memberships.set(id, room);
    return { ...result, room };
  }

  leave(id) {
    const room = this.#memberships.get(id);
    if (!room) return null;
    this.#memberships.delete(id);
    const game = this.#rooms.get(room);
    if (!game) return null;
    game.leave(id);
    if (game.snapshot().players.length === 0) this.#rooms.delete(room);
    return room;
  }

  input(id, event) {
    const room = this.#memberships.get(id);
    if (!room) return { ok: false, error: 'not_in_match' };
    return this.#rooms.get(room).input(id, event);
  }

  tick(seconds) {
    return [...this.#rooms.entries()].map(([room, game]) => ({
      room,
      recipients: [...this.#memberships.entries()].filter(([, membership]) => membership === room).map(([id]) => id),
      snapshot: game.tick(seconds)
    }));
  }
}
