# DeFi Security Concepts — Milestone 4, Step 7

Reference notes on the security concepts covered while building DeFi
Lens's transaction safety layer.

---

## 1. Honeypot Contracts

A honeypot is a token contract designed so you *can buy it but can't
sell it*. The contract's code has a hidden rule — often in the
`transfer` or `_beforeTokenTransfer` logic — that blocks or taxes sells
at 100% for anyone except the contract owner. From the outside,
everything looks normal: the token has a name, a symbol, maybe even fake
trading volume. You buy it, your wallet shows a balance, price might even
go up — but the moment you try to sell, the transaction reverts, or
silently sends your tokens to a dead address instead of swapping them.

**Why simulation is the defense:** This is exactly why "always simulate
before execute" matters. `simulateContract` runs the transaction against
current chain state *before* asking the user to sign. If a sell would
revert because of a honeypot rule, simulation catches it and shows the
user a clear "this would fail" message — no gas spent, no tokens lost.

**How to spot one, technically:** Look for suspicious patterns in
contract source — a `sell` path that checks `msg.sender != owner` and
reverts, a hidden fee that changes based on buy vs. sell direction, or
ownership functions that can pause transfers. Tools like Honeypot.is or
GoPlus Security scan for these patterns automatically.

---

## 2. Rug Pulls

A rug pull is when a project's creators drain the liquidity or value out
of a token after convincing people to buy in — pulling the "rug" out
from under holders. Common mechanical forms:

- **Liquidity pull:** the team owns most of the liquidity pool for their
  token (e.g., the TOKEN/ETH pair on a DEX) and simply withdraws all the
  ETH side, leaving buyers holding a token worth nothing.
- **Mint rug:** the contract has an unrestricted `mint()` function the
  owner can call to create billions of new tokens and dump them,
  crashing the price.
- **Ownership rug:** the contract has admin functions (pause trading,
  blacklist addresses, change fees to 100%) used maliciously after
  enough people have bought in.

**Why this matters for the app:** This is a market/trust risk, not
something `simulateContract` alone can catch — a rug pull transaction is
often perfectly "valid" from the EVM's point of view (the owner really
does have permission to call `mint`). The defense here is closer to what
the known-contracts list does: only trust tokens that have been
verified, check if liquidity is locked (e.g. via Unicrypt), and check if
ownership has been renounced (`owner() == address(0)`).

---

## 3. Sandwich Attacks

This is an attack on a *swap*, not a plain transfer. Say a swap of ETH
for some token is submitted on a DEX. The transaction sits briefly in
the **mempool** (the public waiting room of pending transactions) before
a validator picks it up. A bot watching the mempool sees the pending
swap, and:

1. Places its own buy order for the same token *right before* the
   target trade, with a higher gas fee so it gets mined first — pushing
   the price up slightly.
2. Lets the original swap execute next, at that now-worse price.
3. Immediately sells what it bought *right after*, at the price the
   original trade just pushed up — pocketing the difference.

The original trade is "sandwiched" between the bot's buy and sell,
resulting in less output than expected, while the bot walks away with a
small, essentially risk-free profit.

**Why slippage tolerance exists:** This is the whole reason DEX swaps
ask for a "slippage tolerance" — the maximum price movement accepted
before the trade just fails instead of executing at a much worse price.
A tight slippage setting is the main personal defense against this.

---

## 4. MEV (Maximal Extractable Value)

MEV is the umbrella term for all the extra value a block producer (or a
bot working with one) can extract by choosing *which* transactions to
include in a block and in *what order* — beyond just normal gas fees.
Sandwich attacks are one specific type of MEV. Others include:

- **Arbitrage MEV:** spotting a price difference between two DEXs in the
  same block and capturing it — generally seen as harmless/neutral,
  even beneficial (it keeps prices aligned across venues).
- **Liquidation MEV:** racing to be first to liquidate an
  undercollateralized lending position for a reward.
- **Front-running:** seeing a profitable pending transaction and
  copying it with higher gas to get there first.

**Why this exists at all:** Transaction *ordering* within a block isn't
neutral — whoever decides the order can profit from it. This is a
structural feature of how public blockchains work, not a bug in any
specific contract.

**Connection to the app:** This is why gas-estimation and
slippage-awareness matter practically, not just theoretically — every
swap or trade submitted through DeFi Lens is exposed to this
mempool-visibility problem by default, since Base (like most EVM chains)
has a public mempool.

---

## Summary

- **Contract-level risk** — honeypots and rug pulls, where the danger is
  in the contract's own code or admin permissions, defended against with
  simulation and known-contract verification.
- **Ordering-level risk** — sandwich attacks and MEV more broadly, where
  the danger is in *how* and *when* a transaction gets included in a
  block, defended against with slippage tolerance and gas-awareness.
