import { useAccount } from "wagmi";

// ChainIndicator.tsx
interface ChainIndicatorProps {
  onSwitchNetwork?: () => void;
}

export function ChainIndicator({ onSwitchNetwork }: ChainIndicatorProps) {
    const { chain } = useAccount();
    if (!chain) return null;

    return (
        <button
          type="button"
          onClick={onSwitchNetwork}
          className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 transition-colors"
        >
            {chain.name}
        </button>
    );
}
