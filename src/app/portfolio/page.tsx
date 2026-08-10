// src/app/portfolio/page.tsx
import { AssetAllocationChart } from '@/components/AssetAllocationChart';
import { ChainFilterTabs } from '@/components/ChainFilterTabs';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PortfolioList } from '@/components/PortfolioList';
import { TransactionList } from '@/components/TransactionList';
import { TransferForm } from '@/components/TransferForm';
import { BentoCard } from '@/components/layout/BentoCard';

export default function PortfolioPage() {
    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <BentoCard className="lg:col-span-2" title="Holdings">
                <ErrorBoundary fallbackMessage="Couldn't load portfolio.">
                <ChainFilterTabs />
                <PortfolioList />
                </ErrorBoundary>
            </BentoCard>

            <BentoCard title="Allocation">
                <ErrorBoundary fallbackMessage="Couldn't load allocation.">
                <AssetAllocationChart />
                </ErrorBoundary>
            </BentoCard>

            <BentoCard className="lg:col-span-2" title="Send Tokens">
                <ErrorBoundary fallbackMessage="Couldn't load transfer form.">
                <TransferForm tokenAddress="0x317d0B27A43d45C68dA407595Be0eBB3C0cc7310" />
                </ErrorBoundary>
            </BentoCard>

            <BentoCard title="Recent Transactions">
                <ErrorBoundary fallbackMessage="Couldn't load transactions.">
                <TransactionList />
                </ErrorBoundary>
            </BentoCard>
        </div>
    );
}
