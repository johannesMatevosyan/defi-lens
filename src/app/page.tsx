import { AssetAllocationChart } from "@/components/AssetAllocationChart";
import { ChainFilterTabs } from "@/components/ChainFilterTabs";
import { DefiTvlHistoryChart } from "@/components/DefiTvlHistoryChart";
import { PortfolioHistoryChart } from "@/components/PortfolioHistoryChart";
import { PortfolioList } from "@/components/PortfolioList";
import { SwapHistoryList } from "@/components/SwapHistoryList";
import { TransactionList } from "@/components/TransactionList";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-6 px-4 bg-white dark:bg-black sm:items-start">

        <h2 className="text-lg font-semibold mt-8 mb-2">DeFi Total Value Locked Over Time</h2>
        <DefiTvlHistoryChart />

        <h2 className="text-lg font-semibold mt-8 mb-2">Your Portfolio Value Over Time</h2>
        <PortfolioHistoryChart />

        <h2 className="text-lg font-semibold mt-8 mb-2">Asset Allocation</h2>
        <AssetAllocationChart />

        <div className="w-full mt-8">
            <ChainFilterTabs />
            <PortfolioList />
            <TransactionList />
            <div className="mt-8 p-4 border rounded-lg border-zinc-300 dark:border-zinc-700 text-center">
              <SwapHistoryList />
            </div>
        </div>
      </main>
    </div>
  );
}
