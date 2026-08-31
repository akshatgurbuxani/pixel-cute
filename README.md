# Pixel Hugs ♡

A small mobile-first catch game built with React, TypeScript, Vite, Framer Motion, and the Web Audio API.

## Development

```bash
npm install
npm run dev
```

Before shipping a change, run:

```bash
npm run lint
npm run build
```

## Architecture

- `src/game/catchGameEngine.ts` contains the framework-independent game rules and simulation.
- `src/hooks/useCatchGame.ts` owns game phases and the single active animation loop.
- `src/components/CatchGame.tsx` renders UI and paints live coordinates without per-frame React renders.
- `src/hooks/usePixelSound.ts` owns audio nodes, scheduling, suspension, and cleanup.
- `src/data/` contains sprites and deterministic decorative data.

The simulation loop runs only while a round is active. Decorative animation is reduced on small screens and paused during gameplay so mobile devices can prioritize input and collision updates.

## Customize

Edit `src/data/sprites.ts` for copy, sprite grids, and palette values. Game tuning constants live in `src/game/catchGameEngine.ts`.
