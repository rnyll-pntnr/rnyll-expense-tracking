
export function StatsGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-slate-100 animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 sm:h-4 w-20 bg-slate-100 rounded animate-pulse" />
                            <div className="h-4 sm:h-6 w-24 bg-slate-100 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function CategoryChartSkeleton() {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-3 sm:p-4 h-[300px]">
            <div className="h-6 w-48 bg-slate-100 rounded animate-pulse mb-4" />
            <div className="flex items-center justify-center h-full pb-8">
                <div className="w-48 h-48 rounded-full border-8 border-slate-100 animate-pulse" />
            </div>
        </div>
    )
}

export function CalendarSkeleton() {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-4 sm:p-6 h-[380px]">
            <div className="flex justify-between items-center mb-6">
                <div className="h-6 w-32 bg-slate-100 rounded animate-pulse" />
                <div className="flex gap-2">
                    <div className="h-8 w-8 bg-slate-100 rounded animate-pulse" />
                    <div className="h-8 w-32 bg-slate-100 rounded animate-pulse" />
                    <div className="h-8 w-8 bg-slate-100 rounded animate-pulse" />
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
                {[...Array(35)].map((_, i) => (
                    <div key={i} className="aspect-square bg-slate-50 rounded animate-pulse opacity-50" />
                ))}
            </div>
        </div>
    )
}

export function ChartSkeleton() {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-4 sm:p-6 h-[350px]">
            <div className="h-6 w-48 bg-slate-100 rounded animate-pulse mb-4" />
            <div className="flex items-center justify-center h-full">
                <div className="w-full h-48 bg-slate-100 rounded-lg animate-pulse" />
            </div>
        </div>
    )
}
