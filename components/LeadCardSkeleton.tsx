import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function LeadCardSkeleton() {
    return (
        <Card className="mb-3 border-white/5 bg-[#0f172a]/20 backdrop-blur-sm shadow-sm">
            <div className="p-2 flex justify-center">
                <Skeleton className="w-8 h-1 bg-white/5 rounded-full" />
            </div>
            <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4 bg-white/10" />
                        <Skeleton className="h-3 w-1/2 bg-white/5" />
                    </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-3 w-3 bg-white/5 rounded-full" />
                    <Skeleton className="h-3 w-2/3 bg-white/5" />
                </div>
                <Skeleton className="h-5 w-16 bg-white/5 mb-3" />
                <div className="flex items-center gap-1 mb-2">
                    <Skeleton className="h-3 w-3 bg-white/5" />
                    <Skeleton className="h-3 w-20 bg-white/5" />
                </div>
                <Skeleton className="h-8 w-full bg-white/5 rounded-md" />
            </CardContent>
        </Card>
    )
}
