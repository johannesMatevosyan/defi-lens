# DeFi Lens

A production-grade Web3 DeFi portfolio dashboard built to demonstrate senior-level
Web3 frontend engineering: wallet connection, cryptographic authentication (SIWE),
on-chain data reads, contract simulation, transaction safety, DEX/DeFi analytics,
and multi-chain portfolio aggregation.

Built with Next.js App Router, wagmi + viem, RainbowKit, and a security-first
architecture where every API key and signing verification stays server-side.

**🔴 Live: [defi-lens-blue.vercel.app](https://defi-lens-blue.vercel.app/)**

> This project was built incrementally, milestone by milestone, with each step
> committed independently. See [Progress](#progress) below for current status.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, Turbopack) |
| Wallet / EVM | wagmi v2 + viem |
| Wallet UI | RainbowKit |
| Auth | SIWE (`viem/siwe`) + Next.js Route Handlers + `iron-session` (encrypted HttpOnly cookie) |
| RPC | Alchemy (authenticated, proxied server-side) + public RPC fallback |
| Portfolio data | Alchemy Token API + viem Multicall (batched, cross-verified) |
| DEX data | The Graph — Uniswap v3 subgraph (Subgraph Studio, cursor pagination) |
| Price data | CoinGecko API (Demo tier, proxied server-side, retry/backoff) |
| DeFi data | DefiLlama API (protocols, historical TVL) |
| Remote state | TanStack Query v5 |
| UI state | Zustand (with Redux DevTools integration) |
| Local persistence | IndexedDB (`idb`) — portfolio snapshots, transaction history, swap history, all with stale-while-revalidate |
| Charts | Recharts (protocol TVL, DeFi TVL history, asset allocation, chain breakdown, portfolio value over time) |
| Styling | Tailwind CSS |
| Deployment | Vercel |

## Networks

| Network | Role |
|---|---|
| **Base** | Primary — reads (live) and writes (real transfers tested on testnet, mainnet writes not yet enabled) |
| **Ethereum Mainnet** | Secondary — read-only portfolio data, aggregated with Base |
| **Base Sepolia** | Testnet — all contract writes, approvals, transfers (free test ETH) |

---

## Architecture
```
Browser
├── wagmi + viem
│   ├── Wallet connection (RainbowKit — MetaMask, WalletConnect, Coinbase Wallet via EIP-6963)
│   ├── Direct RPC reads (via Alchemy-backed proxy transport)
│   ├── Contract simulation (simulateContract)
│   └── Transaction execution (Base Sepolia, tested end-to-end)
│
├── TanStack Query
│   └── All remote/on-chain server state, per-data-type staleTime strategy
│
├── Zustand
│   ├── Portfolio UI state (chain filter, view mode, hide-zero-balances)
│   └── Transaction state machine (simulating → awaiting-signature → broadcasting → pending → confirmed/failed)
│
├── IndexedDB
│   ├── Portfolio token snapshots (stale-while-revalidate)
│   ├── Transaction history (persisted across sessions)
│   ├── Swap history (merge-based caching — old swaps never expire, new ones merge in)
│   └── Daily portfolio value snapshots (for the value-over-time chart)
│
└── Next.js Route Handlers (every third-party secret stays here, never in the browser)
    ├── /api/rpc/[chainId]           — Alchemy RPC proxy w/ public-RPC fallback
    ├── /api/auth/nonce               — SIWE nonce generation
    ├── /api/auth/verify              — SIWE signature verification + session creation
    ├── /api/auth/session              — current session lookup
    ├── /api/auth/logout               — session destruction
    ├── /api/protected/whoami          — example session-gated route
    ├── /api/portfolio/tokens          — Alchemy discovery + viem Multicall batch reads
    ├── /api/portfolio/prices          — CoinGecko batched pricing, retry/backoff
    ├── /api/graph/swaps               — The Graph (Uniswap v3 Base), cursor pagination
    ├── /api/defillama/protocols       — top protocols by TVL
    └── /api/defillama/historical-tvl  — DeFi-wide TVL history
```

**Core security rule enforced throughout:** no API key (Alchemy, CoinGecko, The Graph) is
ever shipped to the browser. Every third-party call requiring a secret is proxied
through a server-only Route Handler — verified directly via the Network tab on the
live deployment.

---

## Progress

### ✅ Milestone 1 — Project Setup & Wallet Connection
Next.js scaffold, wagmi v2 + viem + RainbowKit for Base/Ethereum/Base Sepolia, Alchemy RPC proxy with public-RPC fallback, multi-wallet connection (EIP-6963), wallet display (ENS, balance, chain indicator), wrong-network handling, account/chain-change event handling.

### ✅ Milestone 2 — Authentication (SIWE + iron-session)
SIWE nonce generation, wallet signing flow, server-side ECDSA signature verification, encrypted HttpOnly session via `iron-session`, `useSession` hook, session-protected Route Handlers, session expiry, wrong-chain-at-sign-in guard, disconnect/reconnect and account-switch edge cases.

### ✅ Milestone 3 — On-Chain Portfolio Tracking
Alchemy token discovery + viem Multicall batched reads (symbol/name/decimals/balance in one RPC call), CoinGecko batched pricing with retry/backoff, TanStack Query per-data-type caching strategy, Zustand UI state (chain filter, view mode), IndexedDB caching, full portfolio UI with loading/error/empty states.

### ✅ Milestone 4 — Contract Interaction & Transaction Safety
Transaction lifecycle understanding, Zustand transaction state machine + IndexedDB persistence, contract simulation (`simulateContract`) with human-readable revert reason extraction, ERC-20 approval flow (exact vs. infinite approval, allowance re-verification — tested live on Base Sepolia, both modes confirmed on-chain), EIP-1559 gas estimation with safety buffer, full end-to-end transfer flow (validation, live re-simulation, gas display, network-mismatch guard), wallet safety patterns (gas-spike warning vs. recent average, known-contract verification, honeypot/rug-pull/sandwich-attack/MEV explanations).

### ✅ Milestone 5 — DEX Trade History via The Graph
Uniswap v3 Base subgraph (verified against Graph Explorer, Subgraph Studio API key), swap history with direction/relative-time/USD value display, cursor-based pagination (`timestamp_lt`, avoiding `skip`), IndexedDB merge-caching (old swaps persist, new ones merge in without duplication).

### ✅ Milestone 6 — DeFi Analytics + Charts + Deployment
DefiLlama integration (protocol TVL, historical TVL), four Recharts visualizations (protocol TVL bar chart, DeFi TVL history line chart, asset allocation donut chart, portfolio-value-over-time), **real** multi-chain aggregation (Base + Ethereum combined, with per-chain breakdown chart — not a placeholder), error boundaries around every independent section, deployed live to Vercel.

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/johannesMatevosyan/defi-lens.git
cd defi-lens
npm install
```

### 2. Environment variables

Create `.env.local` in the project root:

```bash
# Server-only — never prefixed with NEXT_PUBLIC_, never sent to the browser
ALCHEMY_API_KEY=your_alchemy_api_key
SESSION_SECRET=64_char_random_hex_string_for_iron_session
COINGECKO_API_KEY=your_coingecko_demo_api_key
GRAPH_API_KEY=your_subgraph_studio_api_key

# Client-side — required by RainbowKit for WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

> **Never commit `.env.local`.** Confirm it's in `.gitignore` before your first commit.

Free accounts needed:
- [Alchemy](https://alchemy.com) — app covering Base, Ethereum mainnet, Base Sepolia
- [WalletConnect Cloud](https://cloud.walletconnect.com) — Project ID
- [CoinGecko](https://www.coingecko.com/en/api/pricing) — free **Demo** API key (the fully keyless public tier is too rate-limited for real use)
- [The Graph — Subgraph Studio](https://thegraph.com/studio) — free API key; also verify your chosen subgraph is actively indexed via [Graph Explorer](https://thegraph.com/explorer) before trusting it — multiple similarly-named subgraphs can exist from different, unverified sources

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Get testnet funds (for Milestone 4 transaction testing)

Use a **dedicated development wallet — never your real one.** Several Base Sepolia
faucets require a small existing mainnet ETH balance as an anti-bot measure; if you
hit that wall, a proof-of-work mining faucet (no balance requirement) is a good
fallback:
- https://alchemy.com/faucets/base-sepolia
- https://faucet.quicknode.com/base/sepolia
- https://faucets.chain.link/base-sepolia

> **Gotcha:** MetaMask's testnet network selector is a separate menu from the
> main network dropdown at the top of the extension. Always confirm the *active*
> network via the testnet toggle specifically before signing — the main display
> can look correct while the wallet is actually still active on a different
> network underneath.

---

## Security Notes

- All third-party API keys (Alchemy, CoinGecko, The Graph) live server-side only and are proxied through Route Handlers — verified via the Network tab on the live deployment to confirm zero exposure in the browser.
- Authentication uses SIWE + `iron-session` (encrypted HttpOnly cookie), not `localStorage`, to avoid XSS-based token theft.
- Sessions carry an explicit `issuedAt` and are rejected server-side once expired, independent of cookie-level TTL.
- All contract writes happen on Base Sepolia (testnet) during development — no real funds at risk while iterating on transaction/approval flows.
- Every contract write is simulated (`simulateContract`) before being sent to the wallet for signing.
- ERC-20 approvals present exact-vs-infinite as an explicit user choice rather than defaulting silently — the same UX pattern approval-phishing attacks rely on.
- Every transaction-writing hook (`useBalance`, `writeContractAsync`, gas estimation) explicitly pins `chainId` rather than trusting the wallet's ambient/default network — see Interview Talking Points below for why this matters in practice, not just in theory.

## Known Limitations

- Token lists are not filtered for spam/airdropped tokens — a wallet with a public transaction history (e.g. one that's received unsolicited "airdrops") will show them alongside real holdings.
- Base Sepolia's WalletConnect flow was affected during development by an upstream RainbowKit/WalletConnect compatibility issue ([rainbow-me/rainbowkit#2372](https://github.com/rainbow-me/rainbowkit/issues/2372)); confirmed to only manifest in local dev mode, not in the production build.
- The known-contract verification list (Step 7's safety feature) is intentionally small and manually curated — it's a demonstration of the pattern, not a comprehensive registry.

---

## Interview Talking Points

A few technical decisions from this build worth being able to speak to in depth:

**Multicall vs. an indexer — two different jobs, not competing choices.**
Alchemy's Token API answers "which tokens does this wallet hold?" (something only
a pre-built index can answer quickly). viem's Multicall answers "given this list of
tokens, read all their data in one RPC call" (something only a direct chain read
can guarantee is fresh). The architecture uses both, each for what it's actually
good at, rather than picking one tool and stretching it to cover both jobs.

**Exact vs. infinite ERC-20 approval, shown as an explicit choice.**
Infinite approval is convenient but means a single compromised spender contract
could drain the *entire* future balance of that token, not just the amount in use —
this is the actual mechanism behind real approval-phishing attacks. The UI never
defaults to infinite silently; the user always sees and picks the tradeoff. Both
modes were tested live on Base Sepolia, with allowance re-verified against the
chain after each transaction rather than assumed.

**A transaction can "confirm" in the wallet without ever reaching the intended chain.**
Diagnosed a case where `writeContractAsync` resolved successfully and MetaMask
displayed a completed transaction, yet the transfer never appeared on Base Sepolia.
Root cause: MetaMask's testnet network selector is separate from its main network
display, so the wallet was silently signing on Ethereum Mainnet while every visible
UI cue suggested Base Sepolia. Resolved by cross-verifying against the chain
directly — `eth_getTransactionReceipt` and a raw `eth_call` to `balanceOf`,
decoded independently — rather than trusting any single wallet UI or block
explorer (which themselves showed inconsistent results during the investigation).
Fixed by explicitly passing `chainId` on every write call instead of trusting
the wallet's ambient state.

**Optimistic confirmation is not the same as real confirmation.**
An earlier version of the transfer flow marked transactions "confirmed" immediately
after `writeContractAsync` resolved — which only means the wallet *submitted* the
transaction, not that it succeeded. Fixed by awaiting `waitForTransactionReceipt`
and checking `receipt.status` before updating UI state, so the app's displayed
status always reflects a real, mined, on-chain outcome rather than an assumption.

**Cursor pagination over `skip`-based paging for The Graph.**
`skip` gets slower the deeper you page, since the database still has to walk past
every skipped row. Using `timestamp_lt` as a cursor ("give me everything older than
the last item I saw") avoids that entirely — a small but real, defensible
architecture decision.

**Debugging a real, upstream, currently-unresolved RainbowKit/WalletConnect bug.**
Traced a WalletConnect connection failure through dependency versions
(`@wagmi/connectors` pinning an exact `@walletconnect/ethereum-provider` version),
confirmed it against RainbowKit's own GitHub issues and changelog, and determined
it was a dev-mode-only symptom by testing a production build — rather than
patching around a guess.

**Two-layer caching, each solving a different problem.**
TanStack Query's in-memory cache avoids redundant requests *within* a session.
IndexedDB persists data *across* sessions, so returning users see instant data
via stale-while-revalidate instead of a blank loading state. Swap history
specifically uses a *merge* strategy (never expiring old entries, only adding
new ones) since past transactions are immutable — a different caching approach
than token balances, which genuinely go stale.

**Every third-party secret proxied server-side, verified, not assumed.**
Alchemy, CoinGecko, and The Graph API keys never reach the browser — confirmed
directly via the Network tab on the live deployment, not just by convention.

## Scripts

```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build
npm run start    # start production server
npm run lint     # run ESLint
```

## Deployment

Deployed on [Vercel](https://vercel.com) at [defi-lens-blue.vercel.app](https://defi-lens-blue.vercel.app/).
All secrets are set as Vercel Production environment variables (never committed,
never `NEXT_PUBLIC_`-prefixed unless genuinely safe for client exposure).

## License

MIT
