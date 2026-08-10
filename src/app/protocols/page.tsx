// src/app/protocols/page.tsx
import { DefiTvlHistoryChart } from '@/components/DefiTvlHistoryChart';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BentoCard } from '@/components/layout/BentoCard';
import { ProtocolTvlChart } from '@/components/ProtocolTvlChart';

export default function ProtocolsPage() {
    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <BentoCard title="Top Protocols by TVL">
                <ErrorBoundary fallbackMessage="Couldn't load protocols.">
                    <ProtocolTvlChart />
                </ErrorBoundary>
            </BentoCard>

            <BentoCard title="DeFi TVL Over Time">
                <ErrorBoundary fallbackMessage="Couldn't load TVL history.">
                    <DefiTvlHistoryChart />
                </ErrorBoundary>
            </BentoCard>
        </div>
    );
}
