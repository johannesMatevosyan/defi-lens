# DeFi Lens

A production-grade Web3 DeFi portfolio dashboard built to demonstrate senior-level
Web3 frontend engineering: wallet connection, cryptographic authentication (SIWE),
on-chain data reads, contract simulation, transaction safety, and DEX/DeFi analytics.

Built with Next.js App Router, wagmi + viem, RainbowKit, and a security-first
architecture where all API keys and signing verification stay server-side.

> This project is being built incrementally, milestone by milestone, with each step
> committed independently. See [Progress](#progress) below for current status.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router, TypeScript, Turbopack) |
| Wallet / EVM | wagmi v2 + viem |
| Wallet UI | RainbowKit |
| Auth | SIWE (`viem/siwe`) + Next.js Route Handlers + `iron-session` (encrypted HttpOnly cookie) |
| RPC | Alchemy (authenticated, proxied server-side) + public RPC fallback |
| Portfolio data | Alchemy Token API + direct viem contract reads (cross-verified) |
| DEX data | The Graph — Uniswap v3 subgraph |
| Price data | CoinGecko public API (proxied server-side for rate limiting) |
| DeFi data | DefiLlama API |
| Remote state | TanStack Query v5 |
| UI state | Zustand |
| Local persistence | IndexedDB (wallet/transaction history cache) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Deployment | Vercel |

## Networks

| Network | Role |
|---|---|
| **Base** | Primary — production reads (and writes, once live) |
| **Ethereum Mainnet** | Secondary — read-only portfolio data |
| **Base Sepolia** | Testnet — all contract writes, approvals, transfers (free test ETH) |

---

## Architecture

```
Browser
├── wagmi + viem
│   ├── Wallet connection (RainbowKit — MetaMask, WalletConnect, Coinbase Wallet)
│   ├── Direct RPC reads (via Alchemy-backed proxy transport)
│   ├── Contract simulation (simulateContract) — Milestone 4
│   └── Transaction execution — Milestone 4
│
├── TanStack Query
│   └── All remote/on-chain server state + caching
│
├── Zustand
│   └── Local UI state + transaction history
│
├── IndexedDB
│   └── Persisted wallet history normalization cache
│
└── Next.js Route Handlers
    ├── /api/rpc/[chainId]        — Alchemy RPC proxy w/ public-RPC fallback
    ├── /api/auth/nonce           — SIWE nonce generation
    ├── /api/auth/verify          — SIWE signature verification + session creation
    ├── /api/auth/session         — current session lookup
    ├── Alchemy Token API proxy   — Milestone 3
    ├── CoinGecko proxy          — Milestone 3
    └── Error normalization across all providers
```

**Core security rule enforced throughout:** no API key (Alchemy, etc.) is ever
shipped to the browser. All third-party calls that require a secret are proxied
through server-only Route Handlers.

---

## Progress

### ✅ Milestone 1 — Project Setup & Wallet Connection
- Next.js scaffold (App Router, TypeScript, Tailwind, Turbopack)
- wagmi v2 + viem + RainbowKit configured for Base, Ethereum mainnet, Base Sepolia
- Alchemy RPC proxy Route Handler (`/api/rpc/[chainId]`) with public-RPC fallback transport — key never reaches the browser
- Wallet connection via MetaMask, WalletConnect, and Coinbase Wallet (EIP-6963 multi-wallet discovery)
- Connected wallet display: truncated address, ENS resolution, live balance, chain indicator
- Wrong-network detection + switch-network prompt
- Wallet/account/chain change event handling with query cache invalidation

### ✅ Milestone 2 — Authentication (SIWE + iron-session)
- SIWE nonce generation Route Handler, nonce held in an encrypted session cookie
- Wallet signing flow (Sign-In with Ethereum message, `viem/siwe`)
- Server-side signature verification (ECDSA recovery) + encrypted HttpOnly session via `iron-session`
- `useSession` client hook (loading / authenticated / unauthenticated states)
- Session-protected Route Handlers
- Edge cases handled: stale session vs. disconnected wallet, wallet switched mid-session, expired session, wrong chain at sign-in

### 🚧 Milestone 3 — On-Chain Portfolio Tracking *(next up)*
ERC-20 balances via Alchemy Token API (cross-verified with direct viem reads), Multicall batching, TanStack Query caching strategy, Zustand UI state, IndexedDB history cache, portfolio UI.

### ⏳ Milestone 4 — Contract Interaction & Transaction Safety
Transaction lifecycle, simulation-before-execution, ERC-20 approval flow, EIP-1559 gas estimation, full transfer flow on Base Sepolia, wallet safety patterns.

### ⏳ Milestone 5 — DEX Trade History via The Graph
Uniswap v3 subgraph integration, GraphQL client, swap history, cursor pagination.

### ⏳ Milestone 6 — DeFi Analytics + Charts + Deployment
DefiLlama integration, Recharts visualizations, multi-chain aggregation, production deployment to Vercel.

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/defi-lens.git
cd defi-lens
npm install
```

### 2. Environment variables

Create `.env.local` in the project root:

```bash
# Server-only — never prefixed with NEXT_PUBLIC_, never sent to the browser
ALCHEMY_API_KEY=your_alchemy_api_key
SESSION_SECRET=32_char_minimum_random_string_for_iron_session

# Client-side — required by RainbowKit for WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

> **Never commit `.env.local`.** Confirm it's in `.gitignore` before your first commit.

Free accounts needed:
- [Alchemy](https://alchemy.com) — create an app covering Base, Ethereum mainnet, Base Sepolia
- [WalletConnect Cloud](https://cloud.walletconnect.com) — get a Project ID
- [The Graph](https://thegraph.com) — no key needed for public subgraphs
- [CoinGecko](https://www.coingecko.com/en/api) — no key needed for the public tier

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Get testnet funds (for Milestone 4+ transaction testing)

Use a **dedicated development wallet — never your real one** — and fund it with free Base Sepolia ETH:
- https://faucet.quicknode.com/base/sepolia
- https://learnweb3.io/faucets/base-sepolia

---

## Security Notes

- All third-party API keys (Alchemy) live server-side only and are proxied through Route Handlers — verified via the Network tab to confirm zero exposure to the browser bundle.
- Authentication uses SIWE + `iron-session` (encrypted HttpOnly cookie), not `localStorage`, to avoid XSS-based token theft.
- All contract writes happen on Base Sepolia (testnet) during development — no real funds at risk while iterating on transaction/approval flows.
- Every contract write is simulated (`simulateContract`) before being sent to the wallet for signing.

---

## Scripts

```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build
npm run start    # start production server
npm run lint     # run ESLint
```

## Deployment

Deployed on [Vercel](https://vercel.com). All secrets are set as Vercel environment
variables (never committed, never `NEXT_PUBLIC_`-prefixed unless genuinely safe for
client exposure).

## License

MIT
