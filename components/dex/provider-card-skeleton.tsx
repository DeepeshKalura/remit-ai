// components/dex/provider-card-skeleton.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProviderCardSkeleton() {
    return (
        <Card className="bg-card/50">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-10 w-16 rounded-lg" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                </div>
                <div className="flex items-center justify-between pt-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-16" />
                </div>
            </CardContent>
        </Card>
    )
}