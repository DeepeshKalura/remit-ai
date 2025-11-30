// components/dex/provider-card.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TrendingUp, Zap, ShieldCheck } from "lucide-react"

// Define the type for the provider prop
interface ProviderRating {
    provider_name: string
    overall_rating: number
    speed_score: number
    cost_score: number
    reliability_score: number
    reviews_count: number
    average_time_hours: number
}

interface ProviderCardProps {
    provider: ProviderRating
}

// Helper to determine rating color class based on theme variables
const getRatingClass = (rating: number): string => {
    if (rating >= 8) return "text-[oklch(var(--chart-4))] dark:text-[oklch(var(--chart-3))]" // Greenish
    if (rating >= 6) return "text-[oklch(var(--chart-1))]" // Orange
    if (rating >= 4) return "text-amber-500" // Fallback amber
    return "text-destructive" // Red
}

export function ProviderCard({ provider }: ProviderCardProps) {
    const metrics = [
        {
            label: "Speed",
            value: provider.speed_score,
            icon: TrendingUp,
            colorClass: "bg-[oklch(var(--chart-2))]", // Blue
        },
        {
            label: "Cost",
            value: provider.cost_score,
            icon: Zap,
            colorClass: "bg-[oklch(var(--chart-1))]", // Orange
        },
        {
            label: "Reliability",
            value: provider.reliability_score,
            icon: ShieldCheck,
            colorClass: "bg-[oklch(var(--chart-5))]", // Another color from your theme
        },
    ]

    const ratingColorClass = getRatingClass(provider.overall_rating)

    return (
        <Card className="group relative overflow-hidden transition-all duration-300 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
            <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <CardTitle>{provider.provider_name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {provider.reviews_count.toLocaleString()} reviews
                        </p>
                    </div>
                    <div className="flex-shrink-0 text-center">
                        <p className={`text-3xl font-bold ${ratingColorClass}`}>{provider.overall_rating.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-2">
                    {metrics.map((metric) => {
                        const Icon = metric.icon
                        const metricColorClass = getRatingClass(metric.value)
                        return (
                            <TooltipProvider key={metric.label}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="space-y-2 rounded-md border bg-background/50 p-3 text-center transition-colors hover:bg-muted/50">
                                            <Icon className={`mx-auto h-5 w-5 ${metricColorClass}`} />
                                            <p className="text-xs text-muted-foreground">{metric.label}</p>
                                            <p className={`text-lg font-semibold ${metricColorClass}`}>{metric.value.toFixed(1)}</p>
                                            <Progress value={metric.value * 10} indicatorClassName={metric.colorClass} />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{metric.label} Score: {metric.value.toFixed(1)} / 10</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )
                    })}
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Average Time</span>
                <span className="font-semibold text-foreground">
                    {provider.average_time_hours < 1
                        ? `${(provider.average_time_hours * 60).toFixed(0)}m`
                        : `${provider.average_time_hours.toFixed(1)}h`}
                </span>
            </CardFooter>
        </Card>
    )
}