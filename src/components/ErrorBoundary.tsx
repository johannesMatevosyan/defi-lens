// src/components/ErrorBoundary.tsx
'use client';

import { Component, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallbackMessage?: string;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        console.error('Caught by ErrorBoundary:', error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <p className="text-sm text-red-600">
                {this.props.fallbackMessage ?? 'Something went wrong loading this section.'}
                </p>
            );
        }

        return this.props.children;
    }
}
