import { useMemo, useState } from "react";
import { Activity, Clock, Flame, Target, TriangleAlert, X } from "lucide-react";

import { Button, Input, Label } from "@/atoms";
import { Header } from "@/components/shared";
import {
    AreaTrend,
    BarSeries,
    ChartCard,
    DonutBreakdown,
    RadialProgress,
    StackedBreakdownBars,
} from "@/components/shared";
import { t, useDeliveryAnalytics, useProjectsListLite } from "@/hooks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";

const KpiCard = ({ icon: Icon, label, value, trend, tone = "primary" }: {
    icon: typeof Target;
    label: string;
    value: string;
    trend?: string;
    tone?: "primary" | "success" | "warning" | "error";
}) => {
    const toneClass = {
        primary: "text-primary-medium bg-primary-lighter",
        success: "text-success bg-success-light",
        warning: "text-warning bg-warning-light",
        error: "text-error bg-error-light",
    }[tone];
    return (
        <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
                <div className={`h-9 w-9 rounded-md flex items-center justify-center ${toneClass}`}>
                    <Icon className="h-4 w-4" />
                </div>
                <p className="text-[11px] uppercase tracking-wide text-text-muted">{label}</p>
            </div>
            <p className="text-2xl font-bold text-text-dark">{value}</p>
            {trend && <p className="text-[11px] text-success mt-1">{trend}</p>}
        </div>
    );
};

const FRICTION_COLOR_MAP: Record<string, string> = {
    Requirements: "var(--color-friction-requirements)",
    Communication: "var(--color-friction-communication)",
    Ownership: "var(--color-friction-ownership)",
    Dependencies: "var(--color-friction-dependencies)",
    Process: "var(--color-friction-process)",
    Team: "var(--color-friction-team)",
};

const STATUS_COLORS = [
    "var(--color-primary-medium)",
    "var(--color-success)",
    "var(--color-info)",
    "var(--color-warning)",
    "var(--color-error)",
    "var(--color-muted-foreground)",
];

