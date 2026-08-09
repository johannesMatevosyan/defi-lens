// src/lib/transactions/known-contracts.ts
const KNOWN_CONTRACTS: Record<string, string> = {
  '0x317d0b27a43d45c68da407595be0ebb3c0cc7310': 'DeFi Lens Test Token (DLT)',
  // Add real, trusted contract addresses here as your app grows —
  // always lowercase, since addresses are compared case-insensitively.
};

export function getKnownContractName(address: string): string | null {
  return KNOWN_CONTRACTS[address.toLowerCase()] ?? null;
}
