// src/app/page.tsx
// import { AssetAllocationChart } from '@/components/AssetAllocationChart';
// import { ChainBreakdownSection } from '@/components/ChainBreakdownSection';
// import { ChainFilterTabs } from '@/components/ChainFilterTabs';
// import { DefiTvlHistoryChart } from '@/components/DefiTvlHistoryChart';
// import { ErrorBoundary } from '@/components/ErrorBoundary';
// import { PortfolioHistoryChart } from '@/components/PortfolioHistoryChart';
// import { PortfolioList } from '@/components/PortfolioList';
// import { ProtocolTvlChart } from '@/components/ProtocolTvlChart';
// import { SwapHistoryList } from '@/components/SwapHistoryList';
// import { TransferForm } from '@/components/TransferForm';


/*
export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-6 px-4 bg-white dark:bg-black sm:items-start">
        <ErrorBoundary fallbackMessage="Couldn't load your portfolio.">
          <ChainFilterTabs />
          <PortfolioList />
        </ErrorBoundary>

        <ErrorBoundary fallbackMessage="Couldn't load your swap history.">
          <SwapHistoryList />
        </ErrorBoundary>

        <h2 className="text-lg font-semibold mt-8 mb-2">Send Test Tokens</h2>
        <TransferForm tokenAddress="0x317d0B27A43d45C68dA407595Be0eBB3C0cc7310" />

        <h2 className="text-lg font-semibold mt-8 mb-2">Your Portfolio Value Over Time</h2>
        <ErrorBoundary fallbackMessage="Couldn't load portfolio history chart.">
          <PortfolioHistoryChart />
        </ErrorBoundary>

        <h2 className="text-lg font-semibold mt-8 mb-2">Top DeFi Protocols by TVL</h2>
        <ErrorBoundary fallbackMessage="Couldn't load protocol data.">
          <ProtocolTvlChart />
        </ErrorBoundary>

        <h2 className="text-lg font-semibold mt-8 mb-2">DeFi Total Value Locked Over Time</h2>
        <ErrorBoundary fallbackMessage="Couldn't load TVL history.">
          <DefiTvlHistoryChart />
        </ErrorBoundary>

        <h2 className="text-lg font-semibold mt-8 mb-2">Asset Allocation</h2>
        <ErrorBoundary fallbackMessage="Couldn't load your asset allocation.">
          <AssetAllocationChart />
        </ErrorBoundary>

        <h2 className="text-lg font-semibold mt-8 mb-2">Holdings by Chain</h2>
        <ErrorBoundary fallbackMessage="Couldn't load chain breakdown.">
          <ChainBreakdownSection />
        </ErrorBoundary>
      </main>
    </div>
  );
}
*/

import { redirect } from 'next/navigation';
export default function Home() {
  redirect('/portfolio');
}
