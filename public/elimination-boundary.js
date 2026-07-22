export const ELIMINATION_BOUNDARY_FRAME_COUNT = 4;
export const ELIMINATION_BOUNDARY_FRAME_MS = 90;

export function eliminationBoundaryFrame(elapsedMs) {
  return Math.floor(Math.max(0, elapsedMs) / ELIMINATION_BOUNDARY_FRAME_MS) % ELIMINATION_BOUNDARY_FRAME_COUNT;
}
