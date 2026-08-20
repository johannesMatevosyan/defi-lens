// src/lib/transactions/constants.ts
import { baseSepolia } from 'viem/chains';

// This is the ONLY place this number should be written by hand.
// Every other file imports it from here instead.
export const TRANSACTION_CHAIN_ID = baseSepolia.id; // 84532 — testnet, used for writes
export const SWAP_HISTORY_CHAIN_ID = 8453; // Base mainnet — where the subgraph indexes swaps
