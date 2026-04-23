import { Activity, Clock, Flame, Target, TriangleAlert } from "lucide-react";

import { Header } from "@/components/shared";
import {
    AreaTrend,
    BarSeries,
    ChartCard,
    DonutBreakdown,
    RadialProgress,
    StackedBreakdownBars,
} from "@/components/shared";
import { analyticsSeed } from "@/data";
import { t } from "@/hooks";

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

export const DeliveryAnalyticsView = () => {
    const d = analyticsSeed.delivery;

    return (
        <div>
            <Header
                title={t("Delivery Analytics")}
                description={t("How well we're shipping — velocity, on-time delivery, and friction signals.")}
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                <KpiCard icon={Activity} label={t("Delivery Health")} value={`${d.health_score}`} tone="success" trend={t("Trending up")} />
                <KpiCard icon={Clock} label={t("On-time Rate")} value={`${d.on_time_rate}%`} tone="primary" />
                <KpiCard icon={Target} label={t("Throughput / Sprint")} value={`${d.throughput_per_sprint}`} tone="primary" />
                <KpiCard icon={TriangleAlert} label={t("Blocker Resolution")} value={`${d.blocker_resolution_hours}h`} tone="warning" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div className="lg:col-span-2 space-y-4">
                    <ChartCard title={t("Velocity Over Time")} subtitle={t("Average story points per sprint")} height={240}>
                        <AreaTrend data={d.velocity_history} valueLabel={t("Velocity")} />
                    </ChartCard>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ChartCard title={t("Throughput")} subtitle={t("Tasks completed per month")} height={220}>
                            <BarSeries data={d.throughput_history} color="var(--color-primary-medium)" valueLabel={t("Tasks")} />
                        </ChartCard>
                        <ChartCard title={t("On-time Delivery")} subtitle={t("Percent hit targets")} height={220}>
                            <AreaTrend data={d.on_time_history} color="var(--color-success)" valueLabel={t("On-time %")} />
                        </ChartCard>
                    </div>
                </div>

                <div className="space-y-4">
                    <ChartCard title={t("Delivery Health")} subtitle={t("Composite score")} height={240}>
                        <div className="relative h-full">
                            <RadialProgress value={d.health_score} color="var(--color-success)" />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-text-dark">{d.health_score}</p>
                                    <p className="text-[10px] text-text-muted uppercase tracking-wide">{t("of 100")}</p>
                                </div>
                            </div>
                        </div>
                    </ChartCard>
                    <ChartCard title={t("Friction Sources")} subtitle={t("Where blockers come from")} height={220}>
                        <DonutBreakdown data={d.friction_breakdown} unit={t("issues")} />
                    </ChartCard>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <ChartCard title={t("Blocker Trend")} subtitle={t("Target vs actual per month")} height={240}>
                    <StackedBreakdownBars
                        data={d.blocker_trend}
                        plannedLabel={t("Target")}
                        actualLabel={t("Actual")}
                        plannedColor="var(--color-muted-foreground)"
                        actualColor="var(--color-error)"
                    />
                </ChartCard>
                <ChartCard title={t("Project Leaderboard")} subtitle={t("Shipping performance by project")} height={240}>
                    <div className="space-y-3">
                        {d.project_leaderboard.map((project, index) => (
                            <div key={project.name} className="flex items-center gap-3">
                                <div className="h-7 w-7 rounded-md bg-primary-lighter text-primary-medium text-xs font-bold flex items-center justify-center shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-semibold text-text-dark truncate">{project.name}</p>
                                        <span className="text-xs text-success font-semibold">{project.on_time_rate}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div className="h-full bg-success" style={{ width: `${project.on_time_rate}%` }} />
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
                        {t("Velocity is up 36% since January while on-time rate climbed to 84%. Dependencies and requirements remain the top friction sources — tighten intake to convert throughput into shipped work.")}
                    </p>
                </div>
            </div>
        </div>
    );
};
