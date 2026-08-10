// src/components/layout/Sidebar.tsx
'use client';

import { BarChart3, LayoutDashboard, Repeat, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/portfolio', label: 'Portfolio', icon: Wallet },
  { href: '/analytics', label: 'Analytics', icon: LayoutDashboard },
  { href: '/protocols', label: 'Protocols', icon: BarChart3 },
  { href: '/swaps', label: 'Swaps', icon: Repeat },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside id="sidebar" className="hidden w-56 flex-col border-r border-border bg-card px-3 py-6 sm:flex">
            <div className="mb-8 px-3 text-lg font-semibold tracking-tight">DeFi Lens SIDEBAR</div>
            <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                                isActive
                                ? 'bg-white/10 text-white'
                                : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                            }`}
                            >
                            <Icon size={16} strokeWidth={2} />
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