export const DeliveryAnalyticsView = () => {
    const { projects } = useProjectsListLite();
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [projectId, setProjectId] = useState<string>("all");

    const filters = {
        from: from || undefined,
        to: to || undefined,
        project_id: projectId !== "all" ? projectId : undefined,
    };

    const { data, isLoading } = useDeliveryAnalytics(filters);

    const canReset = from !== "" || to !== "" || projectId !== "all";
    const handleReset = () => {
        setFrom("");
        setTo("");
        setProjectId("all");
    };

    const view = useMemo(() => {
        if (!data) return null;
        return {
            health_score: data.health_score,
            on_time_rate: data.on_time_rate,
            throughput_per_sprint: data.throughput_per_sprint,
            blocker_resolution_hours: data.blocker_resolution_avg_hours,
            velocity: data.velocity.map((p) => ({ label: p.month, value: p.value })),
            throughput: data.throughput.map((p) => ({ label: p.month, value: p.value })),
            on_time: data.on_time.map((p) => ({ label: p.month, value: p.value })),
            friction: data.friction_sources.map((f, i) => ({
                name: f.category,
                value: f.count,
                color: FRICTION_COLOR_MAP[f.category] ?? STATUS_COLORS[i % STATUS_COLORS.length],
            })),
            blocker_trend: data.blocker_trend.map((b) => ({
                label: b.month,
                planned: b.target,
                actual: b.actual,
            })),
            leaderboard: data.leaderboard,
        };
    }, [data]);

    const filterBar = (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 mb-4 p-4 rounded-lg border border-border bg-card">
            <div className="space-y-1.5">
                <Label>{t("Project")}</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("All Projects")}</SelectItem>
                        {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label>{t("From")}</Label>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
                <Label>{t("To")}</Label>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="flex items-end">
                <Button variant="outline" size="sm" onClick={handleReset} disabled={!canReset} className="gap-1.5 w-full">
                    <X className="h-4 w-4" />
                    {t("Reset")}
                </Button>
            </div>
        </div>
    );

    if (!view) {
        return (
            <div>
                <Header
                    title={t("Delivery Analytics")}
                    description={t("How well we're shipping — velocity, on-time delivery, and friction signals.")}
                />
                {filterBar}
                <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
                    {isLoading ? t("Loading delivery analytics...") : t("No delivery analytics available.")}
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header
                title={t("Delivery Analytics")}
                description={t("How well we're shipping — velocity, on-time delivery, and friction signals.")}
            />
            {filterBar}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                <KpiCard icon={Activity} label={t("Delivery Health")} value={`${view.health_score}`} tone="success" trend={t("Trending up")} />
                <KpiCard icon={Clock} label={t("On-time Rate")} value={`${view.on_time_rate}%`} tone="primary" />
                <KpiCard icon={Target} label={t("Throughput / Sprint")} value={`${view.throughput_per_sprint}`} tone="primary" />
                <KpiCard icon={TriangleAlert} label={t("Blocker Resolution")} value={`${view.blocker_resolution_hours}h`} tone="warning" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div className="lg:col-span-2 space-y-4">
                    <ChartCard title={t("Velocity Over Time")} subtitle={t("Average story points per sprint")} height={240}>
                        <AreaTrend data={view.velocity} valueLabel={t("Velocity")} />
                    </ChartCard>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ChartCard title={t("Throughput")} subtitle={t("Tasks completed per month")} height={220}>
                            <BarSeries data={view.throughput} color="var(--color-primary-medium)" valueLabel={t("Tasks")} />
                        </ChartCard>
                        <ChartCard title={t("On-time Delivery")} subtitle={t("Percent hit targets")} height={220}>
                            <AreaTrend data={view.on_time} color="var(--color-success)" valueLabel={t("On-time %")} />
                        </ChartCard>
                    </div>
                </div>

                <div className="space-y-4">
                    <ChartCard title={t("Delivery Health")} subtitle={t("Composite score")} height={240}>
                        <div className="relative h-full">
                            <RadialProgress value={view.health_score} color="var(--color-success)" />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-text-dark">{view.health_score}</p>
                                    <p className="text-[10px] text-text-muted uppercase tracking-wide">{t("of 100")}</p>
                                </div>
                            </div>
                        </div>
                    </ChartCard>
                    <ChartCard title={t("Friction Sources")} subtitle={t("Where blockers come from")} height={220}>
                        <DonutBreakdown data={view.friction} unit={t("issues")} />
                    </ChartCard>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <ChartCard title={t("Blocker Trend")} subtitle={t("Target vs actual per month")} height={240}>
                    <StackedBreakdownBars
                        data={view.blocker_trend}
                        plannedLabel={t("Target")}
                        actualLabel={t("Actual")}
                        plannedColor="var(--color-muted-foreground)"
                        actualColor="var(--color-error)"
                    />
                </ChartCard>
                <ChartCard title={t("Project Leaderboard")} subtitle={t("Shipping performance by project")} height={240}>
                    <div className="space-y-3">
                        {view.leaderboard.map((project, index) => (
                            <div key={project.project_id} className="flex items-center gap-3">
                                <div className="h-7 w-7 rounded-md bg-primary-lighter text-primary-medium text-xs font-bold flex items-center justify-center shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-semibold text-text-dark truncate">{project.project_name}</p>
                                        <span className="text-xs text-success font-semibold">{project.score}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div className="h-full bg-success" style={{ width: `${Math.min(project.score, 100)}%` }} />
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-text-muted mt-1">
                                        <span>{t("Velocity")}: {project.velocity}</span>
                                        <span>{t("Completion")}: {project.completion}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ChartCard>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-md flex items-center justify-center bg-warning-light text-warning shrink-0">
                    <Flame className="h-4 w-4" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-text-dark">{t("Insight")}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                        {t("Track velocity, on-time rate, and friction sources to spot delivery patterns and improve shipping performance.")}
                    </p>
                </div>
            </div>
        </div>
    );
};
