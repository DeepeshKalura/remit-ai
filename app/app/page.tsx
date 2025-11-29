"use client"

import ChatInterface from "@/components/chat-interface"
import ConnectWalletButton from "@/components/connect-wallet-button"
import DexRates from "@/components/dex-rates"
import RemittanceForm from "@/components/remittance-form"
import { FloatingDock } from "@/components/ui/floating-dock"
import WalletState from "@/components/wallet-state"
import { Send, TrendingUp, Wallet } from "lucide-react"
import { useState } from "react"

type ActiveSection = "chat" | "rates" | "send"

export default function DashboardPage() {
    const [activeSection, setActiveSection] = useState<ActiveSection>("chat")

    const dockItems = [
        {
            title: "Chat",
            icon: <Send className="w-full h-full" />,
            href: "#chat",
        },
        {
            title: "Rates",
            icon: <TrendingUp className="w-full h-full" />,
            href: "#rates",
        },
        {
            title: "Send",
            icon: <Wallet className="w-full h-full" />,
            href: "#send",
        }
    ]

    const handleDockItemClick = (section: ActiveSection) => {
        setActiveSection(section)
    }

    const renderSection = () => {
        switch (activeSection) {
            case "chat":
                return <ChatInterface />
            case "rates":
                return <DexRates />
            case "send":
                return <RemittanceForm />

            default:
                return <ChatInterface />
        }
    }

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-slate-900 dark:text-slate-50 pb-32">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-4 py-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                            R
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">RemitAI</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Cardano</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ConnectWalletButton />
                        <div className="flex items-center gap-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-1 rounded-full">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-slate-600 dark:text-slate-300">Live</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
               
                {/* Wallet Section */}
                <WalletState />

                {/* Dynamic Content Area */}
                <div className="space-y-4">
                    {renderSection()}
                </div>
            </div>

            {/* Floating Dock Container */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <div onClick={(e) => {
                    const target = e.target as HTMLElement
                    const link = target.closest('a')
                    if (link) {
                        e.preventDefault()
                        const section = link.href.split('#')[1] as ActiveSection
                        handleDockItemClick(section)
                    }
                }}>
                    <FloatingDock items={dockItems} />
                </div>
            </div>
        </main>
    )
}
