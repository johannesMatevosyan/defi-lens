// src/components/WalletInfo.tsx
'use client';
import { ChainIndicator } from '@/components/ChainIndicator';

import { useAccount, useBalance, useEnsAvatar, useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';

interface WalletInfoProps {
  onSwitchNetwork?: () => void;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletInfo({ onSwitchNetwork }: WalletInfoProps) {
  const { address, chain, isConnected } = useAccount();

  // ENS only exists on Ethereum mainnet — resolve there explicitly,
  // regardless of which chain the wallet is actually connected to.
  const { data: ensName } = useEnsName({
    address,
    chainId: mainnet.id,
  });

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ?? undefined,
    chainId: mainnet.id,
  });

  const { data: balance } = useBalance({
    address,
    chainId: chain?.id,
  });

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

      <ChainIndicator onSwitchNetwork={onSwitchNetwork} />
    </div>
  );
}
