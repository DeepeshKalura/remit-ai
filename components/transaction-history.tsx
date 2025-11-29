"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Transaction } from "@/lib/types"
import { TransactionService } from "@/lib/transaction-service"
import { ExternalLink, Loader2, CheckCircle, Clock, AlertCircle } from "lucide-react"

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      const history = await TransactionService.getTransactionHistory()
      setTransactions(history)
      setLoading(false)
    }
    fetchHistory()
  }, [])

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "processing":
        return <Clock className="w-5 h-5 text-yellow-400 animate-spin" />
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-400" />
      default:
        return <Clock className="w-5 h-5 text-slate-400" />
    }
  }

  const getStatusBadge = (status: Transaction["status"]) => {
    const variants: Record<Transaction["status"], string> = {
      completed: "bg-green-500/20 text-green-400 border-green-500/50",
      processing: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      pending: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      failed: "bg-red-500/20 text-red-400 border-red-500/50",
    }
    return variants[status]
  }

  const formatCurrency = (amount: number, code: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700 p-8 text-center">
        <p className="text-slate-400 mb-4">No transactions yet</p>
        <p className="text-sm text-slate-500">Send your first remittance to see it here</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white mb-4">Transaction History</h2>
      {transactions.map((tx) => (
        <Card
          key={tx.id}
          className="bg-slate-800 border-slate-700 p-4 cursor-pointer hover:border-slate-600 transition-colors"
          onClick={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
        >
          <div className="flex items-start gap-4">
            <div className="mt-1">{getStatusIcon(tx.status)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-sm font-semibold text-white">
                  {tx.sendAmount} {tx.sendCurrency}
                </span>
                <span className="text-slate-500">→</span>
                <span className="text-sm font-semibold text-green-400">
                  {tx.receiveAmount.toFixed(2)} {tx.receiveCurrency}
                </span>
                <Badge className={`text-xs ${getStatusBadge(tx.status)}`}>
                  {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-2">
                <div>
                  <p>
                    To: <span className="text-cyan-400 capitalize">{tx.recipientCountry}</span>
                  </p>
                </div>
                <div>
                  <p>
                    {tx.timestamp.toLocaleDateString()}{" "}
                    {tx.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {expandedId === tx.id && (
            <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-400">Exchange Rate</p>
                  <p className="text-cyan-400">1 ADA = {tx.exchangeRate}</p>
                </div>
                <div>
                  <p className="text-slate-400">Fee</p>
                  <p className="text-orange-400">{tx.fee}%</p>
                </div>
              </div>
              {tx.txHash && (
                <div>
                  <p className="text-slate-400 text-xs mb-1">Blockchain Hash</p>
                  <div className="flex items-center gap-2 bg-slate-700/50 p-2 rounded text-xs">
                    <code className="text-cyan-400 truncate">{tx.txHash}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto p-1 h-auto"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigator.clipboard.writeText(tx.txHash || "")
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
