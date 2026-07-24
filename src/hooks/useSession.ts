'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

interface Session {
    address: string;
    chainId: number;
}

export function useSession() {
    const { address, isConnected } = useAccount();
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSession = () => {
        setIsLoading(true);
        return fetch('/api/auth/session')
        .then((res) => res.json())
        .then((data) => setSession(data.session ?? null))
        .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchSession();
    }, []);

    const isAuthenticated =
        !!session && isConnected && session.address.toLowerCase() === address?.toLowerCase();

    return { session, isAuthenticated, isLoading, refetch: fetchSession };
}
