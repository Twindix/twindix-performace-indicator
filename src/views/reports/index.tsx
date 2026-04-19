import { useMemo } from "react";
import { AlertTriangle, ArrowRight, Clock, FileText, GitBranch, Lightbulb, MessageSquare, Shield, TrendingDown, TrendingUp, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { AnimatedNumber, Header, MetricCard, ScoreGauge, StatusBadge } from "@/components/shared";
import { ReportsSkeleton } from "@/components/skeletons";
import { BlockerStatus, MetricStatus, TaskPhase } from "@/enums";
import { t, useSettings, usePageLoader } from "@/hooks";
import type { BlockerInterface, SprintInterface, SprintMetricsInterface, TaskInterface } from "@/interfaces";
import { useSprintStore } from "@/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui";
import { cn, td, formatDate, getStorageItem, storageKeys } from "@/utils";

const getScoreStatus = (score: number): MetricStatus => {
    if (score >= 80) return MetricStatus.Healthy;
    if (score >= 60) return MetricStatus.Warning;
    return MetricStatus.Critical;
};

const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-error";
};

const getBarColor = (score: number): string => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-error";
};

const frictionAreaConfig = [
    {
        key: "poorRequirements" as const,
        labelKey: "Poor Requirements",
        icon: AlertTriangle,
        color: "text-friction-requirements",
        bgColor: "bg-friction-requirements",
        description: (score: number) =>
            score >= 80
                ? "Requirements are well-defined. The team has clear acceptance criteria and minimal rework due to ambiguity."
                : score >= 60
                  ? "Some requirements lack clarity. Occasional rework happens because acceptance criteria or edge cases are not fully defined before development starts."
                  : "Requirements are frequently unclear or incomplete. The team is spending significant time on rework and clarification, slowing down delivery.",
        metricsFilter: ["Task Readiness Rate", "Story Quality Score", "Requirement Completeness"],
    },
    {
        key: "communicationGaps" as const,
        labelKey: "Communication Gaps",
        icon: MessageSquare,
        color: "text-friction-communication",
        bgColor: "bg-friction-communication",
        description: (score: number) =>
            score >= 80
                ? "Team communication is strong. Information flows freely across roles, and decisions are shared promptly."
                : score >= 60
                  ? "Some communication gaps exist. Important updates occasionally get missed, leading to misalignment or duplicated work."
                  : "Communication is a major friction point. Critical information is not reaching the right people, causing delays and misunderstandings.",
        metricsFilter: ["Communication Frequency", "Info Flow Score", "Response Time"],
    },
    {
        key: "weakOwnership" as const,
        labelKey: "Weak Ownership",
        icon: Shield,
        color: "text-friction-ownership",
        bgColor: "bg-friction-ownership",
        description: (score: number) =>
            score >= 80
                ? "Strong ownership culture. Team members take clear accountability for their tasks and follow through reliably."
                : score >= 60
                  ? "Ownership could improve. Some tasks lack a clear single owner, leading to ambiguity about who is responsible for driving them to completion."
                  : "Ownership is a significant problem. Many tasks are orphaned or have unclear ownership, resulting in dropped balls and slow progress.",
        metricsFilter: ["Ownership Clarity", "Task Accountability", "Follow-through Rate"],
    },
    {
        key: "dependencyBlockers" as const,
        labelKey: "Dependency Blockers",
        icon: GitBranch,
        color: "text-friction-dependencies",
        bgColor: "bg-friction-dependencies",
        description: (score: number) =>
            score >= 80
                ? "Dependencies are well-managed. Blockers are rare and resolved quickly when they occur."
                : score >= 60
                  ? "Some dependency issues are causing delays. A few blockers are taking longer than expected to resolve."
                  : "Dependencies are severely impacting delivery. Multiple long-standing blockers are preventing the team from making progress on critical work.",
        metricsFilter: ["Blocker Resolution Time", "Dependency Count", "Blocked Task Rate"],
    },
    {
        key: "processGaps" as const,
        labelKey: "Process Gaps",
        icon: Clock,
        color: "text-friction-process",
        bgColor: "bg-friction-process",
        description: (score: number) =>
            score >= 80
                ? "Processes are mature and effective. Handoffs are smooth and the team follows consistent workflows."
                : score >= 60
                  ? "Some process gaps exist. Handoffs between phases are not always smooth, causing delays in the pipeline."
                  : "Processes need significant improvement. Handoffs are frequently incomplete or delayed, and there is no consistent workflow the team follows.",
        metricsFilter: ["Handoff Completion Rate", "Process Compliance", "Cycle Time"],
    },
    {
        key: "teamCulture" as const,
        labelKey: "Team & Culture",
        icon: Users,
        color: "text-friction-team",
        bgColor: "bg-friction-team",
        description: (score: number) =>
            score >= 80
                ? "Team dynamics are excellent. Workload is balanced, decisions are collaborative, and morale is high."
                : score >= 60
                  ? "Team dynamics are adequate but could improve. Some workload imbalances or decision-making delays are visible."
                  : "Team dynamics need attention. Significant workload imbalances, slow decision-making, or low engagement are impacting delivery.",
        metricsFilter: ["Decision Log Coverage", "Workload Balance", "Team Engagement"],
    },
];

