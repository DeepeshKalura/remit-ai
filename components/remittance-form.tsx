// components/remittance-form.tsx

"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { raterClient } from "@/lib/rater-client"
import type { RateResponse } from "@/types/rater"
import { Transaction } from "@meshsdk/core"
import { useWallet } from "@meshsdk/react"
import { AlertCircle, ArrowRight, CheckCircle2, ExternalLink, Loader2, RefreshCw, Search, TrendingUp, Zap } from "lucide-react"
import type React from "react"
import { useEffect, useRef, useState } from "react"

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
  const [loading, setLoading] = useState(false)
  const [quote, setQuote] = useState<ExtendedQuote | null>(null)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [txHash, setTxHash] = useState("")

  const [selectedPayee, setSelectedPayee] = useState<Payee | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [payees, setPayees] = useState<Payee[]>([])
  const [filteredPayees, setFilteredPayees] = useState<Payee[]>([])
  const [payeeSearchOpen, setPayeeSearchOpen] = useState(false)
  const [payeeSearchQuery, setPayeeSearchQuery] = useState("")
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
        const address = (await wallet.getUsedAddresses())[0]
        const res = await fetch(`http://localhost:8000/api/users/wallet/${address}`)
        if (res.ok) {
          const user = await res.json()
          setUserId(user.id)
          fetchPayees(user.id)
        }
      } catch (e) { console.error("Error identifying user:", e) }
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
    } catch (e) { console.error("Failed to fetch payees", e) }
  }

  // --- DEBOUNCING LOGIC ---
  useEffect(() => {
    // If there's no query, just show the full list of payees.
    if (!payeeSearchQuery) {
        setFilteredPayees(payees);
        return;
    }

    // Set a timer to execute the search after 300ms.
    const debounceTimer = setTimeout(async () => {
        if (!userId) return;

        try {
            // Call the search endpoint on the backend.
            const res = await fetch(`http://localhost:8000/api/users/${userId}/payees/search?q=${encodeURIComponent(payeeSearchQuery)}`);
            if (res.ok) {
                const data = await res.json();
                setFilteredPayees(data);
            }
        } catch (e) {
            console.error("Search failed:", e);
        }
    }, 300); // Wait for 300ms after user stops typing.

    // Cleanup: Clear the timer if the user types again before it fires.
    return () => clearTimeout(debounceTimer);
  }, [payeeSearchQuery, payees, userId]);


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
    setSelectedPayee(payee)
    setRecipientAddress(payee.wallet_address)
    setCurrency(payee.currency.toUpperCase())
    setPayeeSearchQuery(payee.name)
    setPayeeSearchOpen(false)
  }

  const isValidCardanoAddress = (address: string): boolean => {
    return /^(addr|addr_test)1[a-z0-9]{98,106}$/.test(address)
  }

  const handlePayeeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPayeeSearchQuery(value)
    setPayeeSearchOpen(true)
    if (selectedPayee) setSelectedPayee(null)
    setRecipientAddress(isValidCardanoAddress(value) ? value : "")
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
      const rateData = await raterClient.getRateEstimate(amount, "ADA", currency, "USA", "India")
      setQuote({ ...rateData, sendAmount: amount, recipientAddress: recipientAddress })
    } catch (err: any) {
      setError(err.message || "Failed to generate quote. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshRate = async () => {
    if (!sendAmount || !currency) return
    await handleGenerateQuote()
  }

  const handleSubmit = async () => {
    if (!connected || !wallet || !quote || !recipientAddress) {
      setError("Please connect your wallet and generate a quote first.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const lovelaceAmount = (quote.sendAmount * 1_000_000).toString()
      const tx = await new Transaction({ initiator: wallet })
        .sendLovelace(recipientAddress, lovelaceAmount)
        .build()
      const signedTx = await wallet.signTx(tx)
      const hash = await wallet.submitTx(signedTx)
      setTxHash(hash)
      setSubmitted(true)
    } catch (err: any) {
      if (err.message?.includes("User declined")) setError("Transaction cancelled by user.")
      else if (err.message?.includes("Not enough funds")) setError("Insufficient funds in wallet.")
      else setError("Blockchain transaction failed. Please check your network.")
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
        <div className="bg-slate-900/50 p-3 rounded mb-6 text-left">
          <p className="text-xs text-slate-500 mb-1">Blockchain Hash:</p>
          <div className="flex items-center gap-2">
            <code className="text-xs text-cyan-400 break-all font-mono flex-1">{txHash}</code>
            <a href={`https://preprod.cardanoscan.io/transaction/${txHash}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white flex-shrink-0">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
        <Button onClick={() => { setSubmitted(false); setQuote(null); setSendAmount(""); setRecipientAddress(""); setTxHash(""); setCurrency(""); setPayeeSearchQuery(""); }} variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
          Send Another
        </Button>
      </Card>
    )
  }

  return (
    <>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
        {error && (
          <Card className="bg-red-500/10 border-red-500/30 p-3 flex gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </Card>
        )}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-white">Send Amount (ADA)</Label>
          <Input id="amount" type="number" placeholder="0.00" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 text-lg" step="1" min="1" disabled={loading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency" className="text-white">Receiving Currency</Label>
          <Select value={currency} onValueChange={setCurrency} disabled={loading}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue placeholder="Select currency" /></SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600 max-h-[200px]">
              {supportedCurrencies.map((curr) => (<SelectItem key={curr} value={curr.toUpperCase()}>{curr.toUpperCase()}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 relative" ref={searchRef}>
          <Label htmlFor="payee" className="text-white">Recipient</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input id="payee" type="text" placeholder="Search payee or enter wallet address..." value={payeeSearchQuery} onChange={handlePayeeInputChange} onFocus={() => setPayeeSearchOpen(true)} className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 pl-9" disabled={loading} autoComplete="off" />
          </div>
          {payeeSearchOpen && userId && (
            <div className="absolute z-10 w-full bg-slate-800 border border-slate-700 rounded-md shadow-xl mt-1 max-h-[200px] overflow-y-auto">
              {filteredPayees.length > 0 ? (
                filteredPayees.map((payee) => (
                  <button key={payee.id} type="button" onClick={() => handleSelectPayee(payee)} className="w-full text-left px-4 py-2 hover:bg-slate-700 transition-colors flex items-center justify-between group">
                    <div>
                      <p className="text-sm text-white font-medium">{payee.name}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[200px]">{payee.wallet_address}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-slate-600 text-slate-400">{payee.currency}</Badge>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className="text-sm text-slate-400">No saved payees found.</p>
                  <p className="text-xs text-slate-500 mt-1">Enter a wallet address manually.</p>
                </div>
              )}
            </div>
          )}
        </div>
        {!quote && (
          <Button type="button" onClick={handleGenerateQuote} disabled={!sendAmount || !currency || !recipientAddress || loading} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Getting Live Rates...</> : <><TrendingUp className="w-4 h-4 mr-2" />Get Live Quote</>}
          </Button>
        )}
        {quote && (
          <>
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-300">Live Exchange Rate</h3>
                <Button type="button" variant="ghost" size="sm" onClick={handleRefreshRate} disabled={loading} className="h-7 text-xs text-cyan-400 hover:text-cyan-300"><RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />Refresh</Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-900/50 p-3 rounded">
                    <p className="text-xs text-slate-400 mb-1">You Send</p>
                    <p className="text-xl font-bold text-cyan-400">{sendAmount} ADA</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <div className="flex-1 bg-slate-900/50 p-3 rounded">
                    <p className="text-xs text-slate-400 mb-1">They Receive</p>
                    <p className="text-xl font-bold text-green-400">≈ {quote.best_transaction.amount.toFixed(2)} {currency}</p>
                  </div>
                </div>
              </div>
            </Card>
            <Button type="submit" disabled={loading || !connected} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-6 text-base">
              {connected ? <><Zap className="w-4 h-4 mr-2" />Send {sendAmount} ADA</> : "Connect Wallet First"}
            </Button>
            <Button type="button" onClick={() => { setQuote(null); setSendAmount(""); setCurrency(""); setRecipientAddress(""); setPayeeSearchQuery(""); }} variant="outline" className="w-full border-slate-600 text-slate-400 hover:bg-slate-700" disabled={loading}>
              Clear & Start Over
            </Button>
          </>
        )}
      </form>
    </>
  )
}