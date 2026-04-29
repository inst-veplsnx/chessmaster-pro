# ChessMaster Pro

> Chess for FAANG interview prep — gamified logic training through chess puzzles that sharpen pattern recognition, strategic thinking, and algorithmic reasoning. Think LeetCode, but on a chess board.

## Features

- **Play vs AI** — Stockfish 16 (WebAssembly) with 20 difficulty levels, bullet to classical time controls
- **Puzzle Training** — Curated puzzles tagged by interview skill: algorithms, system design, debugging
- **Post-game Analysis** — Move-by-move evaluation, accuracy %, blunder/mistake/brilliant classification
- **Multiplayer** — Real-time games via WebSocket server with chat, draw offers, and reconnection handling
- **Interview Prep Mode** — Timed puzzle sets with algorithmic explanations after each solve
- **Leaderboards & Profiles** — ELO rating, activity heatmap, achievement badges
- **Themes** — 4 board themes (Classic, Marble, Cyberpunk, Tournament), light/dark app themes

## Tech Stack

| Layer           | Technology                                            |
| --------------- | ----------------------------------------------------- |
| Frontend        | Next.js 14 (App Router), TypeScript 5, Tailwind CSS 3 |
| UI Components   | shadcn/ui, Radix UI, Framer Motion 11                 |
| Chess Engine    | Custom TypeScript engine + Stockfish 16 (WASM)        |
| Drag & Drop     | dnd-kit                                               |
| Charts          | Recharts                                              |
| Auth & Database | Supabase (PostgreSQL, RLS, Auth)                      |
| Payments        | Stripe (subscriptions, webhooks)                      |
| Multiplayer     | Node.js + Socket.io WebSocket server                  |
| Testing         | Jest + React Testing Library                          |
| Linting         | ESLint + Prettier + Husky                             |

## Project Structure

```
chessmaster-pro/
├── app/
│   ├── (auth)/          # login, register, onboarding
│   ├── (dashboard)/     # play, puzzles, analysis, leaderboard, profile, stats, settings, pricing
│   ├── api/             # stripe webhooks, checkout, portal
│   └── layout.tsx
├── components/
│   ├── chess/           # ChessBoard, Square, PieceSVG, CapturedPieces, GameAnalysis...
│   └── layout/          # Sidebar, Topbar
├── lib/
│   ├── engine/          # Pure TS chess engine (moves, FEN, PGN, rules)
│   ├── stockfish/       # Stockfish WASM wrapper
│   └── supabase/        # Client, server, admin helpers
├── hooks/               # useChessGame, useSound, useSubscription...
├── public/pieces/       # SVG chess pieces (classic theme)
└── websocket-server/    # Standalone Node.js + Socket.io server
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account (optional for local dev without payments)

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/chessmaster-pro
cd chessmaster-pro
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_TEAM_MONTHLY=price_...

# WebSocket Server
WS_SERVER_URL=ws://localhost:3001
NEXT_PUBLIC_WS_SERVER_URL=ws://localhost:3001
```

### Run the app

```bash
# Next.js dev server
npm run dev

# WebSocket server (for multiplayer, in a separate terminal)
cd websocket-server && npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other commands

```bash
npm run build      # Production build
npm run lint       # ESLint
npm run format     # Prettier
npm test           # Jest unit tests
```

## Deployment
*I kindly request you to download and run the project locally, as there were problems with the deployment.*

### Next.js app → Vercel

1. Push to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel → Settings → Environment Variables
4. Deploy — you'll get a URL like `https://chessmaster-pro.vercel.app`
5. Create a Stripe webhook pointing to `https://your-domain.vercel.app/api/stripe/webhook` and add the signing secret back to Vercel env vars
6. Redeploy

### WebSocket server → Railway

1. Push `websocket-server/` as its own GitHub repo
2. Import at [railway.app](https://railway.app)
3. Add env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PORT=3001`
4. Generate a domain in Railway → Settings → Networking
5. Update `NEXT_PUBLIC_WS_SERVER_URL=wss://your-service.up.railway.app` in Vercel

## Subscription Plans

| Feature        | Free     | Pro ($9.99/mo)         |
| -------------- | -------- | ---------------------- |
| Puzzles        | 10/day   | Unlimited              |
| Analysis depth | 12 ply   | 18 ply                 |
| Board themes   | Classic  | All 4 themes           |
| Piece themes   | Classic  | Classic, Modern, Pixel |
| Matchmaking    | Standard | Priority               |

## License

MIT
