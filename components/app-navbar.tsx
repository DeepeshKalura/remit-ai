"use client"

import Link from "next/link"
import NavWalletButton from "./nav-wallet-button"

export default function AppNavbar() {
    
    // logic to run when button is clicked
    const handleWalletClick = () => {
        console.log("✅ Wallet button clicked! Triggering analytics or navigation...")
        // Example: router.push('/dashboard')
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

                {/* Left Side: Brand */}
                <Link href="/app" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
                        R
                    </div>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">
                        RemitAI
                    </span>
                </Link>

                {/* Right Side: Wallet Action */}
                <div className="flex items-center gap-6">
                    <NavWalletButton onWalletClick={handleWalletClick} />
                </div>
            </div>
        </header>
    )
}