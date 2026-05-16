import { ArrowLeft, CheckCircle2, Target, Users } from "lucide-react";

import { Button } from "@/atoms";
import { AreaTrend, BarSeries, ChartCard, DonutBreakdown } from "@/components/shared";
import { analyticsSeed } from "@/data/seed";
import { t } from "@/hooks";
import type { TeamInterface } from "@/interfaces";

interface TeamAnalyticsViewProps {
    team: TeamInterface;
    onBack: () => void;
    onViewMembers: () => void;
}

const MiniStat = ({ icon: Icon, label, value, tone = "primary" }: {
    icon: typeof Target;
    label: string;
    value: string | number;
    tone?: "primary" | "success" | "warning" | "error";
}) => {
    const toneClass = {
        primary: "text-primary-medium bg-primary-lighter",
        success: "text-success bg-success-light",
        warning: "text-warning bg-warning-light",
        error: "text-error bg-error-light",
    }[tone];
    return (
        <div className="rounded-lg border border-border bg-card p-3 flex items-center gap-3">
            <div className={`h-9 w-9 rounded-md flex items-center justify-center ${toneClass}`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-text-muted">{label}</p>
                <p className="text-base font-bold text-text-dark">{value}</p>
            </div>
        </div>
    );
};

export const TeamAnalyticsView = ({ team, onBack, onViewMembers }: TeamAnalyticsViewProps) => {
    const a = analyticsSeed.teams[team.id] ?? analyticsSeed.fallback.team;
    const workloadSeries = a.workload.map((w) => ({ label: w.initials, value: w.tasks_done }));

    return (
        <div>
            <div className="flex items-center gap-3 mb-5">
                <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
                    <ArrowLeft className="h-4 w-4" />
                    {t("Back to Teams")}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
                <aside className="space-y-4">
                    <div className="rounded-lg border border-border bg-card p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-lg bg-primary-lighter text-primary-medium flex items-center justify-center shrink-0">
                                <Users className="h-5 w-5" />
                            </div>
                            <h2 className="text-lg font-bold text-text-dark truncate">{team.name}</h2>
                        </div>

                        <dl className="space-y-2 text-xs">
                            <Row label={t("Members Active")} value={a.members_active} />
                            <Row label={t("Active Projects")} value={a.projects_active} />
                            <Row label={t("Active Sprints")} value={a.sprints_active} />
                            <Row label={t("Tasks Done")} value={`${a.tasks_done} / ${a.tasks_total}`} />
                            <Row label={t("On-time Rate")} value={`${a.on_time_rate}%`} />
                        </dl>

                        <Button className="w-full mt-4" size="sm" variant="outline" onClick={onViewMembers}>
                            {t("View Members")}
                        </Button>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-4">
                        <h3 className="text-sm font-semibold text-text-dark mb-3">{t("Workload")}</h3>
                        <div className="space-y-3">
                            {a.workload.map((person) => (
                                <div key={person.name}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-text-dark">{person.name}</span>
                                        <span className="text-text-muted">{person.hours}h</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full bg-primary-medium"
                                            style={{ width: `${Math.min(100, (person.hours / Math.max(...a.workload.map((x) => x.hours))) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                <section className="space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <MiniStat icon={Users} label={t("Members")} value={a.members_active} tone="primary" />
                        <MiniStat icon={Target} label={t("Projects")} value={a.projects_active} tone="primary" />
                        <MiniStat icon={CheckCircle2} label={t("On-time")} value={`${a.on_time_rate}%`} tone="success" />
                        <MiniStat icon={Target} label={t("Completion")} value={`${Math.round((a.tasks_done / Math.max(a.tasks_total, 1)) * 100)}%`} tone="primary" />
                    </div>

                    <ChartCard title={t("Velocity Trend")} subtitle={t("Story points per week")} height={240}>
                        <AreaTrend data={a.velocity_trend} valueLabel={t("Velocity")} />
                    </ChartCard>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ChartCard title={t("Workload by Member")} subtitle={t("Tasks completed")} height={220}>
                            <BarSeries data={workloadSeries} color="var(--color-primary-medium)" valueLabel={t("Tasks")} />
                        </ChartCard>
                        <ChartCard title={t("Focus Mix")} subtitle={t("Task type distribution")} height={220}>
                            <DonutBreakdown data={a.focus_breakdown} unit={t("tasks")} />
                        </ChartCard>
                    </div>
                </section>
            </div>
        </div>
    );
};

interface RowProps {
    label: string;
    value: string | number;
}

const Row = ({ label, value }: RowProps) => (
    <div className="flex items-center justify-between gap-2">
        <dt className="text-text-muted">{label}</dt>
        <dd className="font-semibold text-text-dark">{value}</dd>
    </div>
);
