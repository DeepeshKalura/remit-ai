"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface Rate {
  pair: string
  dex: string
  rate: number
  change: number
  volume: string
  liquidity: string
}

const mockRates: Rate[] = [
  {
    pair: "ADA/USDC",
    dex: "Minswap",
    rate: 1.1245,
    change: 2.5,
    volume: "$2.4M",
    liquidity: "$12.5M",
  },
  {
    pair: "ADA/USDC",
    dex: "SundaeSwap",
    rate: 1.1238,
    change: 2.3,
    volume: "$1.8M",
    liquidity: "$8.2M",
  },
  {
    pair: "ADA/JPY",
    dex: "Minswap",
    rate: 185.42,
    change: 1.8,
    volume: "$856K",
    liquidity: "$4.1M",
  },
  {
    pair: "ADA/INR",
    dex: "SundaeSwap",
    rate: 94.23,
    change: -0.5,
    volume: "$623K",
    liquidity: "$2.8M",
  },
]

export default function DexRates() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Live DEX Rates</h2>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Real-time</Badge>
      </div>

      {mockRates.map((rate, idx) => (
        <Card
          key={idx}
          className="bg-slate-800 border-slate-700 p-4 hover:border-slate-600 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-white text-sm">{rate.pair}</h3>
                <Badge className="bg-slate-700 text-slate-300">{rate.dex}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div>
                  <p>
                    Volume: <span className="text-cyan-400">{rate.volume}</span>
                  </p>
                </div>
                <div>
                  <p>
                    Liquidity: <span className="text-green-400">{rate.liquidity}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-cyan-400">{rate.rate.toFixed(4)}</p>
              <div className={`flex items-center gap-1 mt-1 ${rate.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                {rate.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-xs">{Math.abs(rate.change)}%</span>
              </div>
            </div>
          </div>
        </Card>
      ))}

      <div className="text-xs text-slate-400 text-center pt-4">
        Rates updated every 30 seconds • Last update: just now
      </div>
    </div>
  )
}