export const ReportsView = () => {
    const isLoading = usePageLoader();
    const [settings] = useSettings();
    const isRTL = settings.language === "ar";
    const { activeSprintId } = useSprintStore();

    const sprints = getStorageItem<SprintInterface[]>(storageKeys.sprints) ?? [];
    const sprint = sprints.find((s) => s.id === activeSprintId);
    const allMetrics = getStorageItem<SprintMetricsInterface[]>(storageKeys.metrics) ?? [];
    const sprintMetrics = allMetrics.find((m) => m.sprintId === activeSprintId);
    const tasks = (getStorageItem<TaskInterface[]>(storageKeys.tasks) ?? []).filter((t) => t.sprint_id === activeSprintId);
    const blockers = (getStorageItem<BlockerInterface[]>(storageKeys.blockers) ?? []);

    const taskStats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter((t) => t.phase === TaskPhase.Done).length;
        const blocked = tasks.filter((t) => t.is_blocked).length;
        const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, blocked, completionPct };
    }, [tasks]);

    const activeBlockerCount = blockers.filter((b) => b.status === BlockerStatus.Active || b.status === BlockerStatus.Escalated).length;

    const keyFindings = useMemo(() => {
        if (!sprintMetrics?.metrics.length) return { best: [], worst: [] };
        const sorted = [...sprintMetrics.metrics].sort((a, b) => b.value - a.value);
        const best = sorted.filter((m) => m.status === MetricStatus.Healthy).slice(0, 3);
        const worst = [...sprintMetrics.metrics]
            .filter((m) => m.status === MetricStatus.Critical || m.status === MetricStatus.Warning)
            .sort((a, b) => a.value - b.value)
            .slice(0, 3);
        return { best, worst };
    }, [sprintMetrics]);

    const recommendations = useMemo(() => {
        const recs: string[] = [];
        if (!sprintMetrics) return recs;

        const { frictionScores } = sprintMetrics;

        if (frictionScores.poorRequirements < 60) recs.push(td("Invest in a requirements review checklist before sprint planning to reduce rework and improve task readiness."));
        if (frictionScores.communicationGaps < 60) recs.push(td("Introduce a daily async standup or structured check-in to close communication gaps across the team."));
        if (frictionScores.weakOwnership < 60) recs.push(td("Assign a single clear owner to every task and blocker. Consider a RACI matrix for cross-functional work."));
        if (frictionScores.dependencyBlockers < 60) recs.push(td("Prioritize blocker resolution in daily standups. Escalate blockers older than 2 days to leadership."));
        if (frictionScores.processGaps < 60) recs.push(td("Standardize handoff criteria between phases. Create definition-of-done checklists for each transition."));
        if (frictionScores.teamCulture < 60) recs.push(td("Review workload distribution to prevent burnout. Ensure decisions are documented and shared transparently."));

        if (taskStats.completionPct < 50) recs.push(td("Sprint completion is below 50%. Consider reducing scope or breaking tasks into smaller deliverables."));
        if (activeBlockerCount > 3) recs.push(td("There are active blockers. Schedule a dedicated blocker-busting session to unblock the team.").replace("5", String(activeBlockerCount)));

        if (recs.length === 0) recs.push(td("The sprint is performing well across all areas. Continue current practices and look for incremental improvements."));

        return recs;
    }, [sprintMetrics, taskStats, activeBlockerCount]);

    if (isLoading) return <ReportsSkeleton />;

    const getMetricsForArea = (metricsFilter: string[]) => {
        if (!sprintMetrics?.metrics) return [];
        return sprintMetrics.metrics.filter((m) => metricsFilter.some((f) => m.name.toLowerCase().includes(f.toLowerCase()))).slice(0, 3);
    };

    return (
        <div>
            <Header title={t("Reports")} />

            <Tabs defaultValue="summary">
                <TabsList className="mb-6">
                    <TabsTrigger value="summary">
                        <FileText className="h-4 w-4 me-1.5" />
                        {t("Executive Summary")}
                    </TabsTrigger>
                    <TabsTrigger value="friction">
                        <AlertTriangle className="h-4 w-4 me-1.5" />
                        {t("Friction Analysis")}
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Executive Summary */}
                <TabsContent value="summary">
                    <div className="space-y-8">
                        {/* Sprint Header */}
                        <div className="text-center pb-6 border-b border-border">
                            <h2 className="text-xl sm:text-3xl font-bold text-text-dark">{sprint?.name ?? t("Current Sprint")}</h2>
                            {sprint && (
                                <p className="text-base text-text-secondary mt-2">
                                    {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                                </p>
                            )}
                        </div>

                        {/* Health Score */}
                        <div className="flex flex-col items-center gap-4">
                            <h3 className="text-lg font-semibold text-text-dark">{t("Overall Sprint Health")}</h3>
                            <ScoreGauge score={sprintMetrics?.healthScore ?? 0} size="lg" label={t("Health Score")} />
                            <StatusBadge status={getScoreStatus(sprintMetrics?.healthScore ?? 0)} />
                        </div>

                        {/* Sprint Progress Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{t("Sprint Progress")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                                    <div className="text-center">
                                        <p className="text-2xl sm:text-4xl font-bold text-text-dark"><AnimatedNumber value={taskStats.total} /></p>
                                        <p className="text-xs sm:text-sm text-text-muted mt-1">{t("Total Tasks")}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl sm:text-4xl font-bold text-success"><AnimatedNumber value={taskStats.completed} /></p>
                                        <p className="text-xs sm:text-sm text-text-muted mt-1">{t("Completed")}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl sm:text-4xl font-bold text-error"><AnimatedNumber value={taskStats.blocked} /></p>
                                        <p className="text-xs sm:text-sm text-text-muted mt-1">{t("Blocked")}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className={cn("text-2xl sm:text-4xl font-bold", taskStats.completionPct >= 70 ? "text-success" : taskStats.completionPct >= 40 ? "text-warning" : "text-error")}>
                                            <AnimatedNumber value={taskStats.completionPct} suffix="%" />
                                        </p>
                                        <p className="text-xs sm:text-sm text-text-muted mt-1">{t("Completion")}</p>
                                    </div>
                                </div>
                                <div className="mt-4 h-3 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-700 progress-animated", getBarColor(taskStats.completionPct))}
                                        style={{ width: `$<AnimatedNumber value={taskStats.completionPct} suffix="%" />` }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Key Findings */}
                        <div>
                            <h3 className="text-lg font-semibold text-text-dark mb-4">{t("Key Findings")}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Strengths */}
                                {keyFindings.best.map((metric) => (
                                    <Card key={metric.id} className={isRTL ? "border-r-4 border-r-success" : "border-l-4 border-l-success"}>
                                        <CardContent className="p-5">
                                            <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse text-end")}>
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-light">
                                                    <TrendingUp className="h-5 w-5 text-success" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-text-dark">{td(metric.name)}</p>
                                                    <p className="text-2xl font-bold text-success mt-1">{metric.value}{metric.unit === "%" ? "%" : ` ${td(metric.unit)}`}</p>
                                                    <p className="text-sm text-text-secondary mt-1">{td(metric.description)}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {/* Concerns */}
                                {keyFindings.worst.map((metric) => (
                                    <Card key={metric.id} className={cn(isRTL ? "border-r-4" : "border-l-4", metric.status === MetricStatus.Critical ? (isRTL ? "border-r-error" : "border-l-error") : (isRTL ? "border-r-warning" : "border-l-warning"))}>
                                        <CardContent className="p-5">
                                            <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse text-end")}>
                                                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", metric.status === MetricStatus.Critical ? "bg-error-light" : "bg-warning-light")}>
                                                    <TrendingDown className={cn("h-5 w-5", metric.status === MetricStatus.Critical ? "text-error" : "text-warning")} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-text-dark">{td(metric.name)}</p>
                                                    <p className={cn("text-2xl font-bold mt-1", metric.status === MetricStatus.Critical ? "text-error" : "text-warning")}>
                                                        {metric.value}{metric.unit === "%" ? "%" : ` ${td(metric.unit)}`}
                                                    </p>
                                                    <p className="text-sm text-text-secondary mt-1">{td(metric.description)}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Recommendations */}
                        <Card>
                            <CardHeader>
                                <CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}>
                                    <Lightbulb className="h-5 w-5 text-warning" />
                                    {t("Recommendations")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {recommendations.map((rec, i) => (
                                        <li key={i} className={cn("flex items-start gap-3", isRTL && "flex-row-reverse text-end")}>
                                            <ArrowRight className={cn("h-4 w-4 text-primary mt-0.5 shrink-0", isRTL && "rotate-180")} />
                                            <p className="text-sm text-text-secondary leading-relaxed">{rec}</p>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tab 2: Friction Analysis */}
                <TabsContent value="friction">
                    <div className="space-y-6">
                        <div className="text-center pb-4 border-b border-border">
                            <h2 className="text-2xl font-bold text-text-dark">{t("Friction Analysis")}</h2>
                            <p className="text-sm text-text-secondary mt-1">
                                {t("Detailed breakdown of the six friction areas impacting team delivery")}
                            </p>
                        </div>

                        {frictionAreaConfig.map((area) => {
                            const score = sprintMetrics?.frictionScores[area.key] ?? 0;
                            const status = getScoreStatus(score);
                            const areaMetrics = getMetricsForArea(area.metricsFilter);
                            const AreaIcon = area.icon;

                            return (
                                <Card key={area.key}>
                                    <CardContent className="p-6">
                                        {/* Area Header */}
                                        <div className={cn("flex items-start justify-between mb-4", isRTL && "flex-row-reverse")}>
                                            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                                                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", score >= 80 ? "bg-success-light" : score >= 60 ? "bg-warning-light" : "bg-error-light")}>
                                                    <AreaIcon className={cn("h-5 w-5", area.color)} />
                                                </div>
                                                <div className={cn(isRTL && "text-end")}>
                                                    <h3 className="text-base font-semibold text-text-dark">{t(area.labelKey)}</h3>
                                                    <div className={cn("flex items-center gap-2 mt-0.5", isRTL && "flex-row-reverse")}>
                                                        <span className={cn("text-2xl font-bold", getScoreColor(score))}>{score}</span>
                                                        <span className="text-sm text-text-muted">/ 100</span>
                                                        <StatusBadge status={status} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="h-3 rounded-full bg-muted overflow-hidden mb-4">
                                            <div
                                                className={cn("h-full rounded-full transition-all duration-700 progress-animated", getBarColor(score))}
                                                style={{ width: `${score}%` }}
                                            />
                                        </div>

                                        {/* Description */}
                                        <p className={cn("text-sm text-text-secondary leading-relaxed mb-4", isRTL && "text-end")}>
                                            {td(area.description(score))}
                                        </p>

                                        {/* Related Metrics */}
                                        {areaMetrics.length > 0 && (
                                            <div>
                                                <p className={cn("text-xs font-medium text-text-muted uppercase tracking-wide mb-2", isRTL && "text-end")}>{t("Related Metrics")}</p>
                                                <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-2", isRTL && "[direction:rtl]")}>
                                                    {areaMetrics.map((m) => (
                                                        <MetricCard
                                                            key={m.id}
                                                            name={m.name}
                                                            value={m.value}
                                                            unit={m.unit}
                                                            status={m.status}
                                                            trend={m.trend}
                                                            trendPercent={m.trendPercent}
                                                            compact
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
