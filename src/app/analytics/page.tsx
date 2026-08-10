// src/app/analytics/page.tsx
import { ChainBreakdownSection } from '@/components/ChainBreakdownSection';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PortfolioHistoryChart } from '@/components/PortfolioHistoryChart';
import { BentoCard } from '@/components/layout/BentoCard';

export default function AnalyticsPage() {
    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <BentoCard className="lg:col-span-2" title="Portfolio Value Over Time">
                <ErrorBoundary fallbackMessage="Couldn't load history.">
                    <PortfolioHistoryChart />
                </ErrorBoundary>
            </BentoCard>

            <BentoCard title="Holdings by Chain">
                <ErrorBoundary fallbackMessage="Couldn't load chain breakdown.">
                    <ChainBreakdownSection />
                </ErrorBoundary>
            </BentoCard>
        </div>
    );
}
