# Visual QA — scaled results and unobstructed stage

## Evidence

- Source visual truth: `public/assets/menu/multi-end.png` (original 640×501 result-board asset).
- Implementation captures: `qa-mobile-rank.png` and `qa-mobile-stage.png`.
- Full-view comparison: `qa-rank-comparison.png` places the original board and the rendered mobile board side by side.
- Viewport: 390×844, Chromium/Playwright, device scale factor 1.
- State: connected production page with the end-screen shown and four representative character slots populated; stage capture has front/end overlays hidden after assets loaded.
- Primary interactions checked: the `下一把` button remains visible at the lower right; source-loaded player atlas slots render inside the board.
- Console: no browser console errors were emitted during the capture.

## Comparison history

1. **P1 — fixed-pixel result positions failed on scaled mobile stages.**
   - Earlier implementation positioned character slots in fixed CSS pixels, so the 640×501 source coordinates did not scale with the canvas.
   - Fix: expressed all four rank slots and avatar sizes as proportions of the original stage.
   - Post-fix evidence: `qa-rank-comparison.png` shows the winner in the left panel and ranks two through four in their respective right-side panels at a 390px viewport.
2. **P1 — in-canvas HUD obscured upper course art.**
   - Earlier implementation painted the 640×73 HUD after the course decorations.
   - Fix: removed the HUD canvas draw call; course decorations are no longer overpainted.
   - Post-fix evidence: `qa-mobile-stage.png` shows the top course blocks without the advertising banner covering them.

## Fidelity review

- **Fonts and typography:** The original raster `ROUND ENDED`, rank labels, and decorative wordmark are preserved from the recovered asset. The only new text, `下一把`, remains legible at the mobile scale.
- **Spacing and layout rhythm:** The original panel geometry is retained; character slots use exact source-stage proportions, which preserves alignment at mobile and desktop sizes.
- **Colors and visual tokens:** Original board artwork and player atlas colors are used unchanged. The removal of the HUD leaves a consistent blue course background rather than an overlay.
- **Image quality and asset fidelity:** All visible board, course, and character visuals are recovered raster assets; no replacement vector/CSS artwork is used.
- **Copy and content:** The former elimination copy is absent. The remaining action is the requested `下一把` button.

## Findings

No actionable P0, P1, or P2 visual mismatches remain for the requested mobile result-board and top-stage states. The comparison target does not specify a separate external HUD placement, so the intentional removal of the in-stage banner is accepted.

## Follow-up polish

- P3: Capture an organic post-race result from a real four-player round after the next gameplay test; the current visual capture uses representative ranked slots to isolate responsive placement.

## Implementation checklist

- [x] Scale result character slots with the 640×501 stage.
- [x] Keep the next-round control visible in the lower-right corner.
- [x] Stop drawing the HUD over top course assets.
- [x] Verify the rendered production page at a mobile viewport.

final result: passed
