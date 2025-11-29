"use client"

import { useEffect, useState } from "react"
import WalletConnector from "./wallet-connector"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WalletIcon, Copy, LogOut } from "lucide-react"
import { useWallet } from "@meshsdk/react"

export default function WalletState() {
  const { connected, wallet, disconnect, name, connecting } = useWallet()
  const [balance, setBalance] = useState<number>(0)
  const [address, setAddress] = useState<string>("")

  // Fetch balance and address when connected
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
    if (address) {
      navigator.clipboard.writeText(address)
    }
  }

  if (!connected) {
    return (
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <WalletIcon className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Connect Wallet</h3>
        </div>
        <p className="text-sm text-slate-400 mb-6">
          Connect your Cardano wallet to start sending remittances.
        </p>
        <div className="space-y-2">
          {/* Pass strictly what's needed or nothing if Connector manages itself */}
          <WalletConnector />
          <p className="text-xs text-slate-500 text-center">Supported: Nami, Eternl, Flint, Yoroi</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-cyan-400 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-slate-900">✓</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Wallet Connected</h3>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs mt-1 capitalize">
              {name} Connected
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-slate-400 mb-2">Address</p>
          <div className="flex items-center gap-2 bg-slate-700/50 p-3 rounded">
            <code className="text-sm text-cyan-400 flex-1 truncate">{address || "Loading..."}</code>
            <button onClick={copyAddress} className="p-1 hover:bg-slate-600 rounded transition-colors">
              <Copy className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="bg-slate-700/30 rounded p-4 border border-slate-600">
          <p className="text-sm text-slate-400 mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-cyan-400">{balance.toFixed(2)} ADA</p>
          <p className="text-xs text-slate-500 mt-1">≈ ${(balance * 1.12).toFixed(2)} USD</p>
        </div>

        <Button
          onClick={() => disconnect()}
          variant="outline"
          className="w-full border-slate-600 text-slate-400 hover:bg-slate-700 bg-transparent"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </Button>
      </div>
    </Card>
  )
}
