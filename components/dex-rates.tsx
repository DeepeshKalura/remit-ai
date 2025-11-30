"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Loader2, RefreshCw, Trophy, Zap } from "lucide-react"
import { useEffect, useState } from "react"

import { ProviderCard } from "@/components/dex/provider-card"
import { ProviderCardSkeleton } from "@/components/dex/provider-card-skeleton"

// Types (keep these)
interface ProviderRating {
  provider_name: string
  overall_rating: number
  speed_score: number
  cost_score: number
  reliability_score: number
  reviews_count: number
  average_time_hours: number
}
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export default function DexRatesPage() {
  const [providers, setProviders] = useState<ProviderRating[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Data fetching logic (remains the same)
  const fetchProviders = async (isInitialLoad = false) => {
    if (!isInitialLoad) {
      setLoading(true)
    }
    setError(null)
    try {
      const endpoint = `${API_BASE_URL}/api/rater/providers`
      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText} (${response.status})`)
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
    fetchProviders(true) // Pass true for initial load to use skeleton
    const interval = setInterval(() => fetchProviders(false), 30000)
    return () => clearInterval(interval)
  }, [])

  // Helper function to format time
  const formatTime = (date: Date) => {
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (diff < 60) return "just now"
    return `${Math.floor(diff / 60)}m ago`
  }

  // Derived state for top provider and sorted list
  const sortedProviders = providers
    .filter((p) => p.overall_rating > 0)
    .sort((a, b) => b.overall_rating - a.overall_rating)
  const topProvider = sortedProviders[0]

  // --- RENDER STATES ---

  if (loading && providers.length === 0) {
    return (
      <div className="space-y-6">
        <ProviderCardSkeleton /> {/* Header Skeleton can be added here */}
        <div className="grid gap-4 md:grid-cols-2">
          <ProviderCardSkeleton />
          <ProviderCardSkeleton />
          <ProviderCardSkeleton />
          <ProviderCardSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/20">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-xl font-semibold text-destructive">Failed to Load Rates</h3>
        <p className="mt-2 text-sm text-destructive/80">{error}</p>
        <Button onClick={() => fetchProviders(true)} variant="destructive" className="mt-6">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  // --- MAIN CONTENT ---

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">DEX Providers</h2>
          <p className="text-muted-foreground">Real-time performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
            <div className="relative mr-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            Live
          </Badge>
          <Button onClick={() => fetchProviders(false)} disabled={loading} variant="ghost" size="icon">
            <RefreshCw className={`h-4 w-4 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Top Provider Highlight */}
      {topProvider && (
        <Card className="border-amber-500/30 bg-gradient-to-br from-card to-amber-500/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-amber-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Top Performer</p>
                  <CardTitle className="text-xl">{topProvider.provider_name}</CardTitle>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-amber-400">{topProvider.overall_rating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Overall Rating</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Providers Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {sortedProviders.map((provider) => (
          <ProviderCard key={provider.provider_name} provider={provider} />
        ))}
      </div>

      {/* Empty State */}
      {sortedProviders.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
          <Zap className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">No Providers Available</h3>
          <p className="mt-2 text-sm text-muted-foreground">There are no active providers to display right now.</p>
        </div>
      )}

      {/* Live Update Footer */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <Separator className="flex-1" />
        <p className="text-xs text-muted-foreground">Updated {formatTime(lastUpdate)}</p>
        <Separator className="flex-1" />
      </div>
    </div>
  )
}