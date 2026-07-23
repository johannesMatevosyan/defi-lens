// src/components/WalletInfo.tsx
'use client';

import { useAccount, useBalance, useEnsAvatar, useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletInfo() {
  const { address, chain, isConnected } = useAccount();

  // ENS only exists on Ethereum mainnet — resolve there explicitly,
  // regardless of which chain the wallet is actually connected to.
  const { data: ensName } = useEnsName({
    address,
    chainId: mainnet.id,
  });

  console.log('resolved ENS name:', ensName);

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ?? undefined,
    chainId: mainnet.id,
  });

  console.log('resolved ENS avatar:', ensAvatar);

  const { data: balance } = useBalance({
    address,
    chainId: chain?.id,
  });

    console.log('resolved balance:', balance);
    console.log('resolved isConnected: ', isConnected);
    console.log('resolved address:  ', address);

  if (!isConnected || !address) return null;

  return (
    <div className="flex items-center gap-3">
      {ensAvatar ? (
        <img
            src={ensAvatar}
            alt="ENS avatar"
            className="h-8 w-8 rounded-full"
            width={32}
            height={32}
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500" />
      )}

      <div className="flex flex-col text-sm">
        <span className="font-medium">{ensName ?? truncateAddress(address)}</span>
        {balance && (
          <span className="text-gray-500">
            {Number(balance.formatted).toFixed(4)} {balance.symbol}
          </span>
        )}
      </div>

      <ChainIndicator />
    </div>
  );
}

function ChainIndicator() {
  const { chain } = useAccount();
  if (!chain) return null;

  return (
    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
      {chain.name}
    </span>
  );
}
