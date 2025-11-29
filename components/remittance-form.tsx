"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowRight, Loader2, AlertCircle, ExternalLink } from "lucide-react"
import { useWallet } from "@meshsdk/react"
import { Transaction } from "@meshsdk/core"

interface Quote {
  sendAmount: number
  receiveAmount: number
  exchangeRate: number
  fee: number
  feePercent: number
  quoteId: string
}

export default function RemittanceForm() {
  const { wallet, connected, name } = useWallet()
  const [sendAmount, setSendAmount] = useState("")
  const [country, setCountry] = useState("")
  const [recipientPhone, setRecipientPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [txHash, setTxHash] = useState("")

  const handleGenerateQuote = async () => {
    if (!sendAmount || !country) return

    setLoading(true)
    setError("")
    setQuote(null)

    try {
      // Simulate API Quote delay
      await new Promise((resolve) => setTimeout(resolve, 600))

      const amount = Number.parseFloat(sendAmount)

      // Mock rates for demo purposes
      const rates: Record<string, number> = {
        philippines: 52.9,
        vietnam: 25565,
        india: 94.23,
        mexico: 17.85,
        kenya: 129.5,
      }

      const rate = rates[country] || 1.0
      const feePercent = 1.0 // 1% fee
      const fee = amount * (feePercent / 100)

      setQuote({
        sendAmount: amount,
        receiveAmount: (amount - fee) * rate,
        exchangeRate: rate,
        fee: fee,
        feePercent: feePercent,
        quoteId: `quote_${Date.now()}`,
      })
    } catch (err) {
      console.error("Quote error:", err)
      setError("Failed to generate quote. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!connected || !wallet) {
      setError("Please connect your wallet first.")
      return
    }

    if (!quote || !recipientPhone) return

    setLoading(true)
    setError("")

    try {
      console.log("[RemitAI] Initializing transaction...")

      // 1. Initialize Transaction
      const tx = new Transaction({ initiator: wallet })

      // 2. Get User's Address (For this demo, we do a self-transfer to prove connectivity)
      // In production, this would be the Masumi Protocol Treasury Address
      const myAddress = await wallet.getChangeAddress()

      // 3. Send Lovelace (1 ADA = 1,000,000 Lovelace)
      const lovelaceAmount = (quote.sendAmount * 1_000_000).toString()
      tx.sendLovelace(myAddress, lovelaceAmount)

      // 4. Build Transaction
      const unsignedTx = await tx.build()

      // 5. Sign Transaction (Triggers Wallet Popup)
      const signedTx = await wallet.signTx(unsignedTx)

      // 6. Submit Transaction
      const hash = await wallet.submitTx(signedTx)

      console.log("[RemitAI] Transaction Submitted:", hash)
      setTxHash(hash)
      setSubmitted(true)

    } catch (err: any) {
      console.error("[RemitAI] Transaction failed:", err)

      // Handle common wallet errors nicely
      if (err.message && err.message.includes("User declined")) {
        setError("Transaction cancelled by user.")
      } else if (err.message && err.message.includes("Not enough funds")) {
        setError("Insufficient funds in wallet.")
      } else {
        setError("Blockchain transaction failed. Please check your network (Preprod/Testnet).")
      }
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30 p-6 text-center">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-green-400 mb-2">Transaction Submitted!</h3>
        <p className="text-slate-300 text-sm mb-4">
          Successfully sent {sendAmount} ADA.
        </p>

        <div className="bg-slate-900/50 p-3 rounded mb-6 text-left">
          <p className="text-xs text-slate-500 mb-1">Blockchain Hash:</p>
          <div className="flex items-center gap-2">
            <code className="text-xs text-cyan-400 break-all font-mono">{txHash}</code>
            <a
              href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <Button
          onClick={() => {
            setSubmitted(false)
            setQuote(null)
            setSendAmount("")
            setRecipientPhone("")
            setTxHash("")
            setCountry("")
          }}
          variant="outline"
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          Send Another
        </Button>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Card className="bg-red-500/10 border-red-500/30 p-3 flex gap-2 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </Card>
      )}

      <div className="space-y-2">
        <Label htmlFor="amount" className="text-white">
          Send Amount (ADA)
        </Label>
        <Input
          id="amount"
          type="number"
          placeholder="0.00"
          value={sendAmount}
          onChange={(e) => setSendAmount(e.target.value)}
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 text-lg"
          step="1"
          min="1" // Testnet minimum
          disabled={loading}
        />
        <p className="text-xs text-slate-400">Min: 1 ADA (Testnet)</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country" className="text-white">
          Receiving Country
        </Label>
        <Select value={country} onValueChange={setCountry} disabled={loading}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600">
            <SelectItem value="philippines">Philippines (PHP)</SelectItem>
            <SelectItem value="vietnam">Vietnam (VND)</SelectItem>
            <SelectItem value="india">India (INR)</SelectItem>
            <SelectItem value="mexico">Mexico (MXN)</SelectItem>
            <SelectItem value="kenya">Kenya (KES)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!quote && (
        <Button
          type="button"
          onClick={handleGenerateQuote}
          disabled={!sendAmount || !country || loading}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Getting Quote...
            </>
          ) : (
            "Get Quote"
          )}
        </Button>
      )}

      {quote && (
        <>
          <Card className="bg-slate-700/50 border-slate-600 p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs text-slate-400 mb-1">You Send</p>
                  <p className="text-lg font-semibold text-cyan-400">{sendAmount} ADA</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500" />
                <div className="flex-1">
                  <p className="text-xs text-slate-400 mb-1">They Receive</p>
                  <p className="text-lg font-semibold text-green-400">
                    {quote.receiveAmount.toFixed(2)} {country === "philippines" ? "PHP" : "currency"}
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-600 pt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-400">Rate</p>
                  <p className="text-cyan-400">{quote.exchangeRate.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Fee</p>
                  <p className="text-orange-400">{quote.feePercent}%</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white">
              Recipient Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+63 9xx xxxx xxx"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={!recipientPhone || loading || !connected}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-6 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing Transaction...
              </>
            ) : (
              connected ? `Send ${sendAmount} ADA` : "Connect Wallet First"
            )}
          </Button>

          <Button
            type="button"
            onClick={() => {
              setQuote(null)
              setSendAmount("")
              setCountry("")
            }}
            variant="outline"
            className="w-full border-slate-600 text-slate-400 hover:bg-slate-700"
            disabled={loading}
          >
            Clear & Start Over
          </Button>
        </>
      )}

      <p className="text-xs text-slate-400 text-center">Powered by Masumi Testnet • Secured on Cardano Blockchain</p>
    </form>
  )
}