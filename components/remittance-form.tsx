"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowRight, Loader2, AlertCircle, ExternalLink, RefreshCw, CheckCircle2, TrendingUp, Zap, DollarSign, UserPlus, Search, User } from "lucide-react"
import { useWallet } from "@meshsdk/react"
import { Transaction } from "@meshsdk/core"
import { raterClient } from "@/lib/rater-client"
import type { RateResponse } from "@/types/rater"
import PayeeManager from "@/components/payee-manager"

interface ExtendedQuote extends RateResponse {
  sendAmount: number;
  recipientAddress: string;
}

interface Payee {
  id: string
  name: string
  wallet_address: string
  country: string
  currency: string
  tags: string[]
}

export default function RemittanceForm() {
  const { wallet, connected } = useWallet()
  const [sendAmount, setSendAmount] = useState("")
  const [currency, setCurrency] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [recipientPhone, setRecipientPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [quote, setQuote] = useState<ExtendedQuote | null>(null)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [txHash, setTxHash] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // New State for Payees & User
  const [userId, setUserId] = useState<number | null>(null)
  const [payees, setPayees] = useState<Payee[]>([])
  const [filteredPayees, setFilteredPayees] = useState<Payee[]>([])
  const [payeeSearchOpen, setPayeeSearchOpen] = useState(false)
  const [payeeSearchQuery, setPayeeSearchQuery] = useState("")
  const [showPayeeManager, setShowPayeeManager] = useState(false)
  const [supportedCurrencies, setSupportedCurrencies] = useState<string[]>([])
  const searchRef = useRef<HTMLDivElement>(null)

  // Fetch Supported Currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/rater/currencies")
        if (res.ok) {
          const data = await res.json()
          setSupportedCurrencies(data.currencies)
        }
      } catch (e) {
        console.error("Failed to fetch currencies", e)
        // Fallback defaults
        setSupportedCurrencies(["usd", "inr", "php", "vnd", "mxn"])
      }
    }
    fetchCurrencies()
  }, [])

  // Identify User & Fetch Payees when Wallet Connects
  useEffect(() => {
    const identifyUser = async () => {
      if (!connected || !wallet) return

      try {
        const addresses = await wallet.getUsedAddresses()
        const address = addresses[0]

        // Try to find user by wallet
        const res = await fetch(`http://localhost:8000/api/users/wallet/${address}`)
        if (res.ok) {
          const user = await res.json()
          setUserId(user.id)
          fetchPayees(user.id)
        } else {
          console.log("User not found for wallet, maybe new user?")
          // Optionally create a temporary user or handle registration
          // For now, we just won't have payees
        }
      } catch (e) {
        console.error("Error identifying user:", e)
      }
    }

    identifyUser()
  }, [connected, wallet])

  const fetchPayees = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/users/${id}/payees`)
      if (res.ok) {
        const data = await res.json()
        setPayees(data)
        setFilteredPayees(data)
      }
    } catch (e) {
      console.error("Failed to fetch payees", e)
    }
  }

  // Handle Payee Search
  useEffect(() => {
    if (!payeeSearchQuery) {
      setFilteredPayees(payees)
      return
    }
    const lower = payeeSearchQuery.toLowerCase()
    const filtered = payees.filter(p =>
      p.name.toLowerCase().includes(lower) ||
      p.tags.some(t => t.toLowerCase().includes(lower))
    )
    setFilteredPayees(filtered)
  }, [payeeSearchQuery, payees])

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setPayeeSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelectPayee = (payee: Payee) => {
    setRecipientAddress(payee.wallet_address)
    setCurrency(payee.currency.toUpperCase()) // Auto-select currency
    setPayeeSearchQuery(payee.name)
    setPayeeSearchOpen(false)
  }

  // Validate Cardano address (basic validation)
  const isValidCardanoAddress = (address: string): boolean => {
    const pattern = /^(addr|addr_test)1[a-z0-9]{98,106}$/
    return pattern.test(address)
  }

  const handleGenerateQuote = async () => {
    if (!sendAmount || !currency || !recipientAddress) return

    if (!isValidCardanoAddress(recipientAddress)) {
      setError("Invalid Cardano wallet address. Please use a valid testnet address (addr_test1...).")
      return
    }

    setLoading(true)
    setError("")
    setQuote(null)

    try {
      const amount = Number.parseFloat(sendAmount)

      console.log(`[RemitAI] Fetching live rates: ${amount} ADA to ${currency}`)

      const rateData = await raterClient.getRateEstimate(
        amount,
        "ADA",
        currency,
        "USA",
        "India" // Defaulting to India for now as 'Country' is derived from currency often in this simple flow
      )

      console.log("[RemitAI] Received rate data:", rateData)

      const extendedQuote: ExtendedQuote = {
        ...rateData,
        sendAmount: amount,
        recipientAddress: recipientAddress
      }

      setQuote(extendedQuote)

    } catch (err: any) {
      console.error("Quote error:", err)
      setError(err.message || "Failed to generate quote. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshRate = async () => {
    if (!sendAmount || !currency) return
    await handleGenerateQuote()
  }

  const handleConfirmTransaction = () => {
    setShowConfirmDialog(true)
  }

  const handleSubmit = async () => {
    if (!connected || !wallet) {
      setError("Please connect your wallet first.")
      return
    }

    if (!quote || !recipientAddress) return

    setLoading(true)
    setError("")
    setShowConfirmDialog(false)

    try {
      console.log("[RemitAI] Initializing transaction...")
      const tx = new Transaction({ initiator: wallet })

      if (!isValidCardanoAddress(recipientAddress)) {
        throw new Error("Invalid recipient address")
      }

      const lovelaceAmount = (quote.sendAmount * 1_000_000).toString()
      tx.sendLovelace(recipientAddress, lovelaceAmount)

      const unsignedTx = await tx.build()
      const signedTx = await wallet.signTx(unsignedTx)
      const hash = await wallet.submitTx(signedTx)

      console.log("[RemitAI] Transaction Submitted:", hash)
      setTxHash(hash)
      setSubmitted(true)

    } catch (err: any) {
      console.error("[RemitAI] Transaction failed:", err)
      if (err.message && err.message.includes("User declined")) {
        setError("Transaction cancelled by user.")
      } else if (err.message && err.message.includes("Not enough funds")) {
        setError("Insufficient funds in wallet.")
      } else if (err.message && err.message.includes("Invalid")) {
        setError("Invalid recipient address.")
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
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-green-400 mb-2">Transaction Submitted!</h3>
        <p className="text-slate-300 text-sm mb-1">
          Successfully sent <span className="font-bold text-cyan-400">{sendAmount} ADA</span>
        </p>
        <p className="text-slate-400 text-xs mb-4">
          to {recipientAddress.slice(0, 20)}...{recipientAddress.slice(-10)}
        </p>

        {quote && (
          <div className="bg-slate-900/50 p-3 rounded mb-4 text-left">
            <p className="text-xs text-slate-500 mb-2">Recipient receives approximately:</p>
            <p className="text-2xl font-bold text-green-400">
              {quote.best_transaction.amount.toFixed(2)} {currency}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Rate: 1 ADA = {quote.route_rating.average_rate.toFixed(2)} {currency}
            </p>
          </div>
        )}

        <div className="bg-slate-900/50 p-3 rounded mb-6 text-left">
          <p className="text-xs text-slate-500 mb-1">Blockchain Hash:</p>
          <div className="flex items-center gap-2">
            <code className="text-xs text-cyan-400 break-all font-mono flex-1">{txHash}</code>
            <a
              href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white flex-shrink-0"
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
            setRecipientAddress("")
            setTxHash("")
            setCurrency("")
            setPayeeSearchQuery("")
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
    <>
      <form onSubmit={(e) => { e.preventDefault(); handleConfirmTransaction(); }} className="space-y-4">
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
            min="1"
            disabled={loading}
          />
          <p className="text-xs text-slate-400">Min: 1 ADA (Testnet)</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency" className="text-white">
            Receiving Currency
          </Label>
          <Select value={currency} onValueChange={setCurrency} disabled={loading}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600 max-h-[200px]">
              {supportedCurrencies.map((curr) => (
                <SelectItem key={curr} value={curr.toUpperCase()}>
                  {curr.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payee Search / Selection */}
        <div className="space-y-2 relative" ref={searchRef}>
          <Label htmlFor="payee" className="text-white flex items-center justify-between">
            <span>Recipient</span>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-cyan-400 text-xs"
              onClick={() => setShowPayeeManager(true)}
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Manage Payees
            </Button>
          </Label>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="payee"
              type="text"
              placeholder="Search payee or enter wallet address..."
              value={payeeSearchQuery || recipientAddress}
              onChange={(e) => {
                setPayeeSearchQuery(e.target.value)
                setRecipientAddress(e.target.value) // Allow direct entry
                setPayeeSearchOpen(true)
              }}
              onFocus={() => setPayeeSearchOpen(true)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 pl-9"
              disabled={loading}
              autoComplete="off"
            />
          </div>

          {/* Dropdown Results */}
          {payeeSearchOpen && userId && (
            <div className="absolute z-10 w-full bg-slate-800 border border-slate-700 rounded-md shadow-xl mt-1 max-h-[200px] overflow-y-auto">
              {filteredPayees.length > 0 ? (
                filteredPayees.map((payee) => (
                  <button
                    key={payee.id}
                    type="button"
                    onClick={() => handleSelectPayee(payee)}
                    className="w-full text-left px-4 py-2 hover:bg-slate-700 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-sm text-white font-medium">{payee.name}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[200px]">{payee.wallet_address}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-[10px] border-slate-600 text-slate-400">
                        {payee.currency}
                      </Badge>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className="text-sm text-slate-400 mb-2">No payees found</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full border-dashed border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={() => {
                      setPayeeSearchOpen(false)
                      setShowPayeeManager(true)
                    }}
                  >
                    <UserPlus className="w-3 h-3 mr-2" />
                    Create New Payee
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white flex items-center gap-2">
            Recipient Phone
            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
              Optional
            </Badge>
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

        {!quote && (
          <Button
            type="button"
            onClick={handleGenerateQuote}
            disabled={!sendAmount || !currency || !recipientAddress || loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Getting Live Rates...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Get Live Quote
              </>
            )}
          </Button>
        )}

        {quote && (
          <>
            {/* Live Rate Display */}
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-300">Live Exchange Rate</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshRate}
                  disabled={loading}
                  className="h-7 text-xs text-cyan-400 hover:text-cyan-300"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              <div className="space-y-4">
                {/* Main Exchange Display */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-900/50 p-3 rounded">
                    <p className="text-xs text-slate-400 mb-1">You Send</p>
                    <p className="text-xl font-bold text-cyan-400">{sendAmount} ADA</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <div className="flex-1 bg-slate-900/50 p-3 rounded">
                    <p className="text-xs text-slate-400 mb-1">They Receive</p>
                    <p className="text-xl font-bold text-green-400">
                      ≈ {quote.best_transaction.amount.toFixed(2)} {currency}
                    </p>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                {/* Rate Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-900/30 p-2 rounded">
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingUp className="w-3 h-3 text-cyan-400" />
                      <p className="text-xs text-slate-400">Exchange Rate</p>
                    </div>
                    <p className="text-cyan-400 font-semibold">
                      1 ADA = {quote.route_rating.average_rate.toFixed(2)} {currency}
                    </p>
                  </div>
                  <div className="bg-slate-900/30 p-2 rounded">
                    <div className="flex items-center gap-1 mb-1">
                      <DollarSign className="w-3 h-3 text-orange-400" />
                      <p className="text-xs text-slate-400">Total Fee</p>
                    </div>
                    <p className="text-orange-400 font-semibold">
                      {quote.best_transaction.fee_percentage.toFixed(2)}%
                    </p>
                  </div>
                  <div className="bg-slate-900/30 p-2 rounded">
                    <div className="flex items-center gap-1 mb-1">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      <p className="text-xs text-slate-400">Est. Time</p>
                    </div>
                    <p className="text-yellow-400 font-semibold">
                      {quote.best_transaction.estimated_time_hours} hrs
                    </p>
                  </div>
                  <div className="bg-slate-900/30 p-2 rounded">
                    <div className="flex items-center gap-1 mb-1">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      <p className="text-xs text-slate-400">Quality Score</p>
                    </div>
                    <p className="text-green-400 font-semibold">
                      {(quote.best_transaction.rate_quality_score * 10).toFixed(1)}/10
                    </p>
                  </div>
                </div>

                {/* Provider Info */}
                {quote.recommended_providers.length > 0 && (
                  <>
                    <Separator className="bg-slate-700" />
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Recommended Provider</p>
                      <div className="flex items-center justify-between bg-slate-900/30 p-2 rounded">
                        <span className="text-sm font-medium text-white">
                          {quote.best_transaction.provider}
                        </span>
                        <Badge variant="outline" className="border-green-500/30 text-green-400">
                          {(quote.recommended_providers[0].overall_rating * 10).toFixed(1)}/10
                        </Badge>
                      </div>
                    </div>
                  </>
                )}

                {/* Risk Level */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Risk Level:</span>
                  <Badge
                    variant="outline"
                    className={
                      quote.best_transaction.risk_level === "low"
                        ? "border-green-500/30 text-green-400"
                        : quote.best_transaction.risk_level === "medium"
                          ? "border-yellow-500/30 text-yellow-400"
                          : "border-red-500/30 text-red-400"
                    }
                  >
                    {quote.best_transaction.risk_level.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </Card>

            <Button
              type="submit"
              disabled={loading || !connected}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-6 text-base"
            >
              {connected ? (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Send {sendAmount} ADA
                </>
              ) : (
                "Connect Wallet First"
              )}
            </Button>

            <Button
              type="button"
              onClick={() => {
                setQuote(null)
                setSendAmount("")
                setCurrency("")
                setRecipientAddress("")
                setRecipientPhone("")
                setPayeeSearchQuery("")
              }}
              variant="outline"
              className="w-full border-slate-600 text-slate-400 hover:bg-slate-700"
              disabled={loading}
            >
              Clear & Start Over
            </Button>
          </>
        )}

        <p className="text-xs text-slate-400 text-center">
          Powered by Minswap DEX • Secured on Cardano Blockchain
        </p>
      </form>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Confirm Transaction</DialogTitle>
            <DialogDescription className="text-slate-400">
              Please review the transaction details before signing
            </DialogDescription>
          </DialogHeader>

          {quote && (
            <div className="space-y-3 py-4">
              <div className="bg-slate-800/50 p-3 rounded space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Send Amount:</span>
                  <span className="font-semibold text-cyan-400">{sendAmount} ADA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Recipient Receives:</span>
                  <span className="font-semibold text-green-400">
                    ≈ {quote.best_transaction.amount.toFixed(2)} {currency}
                  </span>
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Exchange Rate:</span>
                  <span className="text-white">
                    1 ADA = {quote.route_rating.average_rate.toFixed(2)} {currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Fee:</span>
                  <span className="text-orange-400">{quote.best_transaction.fee_percentage.toFixed(2)}%</span>
                </div>
              </div>

              <div className="bg-slate-800/50 p-3 rounded">
                <p className="text-xs text-slate-400 mb-1">Recipient Address:</p>
                <code className="text-xs text-cyan-400 break-all font-mono">
                  {recipientAddress}
                </code>
              </div>

              {recipientPhone && (
                <div className="bg-slate-800/50 p-3 rounded">
                  <p className="text-xs text-slate-400 mb-1">Recipient Phone:</p>
                  <p className="text-sm text-white">{recipientPhone}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm & Sign
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payee Manager Dialog */}
      <Dialog open={showPayeeManager} onOpenChange={(open) => {
        setShowPayeeManager(open)
        if (!open && userId) {
          fetchPayees(userId) // Refresh payees when dialog closes
        }
      }}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl w-[95vw] h-[90vh] overflow-y-auto p-0">
          <div className="p-6">
            <PayeeManager userId={userId || 99} apiBaseUrl="http://localhost:8000" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}