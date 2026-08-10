// src/app/swaps/page.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SwapHistoryList } from '@/components/SwapHistoryList';
import { BentoCard } from '@/components/layout/BentoCard';

export default function SwapsPage() {
    return (
        <BentoCard title="Swap History">
            <ErrorBoundary fallbackMessage="Couldn't load swap history.">
                <SwapHistoryList />
            </ErrorBoundary>
        </BentoCard>
    );
}
