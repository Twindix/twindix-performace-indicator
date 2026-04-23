import { Card, CardContent, CardHeader, Skeleton } from "@/atoms";

/* -------------------------------------------------------------------------- */
/*  Shared building blocks                                                     */
/* -------------------------------------------------------------------------- */

const HeaderSk = () => (
    <div className="mb-6">
        <Skeleton className="h-7 w-56 mb-2" />
        <Skeleton className="h-4 w-80 max-w-full" />
    </div>
);

const StatCard = () => (
    <Card>
        <CardContent className="p-4 flex flex-col items-center gap-2">
            <Skeleton className="h-8 w-14" />
            <Skeleton className="h-3 w-20" />
        </CardContent>
    </Card>
);

const ListItem = ({ wide }: { wide?: boolean }) => (
    <div className="flex items-center gap-3 p-3">
        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
            <Skeleton className={wide ? "h-4 w-3/4" : "h-4 w-1/2"} />
            <Skeleton className="h-3 w-1/3" />
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

export const DashboardSkeleton = () => (
    <div>
        <HeaderSk />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:row-span-2">
                <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <Skeleton className="h-40 w-40 rounded-full" />
                    <Skeleton className="h-6 w-20" />
                    <div className="w-full grid grid-cols-3 gap-2 mt-2">
                        {[...Array(3)].map((_, i) => <div key={i} className="text-center space-y-1"><Skeleton className="h-7 w-10 mx-auto" /><Skeleton className="h-3 w-16 mx-auto" /></div>)}
                    </div>
                </CardContent>
            </Card>
            <div className="lg:col-span-2 grid grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4 space-y-2">
                            <div className="flex items-center gap-2"><Skeleton className="h-4 w-4 rounded" /><Skeleton className="h-3 w-24" /></div>
                            <div className="flex items-end justify-between"><Skeleton className="h-7 w-10" /><Skeleton className="h-5 w-16 rounded-full" /></div>
                            <Skeleton className="h-1.5 w-full rounded-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
        <div className="mb-6">
            <Skeleton className="h-5 w-28 mb-3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between"><Skeleton className="h-3 w-24" /><Skeleton className="h-5 w-16 rounded-full" /></div>
                            <Skeleton className="h-7 w-16" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
                    <CardContent className="space-y-3">
                        {[...Array(3)].map((_, j) => <ListItem key={j} />)}
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Tasks (Kanban)                                                             */
/* -------------------------------------------------------------------------- */

export const TasksSkeleton = () => (
    <div>
        <HeaderSk />
        <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-10 flex-1 max-w-xs" />
            <Skeleton className="h-10 w-[140px]" />
            <Skeleton className="h-10 w-[140px]" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, col) => (
                <div key={col} className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-6 rounded-full" />
                    </div>
                    {[...Array(col % 2 === 0 ? 3 : 2)].map((_, j) => (
                        <Card key={j}>
                            <CardContent className="p-3 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-2/3" />
                                <div className="flex items-center justify-between pt-1">
                                    <Skeleton className="h-5 w-14 rounded-full" />
                                    <Skeleton className="h-6 w-6 rounded-full" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Blockers                                                                   */
/* -------------------------------------------------------------------------- */

export const BlockersSkeleton = () => (
    <div>
        <HeaderSk />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[...Array(4)].map((_, i) => <StatCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-5 w-24" />
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-5 space-y-3">
                            <div className="flex items-start gap-3">
                                <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-full" />
                                </div>
                                <div className="flex gap-1.5 shrink-0">
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                    <Skeleton className="h-5 w-14 rounded-full" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                {[...Array(4)].map((_, j) => <Skeleton key={j} className="h-3 w-20" />)}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card>
                <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-1.5">
                            <div className="flex justify-between"><Skeleton className="h-3 w-24" /><Skeleton className="h-3 w-6" /></div>
                            <Skeleton className="h-2.5 w-full rounded-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Decisions                                                                  */
/* -------------------------------------------------------------------------- */

export const DecisionsSkeleton = () => (
    <div>
        <HeaderSk />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[...Array(4)].map((_, i) => <StatCard key={i} />)}
        </div>
        <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-3 w-full max-w-md" />
                            </div>
                            <Skeleton className="h-5 w-20 rounded-full shrink-0" />
                        </div>
                        <div className="flex gap-3">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Communication                                                              */
/* -------------------------------------------------------------------------- */

export const CommunicationSkeleton = () => (
    <div>
        <HeaderSk />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[...Array(4)].map((_, i) => <StatCard key={i} />)}
        </div>
        <div className="mb-4 flex gap-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-9 w-20 rounded-lg" />)}
        </div>
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-5 w-14 rounded-full" />
                                </div>
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-2/3" />
                            </div>
                            <Skeleton className="h-3 w-12 shrink-0" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Workload                                                                   */
/* -------------------------------------------------------------------------- */

export const WorkloadSkeleton = () => (
    <div>
        <HeaderSk />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[...Array(4)].map((_, i) => <StatCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader><Skeleton className="h-5 w-36" /></CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                            <div className="flex-1 space-y-1.5">
                                <div className="flex justify-between"><Skeleton className="h-3 w-24" /><Skeleton className="h-3 w-10" /></div>
                                <Skeleton className="h-2 w-full rounded-full" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-5 w-44" /></CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-3 w-20 shrink-0" />
                            <Skeleton className="h-6 rounded-full" style={{ width: `${70 - i * 10}%` }} />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Reports                                                                    */
/* -------------------------------------------------------------------------- */

export const ReportsSkeleton = () => (
    <div>
        <HeaderSk />
        <div className="mb-4 flex gap-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-9 w-24 rounded-lg" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {[...Array(2)].map((_, i) => (
                <Card key={i}>
                    <CardHeader><Skeleton className="h-5 w-28" /></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-center"><Skeleton className="h-32 w-32 rounded-full" /></div>
                        <div className="grid grid-cols-3 gap-3">
                            {[...Array(3)].map((_, j) => <div key={j} className="text-center space-y-1"><Skeleton className="h-6 w-10 mx-auto" /><Skeleton className="h-3 w-16 mx-auto" /></div>)}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-7 w-14" />
                        <Skeleton className="h-3 w-28" />
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Analytics                                                                  */
/* -------------------------------------------------------------------------- */

export const AnalyticsSkeleton = () => (
    <div>
        <HeaderSk />
        <div className="mb-4 flex gap-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-9 w-28 rounded-lg" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {[...Array(6)].map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-2"><Skeleton className="h-4 w-4 rounded" /><Skeleton className="h-3 w-28" /></div>
                        <Skeleton className="h-7 w-12" />
                        <Skeleton className="h-1.5 w-full rounded-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
        <Card>
            <CardHeader><Skeleton className="h-5 w-36" /></CardHeader>
            <CardContent>
                <div className="flex items-end gap-2 h-40">
                    {[...Array(12)].map((_, i) => <Skeleton key={i} className="flex-1 rounded-t" style={{ height: `${30 + Math.random() * 60}%` }} />)}
                </div>
            </CardContent>
        </Card>
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Ownership                                                                  */
/* -------------------------------------------------------------------------- */

export const OwnershipSkeleton = () => (
    <div>
        <HeaderSk />
        <div className="grid grid-cols-3 gap-3 mb-6">
            {[...Array(3)].map((_, i) => <StatCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
                <Skeleton className="h-5 w-32" />
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3 w-56" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-7 w-7 rounded-full" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card>
                <CardHeader><Skeleton className="h-5 w-28" /></CardHeader>
                <CardContent className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
                            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                            <div className="flex-1 space-y-1"><Skeleton className="h-3 w-32" /><Skeleton className="h-3 w-20" /></div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Handoffs                                                                   */
/* -------------------------------------------------------------------------- */

export const HandoffsSkeleton = () => (
    <div>
        <HeaderSk />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[...Array(4)].map((_, i) => <StatCard key={i} />)}
        </div>
        <Card className="mb-6">
            <CardContent className="p-5">
                <div className="flex items-center justify-between">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            {i < 5 && <Skeleton className="h-0.5 w-8" />}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
        <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-full max-w-lg" />
                        <div className="flex gap-2 pt-1">
                            {[...Array(3)].map((_, j) => <Skeleton key={j} className="h-4 w-4 rounded" />)}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Profile                                                                    */
/* -------------------------------------------------------------------------- */

export const ProfileSkeleton = () => (
    <div>
        <HeaderSk />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-1">
                <CardContent className="p-6 flex flex-col items-center gap-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-40" />
                    <div className="w-full space-y-2 pt-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-2"><Skeleton className="h-4 w-4" /><Skeleton className="h-3 w-36" /></div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => <StatCard key={i} />)}
                </div>
                <Card>
                    <CardHeader><Skeleton className="h-5 w-36" /></CardHeader>
                    <CardContent className="flex justify-center">
                        <Skeleton className="h-36 w-36 rounded-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
        <Card>
            <CardHeader><Skeleton className="h-5 w-28" /></CardHeader>
            <CardContent className="space-y-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-3"><Skeleton className="h-5 w-14 rounded-full" /><Skeleton className="h-4 w-48" /></div>
                        <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                ))}
            </CardContent>
        </Card>
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Red Flags                                                                  */
/* -------------------------------------------------------------------------- */

export const RedFlagsSkeleton = () => (
    <div>
        <HeaderSk />
        <div className="flex justify-end mb-6">
            <Skeleton className="h-9 w-32 rounded-md" />
        </div>
        <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="border-s-4">
                    <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                            <Skeleton className="h-5 w-5 rounded shrink-0 mt-0.5" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-3/4" />
                            </div>
                            <Skeleton className="h-5 w-16 rounded-full shrink-0" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Alerts                                                                     */
/* -------------------------------------------------------------------------- */

export const AlertsSkeleton = () => (
    <div>
        <HeaderSk />
        <div className="flex justify-end mb-6">
            <Skeleton className="h-9 w-28 rounded-md" />
        </div>
        <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                            <Skeleton className="h-5 w-5 rounded shrink-0 mt-0.5" />
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-3/4" />
                                <div className="flex items-center gap-3 pt-1">
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-3 w-28" />
                                </div>
                            </div>
                            <Skeleton className="h-8 w-28 rounded-md shrink-0" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Comments Log                                                               */
/* -------------------------------------------------------------------------- */

export const CommentsLogSkeleton = () => (
    <div>
        <HeaderSk />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[...Array(4)].map((_, i) => <StatCard key={i} />)}
        </div>
        <Card className="mb-6">
            <CardContent className="p-4 flex flex-wrap gap-3">
                <Skeleton className="h-9 w-44 rounded-md" />
                <Skeleton className="h-9 w-36 rounded-md" />
                <Skeleton className="h-9 w-32 rounded-md" />
                <Skeleton className="h-9 w-32 rounded-md" />
            </CardContent>
        </Card>
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-5 w-48 rounded-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                        <div className="flex items-center gap-3 pt-1">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-5 w-16 rounded-full ms-auto" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Sprints (grid of cards)                                                    */
/* -------------------------------------------------------------------------- */

export const SprintsSkeleton = () => (
    <div>
        <HeaderSk />
        <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-10 w-64 max-w-full" />
            <Skeleton className="h-9 w-32 rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                        <div className="flex items-center gap-3 pt-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Projects (grid)                                                            */
/* -------------------------------------------------------------------------- */

export const ProjectsSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
            <Card key={i}>
                <CardContent className="p-5 space-y-3">
                    <div className="flex items-start gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-16 rounded-full" />
                        </div>
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-10" />
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Sprint Summary (detail page)                                               */
/* -------------------------------------------------------------------------- */

export const SprintSummarySkeleton = () => (
    <div>
        <HeaderSk />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[...Array(4)].map((_, i) => <StatCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2">
                <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-1.5">
                            <div className="flex justify-between"><Skeleton className="h-3 w-28" /><Skeleton className="h-3 w-10" /></div>
                            <Skeleton className="h-2 w-full rounded-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-5 w-28" /></CardHeader>
                <CardContent className="flex flex-col items-center gap-3">
                    <Skeleton className="h-32 w-32 rounded-full" />
                    <Skeleton className="h-5 w-16" />
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader><Skeleton className="h-5 w-36" /></CardHeader>
            <CardContent className="space-y-3">
                {[...Array(4)].map((_, i) => <ListItem key={i} wide />)}
            </CardContent>
        </Card>
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Users                                                                      */
/* -------------------------------------------------------------------------- */

export const UsersSkeleton = () => (
    <div>
        <HeaderSk />
        <div className="flex items-center justify-between mb-6 gap-3">
            <Skeleton className="h-10 flex-1 max-w-xs" />
            <Skeleton className="h-9 w-28 rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-5 flex items-start gap-3">
                        <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-40" />
                            <div className="flex gap-2 pt-1">
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-14 rounded-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Teams                                                                      */
/* -------------------------------------------------------------------------- */

export const TeamsSkeleton = () => (
    <div>
        <HeaderSk />
        <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-10 w-64 max-w-full" />
            <Skeleton className="h-9 w-28 rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-5 space-y-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="flex-1 space-y-1.5">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <div className="flex -space-x-2 pt-1">
                            {[...Array(4)].map((_, j) => <Skeleton key={j} className="h-7 w-7 rounded-full border-2 border-background" />)}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

export const SettingsSkeleton = () => (
    <div>
        <HeaderSk />
        <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(2)].map((_, j) => (
                            <div key={j} className="flex items-center justify-between">
                                <div className="space-y-1"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-44" /></div>
                                <Skeleton className="h-9 w-20 rounded-lg" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);
