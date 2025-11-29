"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, Loader2 } from "lucide-react"
import { useWallet } from "@meshsdk/react"
import { BrowserWallet } from "@meshsdk/core"

interface WalletItem {
  name: string
  icon: string
  version: string
}

export default function WalletConnector() {
  const { connect, connecting } = useWallet()
  const [availableWallets, setAvailableWallets] = useState<WalletItem[]>([])
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    // Dynamically fetch wallets installed in the user's browser
    const wallets = BrowserWallet.getInstalledWallets()
    setAvailableWallets(wallets)
  }, [])

  const handleConnect = async (walletName: string) => {
    try {
      await connect(walletName)
      setShowDialog(false)
    } catch (err) {
      console.error("Failed to connect wallet:", err)
    }
  }

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
      >
        Select Wallet
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Choose a Wallet</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {availableWallets.length === 0 && (
              <div className="text-center p-4 text-slate-400 bg-slate-700/30 rounded">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No wallets detected.</p>
                <p className="text-xs mt-1">Please install Nami, Eternl, or Flint.</p>
              </div>
            )}

            {availableWallets.map((wallet) => (
              <Button
                key={wallet.name}
                onClick={() => handleConnect(wallet.name)}
                disabled={connecting}
                variant="outline"
                className="w-full h-auto justify-start py-3 px-4 border-slate-600 text-white hover:bg-slate-700"
              >
                {connecting ? (
                  <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                ) : (
                  <img src={wallet.icon} alt={wallet.name} className="w-5 h-5 mr-3" />
                )}
                <div className="text-left">
                  <p className="font-medium text-sm capitalize">{wallet.name}</p>
                  <p className="text-xs text-slate-400">Detected in browser</p>
                </div>
              </Button>
            ))}
          </div>

          <p className="text-xs text-slate-500 text-center mt-4">
            RemitAI uses CIP-30 standard via Mesh SDK
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}