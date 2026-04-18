<div align="center">
  <h1>QuizArena</h1>
  <p><strong>Real-time multiplayer trivia, with an authoritative server.</strong></p>
  <p>
    <a href="#quickstart">Quickstart</a> ·
    <a href="#tech-stack">Tech stack</a> ·
    <a href="#license">License</a>
  </p>
</div>

<!-- TODO: Replace with a 10-second gameplay GIF -->
<!-- <p align="center">
  <img src="./docs/preview.png" alt="QuizArena preview" width="720" />
</p> -->

## About

QuizArena is a room-based multiplayer trivia engine. Host a game, share a code, and play with friends in real time — synchronized questions, speed-based scoring, and a live leaderboard.

Built as a study in production-grade WebSocket patterns: authoritative server state, type-safe message contracts, and horizontal scale.

## Features

- ⚡ Real-time gameplay over WebSockets
- 🏠 Room-based multiplayer with shareable codes
- ⏱️ Server-authoritative timing and scoring
- 🏆 Live leaderboard with speed bonuses
- 🔐 Type-safe message protocol shared between client and server
- 📈 Horizontally scalable with Redis pub/sub

## Tech stack

[Node.js](https://nodejs.org) · [TypeScript](https://www.typescriptlang.org) · [ws](https://github.com/websockets/ws) · [React](https://react.dev) · [Vite](https://vite.dev) · [Bun](https://bun.sh) · [Turborepo](https://turborepo.com) · [Biome](https://biomejs.dev) · [Redis](https://redis.io)

## Quickstart

**Prerequisites:** Node.js 24, Bun 1.3+

```bash
git clone https://github.com/pransshhh/quizarena.git
cd quizarena
bun install
bun dev
```

Server runs on `ws://localhost:3001`, client on `http://localhost:5173`.

## Status

🚧 Active development. See [issues](https://github.com/YOUR_USERNAME/quizarena/issues) for planned work.

## License

[MIT](./LICENSE)