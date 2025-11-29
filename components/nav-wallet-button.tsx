"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BrowserWallet } from "@meshsdk/core"
import { useWallet } from "@meshsdk/react"
import { AlertCircle, ChevronDown, Copy, Loader2, LogOut, Wallet as WalletIcon } from "lucide-react"
import { useEffect, useState } from "react"

interface NavWalletButtonProps {
    onWalletClick?: () => void
}

export default function NavWalletButton({ onWalletClick }: NavWalletButtonProps) {
    // Access Global Mesh State
    const { connected, wallet, disconnect, name, connect, connecting } = useWallet()
    
    // Local State for UI
    const [balance, setBalance] = useState<number>(0)
    const [address, setAddress] = useState<string>("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [availableWallets, setAvailableWallets] = useState<{ name: string; icon: string; version: string }[]>([])

    // 1. Load installed wallets (Client-Side Only)
    useEffect(() => {
        // BrowserWallet.getInstalledWallets() returns a list of wallets injected into window.cardano
        setAvailableWallets(BrowserWallet.getInstalledWallets())
    }, [])

    // 2. Sync Balance & Address when globally connected
    useEffect(() => {
        if (connected && wallet) {
            wallet.getLovelace().then((lovelace) => {
                setBalance(Number(lovelace) / 1_000_000)
            })
            wallet.getChangeAddress().then((addr) => {
                setAddress(addr)
            })
        }
    }, [connected, wallet])

    const copyAddress = () => {
        if (address) navigator.clipboard.writeText(address)
    }

    const shortAddress = address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : "..."

    // --- HANDLER: Connect Button Clicked ---
    const handleConnectClick = () => {
        // 1. Fire your custom navigation/analytics event
        if (onWalletClick) {
            onWalletClick()
        }
        // 2. Open the custom wallet selection modal
        setIsModalOpen(true)
    }

    // --- HANDLER: Specific Wallet Selected (e.g. Nami) ---
    const handleWalletSelect = async (walletName: string) => {
        try {
            await connect(walletName)
            setIsModalOpen(false)
        } catch (error) {
            console.error("Failed to connect:", error)
        }
    }

    // === STATE 1: NOT CONNECTED (Show Custom Button + Modal) ===
    if (!connected) {
        return (
            <>
                <Button 
                    onClick={handleConnectClick}
                    className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition-all shadow-md font-medium"
                >
                    <WalletIcon className="w-4 h-4 mr-2" />
                    Connect Wallet
                </Button>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <DialogHeader>
                            <DialogTitle className="text-center text-xl font-bold text-slate-900 dark:text-white">
                                Connect Cardano Wallet
                            </DialogTitle>
                        </DialogHeader>
                        
                        <div className="grid gap-3 py-4">
                            {availableWallets.length === 0 ? (
                                <div className="text-center p-6 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <AlertCircle className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">No wallets found</p>
                                    <p className="text-xs text-slate-400 mt-1">Please install Nami, Eternl, or Flint.</p>
                                </div>
                            ) : (
                                availableWallets.map((w) => (
                                    <Button
                                        key={w.name}
                                        variant="outline"
                                        onClick={() => handleWalletSelect(w.name)}
                                        disabled={connecting}
                                        className="h-14 justify-start px-4 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 relative group"
                                    >
                                        {/* Wallet Icon */}
                                        <div className="w-8 h-8 mr-4 relative">
                                            <img src={w.icon} alt={w.name} className="object-contain w-full h-full" />
                                        </div>
                                        
                                        <div className="flex flex-col items-start">
                                            <span className="font-semibold capitalize text-slate-900 dark:text-white text-base">
                                                {w.name}
                                            </span>
                                            <span className="text-xs text-slate-500">Detected</span>
                                        </div>
                                        
                                        {connecting && <Loader2 className="ml-auto w-5 h-5 animate-spin text-slate-400" />}
                                    </Button>
                                ))
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        )
    }

    // === STATE 2: CONNECTED (Show Dropdown) ===
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 gap-2 pl-3 pr-2 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="hidden sm:inline-block font-mono text-xs font-medium">
                        {shortAddress}
                    </span>
                    <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <DropdownMenuLabel>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 capitalize">{name} Wallet</span>
                        <span className="text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                            Connected
                        </span>
                    </div>
                </DropdownMenuLabel>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 mx-1 rounded-md border border-slate-100 dark:border-slate-700/50 mb-2">
                    <p className="text-xs text-slate-500 mb-1">Available Balance</p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{balance.toFixed(2)}</p>
                        <span className="text-xs font-medium text-slate-500">₳</span>
                    </div>
                </div>

                <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Address
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => disconnect()}
                    className="text-red-500 dark:text-red-400 focus:text-red-600 dark:focus:text-red-300 cursor-pointer"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}