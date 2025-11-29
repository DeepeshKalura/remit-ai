"use client";

import AppNavbar from '@/components/app-navbar';
import ChatInterface from '@/components/chat-interface';
import DexRates from '@/components/dex-rates';
import RemittanceForm from '@/components/remittance-form';
import PayeeManager from '@/components/payee-manager';
import { FloatingDock } from '@/components/ui/floating-dock';
import { Send, TrendingUp, Wallet, Users } from 'lucide-react';
import { useState } from 'react';

type ActiveSection = 'chat' | 'rates' | 'send' | 'payees';

export default function DashboardPage() {
    const [activeSection, setActiveSection] = useState<ActiveSection>('chat');

    const dockItems = [
        {
            title: 'Chat',
            icon: <Send className="w-full h-full" />,
            href: '#chat',
        },
        {
            title: 'Rates',
            icon: <TrendingUp className="w-full h-full" />,
            href: '#rates',
        },
        {
            title: 'Send',
            icon: <Wallet className="w-full h-full" />,
            href: '#send',
        },
        {
            title: 'Payees',
            icon: <Users className="w-full h-full" />,
            href: '#payees',
        }
    ];

    const handleDockItemClick = (section: ActiveSection) => {
        setActiveSection(section);
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'chat':
                return <ChatInterface />;
            case 'rates':
                return <DexRates />;
            case 'send':
                return <RemittanceForm />;
            case 'payees':
                return <PayeeManager userId={99} />;
            default:
                return <ChatInterface />;
        }
    };

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-slate-900 dark:text-slate-50 pb-32">
            {/* Persistent Navbar */}
            <AppNavbar />

            {/* Main Content Area */}
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                {/* Dynamic Content Area */}
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {renderSection()}
                </div>
            </div>

            {/* Floating Dock Container */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <div onClick={(e) => {
                    const target = e.target as HTMLElement;
                    const link = target.closest('a');
                    if (link) {
                        e.preventDefault();
                        const section = link.href.split('#')[1] as ActiveSection;
                        handleDockItemClick(section);
                    }
                }}>
                    <FloatingDock items={dockItems} />
                </div>
            </div>
        </main>
    );
}
