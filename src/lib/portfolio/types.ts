// src/lib/portfolio/types.ts
export interface Token {
  contractAddress: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  balance: bigint; // raw on-chain integer, NOT human-formatted
  chainId: number;
}

export interface WalletPortfolioProvider {
  getTokenBalances(address: `0x${string}`, chainId: number): Promise<Token[]>;
}
