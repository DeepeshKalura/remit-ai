"use client"


import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { raterClient } from "@/lib/rater-client"
import type { RateResponse } from "@/types/rater"
import { Transaction } from "@meshsdk/core"
import { useWallet } from "@meshsdk/react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink, 
  Loader2, 
  RefreshCw, 
  Search, 
  TrendingUp, 
  Zap,
  Wallet,
  Globe,
  User,
  Coins,
  ArrowDownUp,
  Sparkles
} from "lucide-react"
import type React from "react"
import { useEffect, useRef, useState } from "react"

interface ExtendedQuote extends RateResponse {
  sendAmount: number
  recipientAddress: string
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

  // Debouncing Logic
  useEffect(() => {
    if (!payeeSearchQuery) {
      setFilteredPayees(payees)
      return
    }

    const debounceTimer = setTimeout(async () => {
      if (!userId) return

      try {
        const res = await fetch(
          `http://localhost:8000/api/users/${userId}/payees/search?q=${encodeURIComponent(payeeSearchQuery)}`
        )
        if (res.ok) {
          const data = await res.json()
          setFilteredPayees(data)
        }
      } catch (e) {
        console.error("Search failed:", e)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [payeeSearchQuery, payees, userId])

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

  const resetForm = () => {
    setSubmitted(false)
    setQuote(null)
    setSendAmount("")
    setRecipientAddress("")
    setTxHash("")
    setCurrency("")
    setPayeeSearchQuery("")
    setSelectedPayee(null)
    setError("")
  }

  // Success State
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-chart-2/30 bg-card overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-chart-2 to-chart-4" />
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-chart-2/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-chart-2" />
            </motion.div>

            <h3 className="text-2xl font-bold text-card-foreground mb-2">
              Transaction Successful!
            </h3>
            <p className="text-muted-foreground mb-6">
              Your transfer has been submitted to the blockchain
            </p>

            <div className="bg-secondary rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Amount Sent</span>
                <span className="text-lg font-bold text-chart-1">{sendAmount} ADA</span>
              </div>
              <Separator className="my-3" />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Transaction Hash</p>
                <div className="flex items-center gap-2 bg-background rounded-lg p-3">
                  <code className="text-xs text-chart-1 break-all font-mono flex-1">
                    {txHash}
                  </code>
                  <a
                    href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            <Button
              onClick={resetForm}
              variant="outline"
              className="w-full border-border text-foreground hover:bg-accent"
            >
              <ArrowDownUp className="w-4 h-4 mr-2" />
              Send Another Transfer
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-border bg-card overflow-hidden shadow-lg">
        {/* Header Gradient Bar */}
        <div className="h-1 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-4" />

        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Coins className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl text-card-foreground">Send Money</CardTitle>
              <CardDescription className="text-muted-foreground">
                Fast & secure transfers powered by Cardano
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-destructive/10 border-destructive/30 p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Error</p>
                      <p className="text-sm text-destructive/80">{error}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
            className="space-y-6"
          >
            {/* Amount Input Section */}
            <div className="space-y-3">
              <Label htmlFor="amount" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                Send Amount
              </Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground text-2xl font-bold h-14 pr-16"
                  step="1"
                  min="1"
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-0 font-bold">
                    ADA
                  </Badge>
                </div>
              </div>
            </div>

            {/* Currency Selection */}
            <div className="space-y-3">
              <Label htmlFor="currency" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                Receiving Currency
              </Label>
              <Select value={currency} onValueChange={setCurrency} disabled={loading}>
                <SelectTrigger className="bg-secondary border-border text-foreground h-12">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {supportedCurrencies.map((curr) => (
                    <SelectItem
                      key={curr}
                      value={curr.toUpperCase()}
                      className="text-popover-foreground hover:bg-accent focus:bg-accent"
                    >
                      <span className="font-medium">{curr.toUpperCase()}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Recipient Search */}
            <div className="space-y-3 relative" ref={searchRef}>
              <Label htmlFor="payee" className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Recipient
              </Label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="payee"
                  type="text"
                  placeholder="Search payee or enter wallet address..."
                  value={payeeSearchQuery}
                  onChange={handlePayeeInputChange}
                  onFocus={() => setPayeeSearchOpen(true)}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground pl-11 h-12"
                  disabled={loading}
                  autoComplete="off"
                />
                {selectedPayee && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                )}
              </div>

              {/* Payee Dropdown */}
              <AnimatePresence>
                {payeeSearchOpen && userId && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-20 w-full bg-popover border border-border rounded-lg shadow-xl mt-1 overflow-hidden"
                  >
                    <div className="max-h-[240px] overflow-y-auto">
                      {filteredPayees.length > 0 ? (
                        <div className="p-2 space-y-1">
                          {filteredPayees.map((payee) => (
                            <button
                              key={payee.id}
                              type="button"
                              onClick={() => handleSelectPayee(payee)}
                              className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                  <User className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-popover-foreground">
                                    {payee.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                                    {payee.wallet_address}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-xs border-border text-muted-foreground group-hover:border-primary group-hover:text-primary transition-colors"
                              >
                                {payee.currency}
                              </Badge>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                            <Search className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">No saved payees found</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            Enter a wallet address manually
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Get Quote Button */}
            {!quote && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  type="button"
                  onClick={handleGenerateQuote}
                  disabled={!sendAmount || !currency || !recipientAddress || loading}
                  className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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
              </motion.div>
            )}

            {/* Quote Display */}
            <AnimatePresence>
              {quote && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <Card className="bg-secondary/50 border-border overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-chart-1 to-chart-2" />
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-chart-1" />
                          <h3 className="text-sm font-semibold text-card-foreground">
                            Live Exchange Rate
                          </h3>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRefreshRate}
                          disabled={loading}
                          className="h-8 text-xs text-chart-1 hover:text-chart-1 hover:bg-chart-1/10"
                        >
                          <RefreshCw className={`w-3 h-3 mr-1.5 ${loading ? "animate-spin" : ""}`} />
                          Refresh
                        </Button>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-background rounded-xl p-4 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">You Send</p>
                          <p className="text-2xl font-bold text-chart-1">{sendAmount}</p>
                          <p className="text-sm text-muted-foreground">ADA</p>
                        </div>

                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <ArrowRight className="w-5 h-5 text-primary" />
                          </div>
                        </div>

                        <div className="flex-1 bg-background rounded-xl p-4 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">They Receive</p>
                          <p className="text-2xl font-bold text-chart-2">
                            ≈ {quote.best_transaction.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">{currency}</p>
                        </div>
                      </div>

                      {/* Rate Info */}
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Exchange Rate</span>
                          <span className="font-medium text-card-foreground">
                            1 ADA = {(quote.best_transaction.amount / Number(sendAmount)).toFixed(4)} {currency}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading || !connected}
                    className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : connected ? (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Send {sendAmount} ADA
                      </>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5 mr-2" />
                        Connect Wallet First
                      </>
                    )}
                  </Button>

                  {/* Clear Button */}
                  <Button
                    type="button"
                    onClick={resetForm}
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground hover:bg-accent"
                    disabled={loading}
                  >
                    Clear & Start Over
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Footer Info */}
          {!quote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-4 border-t border-border"
            >
              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-chart-1" />
                  <span>Instant transfers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-chart-2" />
                  <span>Best rates</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-chart-4" />
                  <span>Secure</span>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}