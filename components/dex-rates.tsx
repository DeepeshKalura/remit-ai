"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Zap, Loader2, AlertCircle, RefreshCw, Trophy } from "lucide-react"

interface ProviderRating {
  provider_name: string
  overall_rating: number
  speed_score: number
  cost_score: number
  reliability_score: number
  reviews_count: number
  average_time_hours: number
}

interface RouteRating {
  from_currency: string
  to_currency: string
  best_provider: string
  best_rate: number
  estimated_time: string
  total_fees: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

export default function DexRates() {
  const [providers, setProviders] = useState<ProviderRating[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchProviders = async () => {
    try {
      setLoading(true)
      setError(null)
      const endpoint = API_BASE_URL ? `${API_BASE_URL}/api/rater/providers` : `/api/rater/providers`
      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error(`Failed to fetch providers: ${response.statusText}`)
      }
      const data = await response.json()
      setProviders(data)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load providers")
      console.error("Error fetching providers:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProviders()
    const interval = setInterval(fetchProviders, 30000)
    return () => clearInterval(interval)
  }, [])

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-emerald-400"
    if (rating >= 6) return "text-amber-400"
    if (rating >= 4) return "text-orange-400"
    return "text-red-400"
  }

  const getRatingBg = (rating: number) => {
    if (rating >= 8) return "bg-emerald-500/10"
    if (rating >= 6) return "bg-amber-500/10"
    if (rating >= 4) return "bg-orange-500/10"
    return "bg-red-500/10"
  }

  const getStars = (rating: number) => {
    const fullStars = Math.floor(rating / 2)
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={`w-1.5 h-1.5 rounded-full transition-all ${
          i < fullStars ? "bg-cyan-400 shadow-lg shadow-cyan-400/50" : "bg-slate-700"
        }`}
      />
    ))
  }

  const formatTime = (date: Date) => {
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  const topProvider = providers
    .filter((p) => p.overall_rating > 0)
    .sort((a, b) => b.overall_rating - a.overall_rating)[0]

  if (loading && providers.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-spin opacity-20" />
            <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            </div>
          </div>
          <p className="text-slate-300 font-medium">Loading provider data...</p>
          <p className="text-slate-500 text-sm">Fetching real-time ratings</p>
        </div>
      </div>
    )
  }

  if (error && providers.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <p className="text-red-400 font-semibold text-lg">Failed to load rates</p>
            <p className="text-slate-400 text-sm mt-2">{error}</p>
          </div>
          <button
            onClick={fetchProviders}
            className="mt-4 px-6 py-2.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 rounded-lg transition-all border border-cyan-500/30 hover:border-cyan-500/50 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const sortedProviders = providers
    .filter((p) => p.overall_rating > 0)
    .sort((a, b) => b.overall_rating - a.overall_rating)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-500/30">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                  DEX Providers
                </h2>
                <p className="text-sm text-slate-400">Real-time performance metrics</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              Live
            </Badge>
            <button
              onClick={fetchProviders}
              disabled={loading}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Top Provider Highlight */}
        {topProvider && (
          <div className="group relative overflow-hidden bg-gradient-to-br from-cyan-950/30 to-blue-950/30 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4 hover:border-cyan-500/50 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Top Performer</p>
                  <p className="text-lg font-bold text-white">{topProvider.provider_name}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-cyan-400">{topProvider.overall_rating.toFixed(1)}</div>
                <p className="text-xs text-slate-400">Rating</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Providers Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {sortedProviders.map((provider, idx) => (
          <Card
            key={idx}
            className="group relative overflow-hidden bg-gradient-to-br from-slate-800/40 to-slate-900/60 backdrop-blur-lg border-slate-700/50 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5"
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative p-5 space-y-4">
              {/* Provider Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">{provider.provider_name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex gap-1">{getStars(provider.overall_rating)}</div>
                      <span className="text-xs text-slate-400 ml-1">
                        {provider.reviews_count.toLocaleString()} reviews
                      </span>
                    </div>
                  </div>
                  <div className={`flex-shrink-0 px-3 py-1.5 rounded-lg ${getRatingBg(provider.overall_rating)}`}>
                    <div className={`text-2xl font-bold ${getRatingColor(provider.overall_rating)}`}>
                      {provider.overall_rating.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: "Speed",
                    value: provider.speed_score,
                    icon: TrendingUp,
                    color: "cyan",
                  },
                  {
                    label: "Cost",
                    value: provider.cost_score,
                    icon: Zap,
                    color: "amber",
                  },
                  {
                    label: "Reliability",
                    value: provider.reliability_score,
                    icon: TrendingDown,
                    color: "emerald",
                  },
                ].map((metric) => {
                  const Icon = metric.icon
                  return (
                    <div
                      key={metric.label}
                      className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 hover:border-slate-600/50 transition-colors group/metric"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-3.5 h-3.5 text-${metric.color}-400`} />
                        <span className="text-xs text-slate-500 group-hover/metric:text-slate-400 transition-colors">
                          {metric.label}
                        </span>
                      </div>
                      <div className={`text-lg font-bold ${getRatingColor(metric.value)}`}>
                        {metric.value.toFixed(1)}
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-400 transition-all`}
                          style={{ width: `${(metric.value / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Average Time Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                <span className="text-xs text-slate-400">Average Time</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400/50 animate-pulse" />
                  <span className="text-sm font-semibold text-cyan-300">
                    {provider.average_time_hours < 1
                      ? `${(provider.average_time_hours * 60).toFixed(0)}m`
                      : `${provider.average_time_hours.toFixed(1)}h`}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {sortedProviders.length === 0 && !loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto bg-slate-800/50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">No providers available</p>
            <p className="text-slate-500 text-sm">Check back soon for updates</p>
          </div>
        </div>
      )}

      {/* Live Update Footer */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Updates every 30s • {formatTime(lastUpdate)}
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      </div>
    </div>
  )
}
