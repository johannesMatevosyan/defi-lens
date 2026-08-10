// src/app/layout.tsx
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ToastContainer } from '@/components/ToastContainer';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
            <body suppressHydrationWarning className="bg-[#030712] text-zinc-100 font-sans antialiased">
                <Providers>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <div className="flex flex-1 flex-col">
                        <Header />
                        <main className="flex-1 p-6">{children}</main>
                      </div>
                    </div>
                    <ToastContainer />
                </Providers>
            </body>
        </html>
    );
}
