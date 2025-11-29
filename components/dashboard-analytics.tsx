"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Globe, Zap, Users } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const volumeData = [
  { date: "Mon", volume: 24000, transactions: 4 },
  { date: "Tue", volume: 32000, transactions: 5 },
  { date: "Wed", volume: 28000, transactions: 3 },
  { date: "Thu", volume: 41000, transactions: 6 },
  { date: "Fri", volume: 45000, transactions: 7 },
  { date: "Sat", volume: 38000, transactions: 4 },
  { date: "Sun", volume: 52000, transactions: 8 },
]

const countryData = [
  { country: "Philippines", amount: 45000, percentage: 35 },
  { country: "India", amount: 32000, percentage: 25 },
  { country: "Vietnam", amount: 28000, percentage: 22 },
  { country: "Mexico", amount: 18000, percentage: 14 },
  { country: "Kenya", amount: 6000, percentage: 4 },
]

export default function DashboardAnalytics() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-slate-400 mb-1">Total Sent (7 days)</p>
              <p className="text-2xl font-bold text-cyan-400">$1,234.50</p>
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-xs text-slate-500">+12% from last week</p>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-slate-400 mb-1">Transactions</p>
              <p className="text-2xl font-bold text-green-400">37</p>
            </div>
            <Zap className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-xs text-slate-500">Average: 5.3 per day</p>
        </Card>
      </div>

      {/* Volume Chart */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Weekly Volume</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={volumeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: "12px" }} />
            <YAxis stroke="#9CA3AF" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1E293B",
                border: "1px solid #475569",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#E2E8F0" }}
            />
            <Line
              type="monotone"
              dataKey="volume"
              stroke="#06B6D4"
              strokeWidth={2}
              dot={{ fill: "#06B6D4", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Destinations */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          Top Destinations
        </h3>
        <div className="space-y-3">
          {countryData.map((item, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-300">{item.country}</span>
                <Badge className="bg-cyan-500/20 text-cyan-400">${item.amount}</Badge>
              </div>
              <div className="w-full bg-slate-700 rounded h-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Stats Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-slate-700/30 border-slate-600 p-4 flex items-center gap-3">
          <Users className="w-5 h-5 text-cyan-400" />
          <div>
            <p className="text-xs text-slate-400">Users Helped</p>
            <p className="text-lg font-bold text-white">1,234</p>
          </div>
        </Card>
        <Card className="bg-slate-700/30 border-slate-600 p-4">
          <div>
            <p className="text-xs text-slate-400">Avg Processing Time</p>
            <p className="text-lg font-bold text-white">1m 45s</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
