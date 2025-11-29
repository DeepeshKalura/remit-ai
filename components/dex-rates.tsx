"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Star, Loader2, AlertCircle, RefreshCw } from "lucide-react"

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function DexRates() {
  const [providers, setProviders] = useState<ProviderRating[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchProviders = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/api/rater/providers`)

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

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchProviders, 30000)
    return () => clearInterval(interval)
  }, [])

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-400"
    if (rating >= 6) return "text-yellow-400"
    if (rating >= 4) return "text-orange-400"
    return "text-red-400"
  }

  const getStars = (rating: number) => {
    const fullStars = Math.floor(rating / 2)
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < fullStars ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`}
      />
    ))
  }

  const formatTime = (date: Date) => {
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  if (loading && providers.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
          <p className="text-slate-400 text-sm">Loading provider ratings...</p>
        </div>
      </div>
    )
  }

  if (error && providers.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-red-400 font-medium">Failed to load rates</p>
          <p className="text-slate-400 text-sm">{error}</p>
          <button
            onClick={fetchProviders}
            className="mt-4 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Provider Ratings</h2>
          <p className="text-sm text-slate-400">Real-time DEX performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
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

      <div className="grid gap-3">
        {providers.filter(p => p.overall_rating > 0).map((provider, idx) => (
          <Card
            key={idx}
            className="group relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
          >
            {/* Glassmorphic overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="relative p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-white text-lg">{provider.provider_name}</h3>
                    <div className="flex items-center gap-1">
                      {getStars(provider.overall_rating)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">{provider.reviews_count.toLocaleString()} reviews</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-cyan-400">{provider.average_time_hours < 1 ? `${(provider.average_time_hours * 60).toFixed(0)}m` : `${provider.average_time_hours.toFixed(1)}h`} avg time</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-3xl font-bold ${getRatingColor(provider.overall_rating)}`}>
                    {provider.overall_rating.toFixed(1)}
                  </div>
                  <div className="text-xs text-slate-500">Overall</div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs text-slate-400">Speed</span>
                  </div>
                  <div className={`text-lg font-bold ${getRatingColor(provider.speed_score)}`}>
                    {provider.speed_score.toFixed(1)}
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-xs text-slate-400">Cost</span>
                  </div>
                  <div className={`text-lg font-bold ${getRatingColor(provider.cost_score)}`}>
                    {provider.cost_score.toFixed(1)}
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-xs text-slate-400">Reliability</span>
                  </div>
                  <div className={`text-lg font-bold ${getRatingColor(provider.reliability_score)}`}>
                    {provider.reliability_score.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Fee Info */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                <span className="text-xs text-slate-400">Average Time</span>
                <span className="text-sm font-semibold text-cyan-400">
                  {provider.average_time_hours < 1 ? `${(provider.average_time_hours * 60).toFixed(0)} min` : `${provider.average_time_hours.toFixed(1)} hours`}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {providers.length === 0 && !loading && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No providers available</p>
        </div>
      )}

      <div className="text-xs text-slate-400 text-center pt-2 flex items-center justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        Rates updated every 30 seconds • Last update: {formatTime(lastUpdate)}
      </div>
    </div>
  )
}
