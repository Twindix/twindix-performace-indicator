import { useMemo } from "react";
import { AlertTriangle, Clock, GitBranch, MessageSquare, Shield, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { Header, MetricCard, ScoreGauge, StatusBadge } from "@/components/shared";
import { MetricStatus } from "@/enums";
import { t, useSettings } from "@/hooks";
import type { SprintInterface, SprintMetricsInterface } from "@/interfaces";
import { useSprintStore } from "@/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui";
import { cn, getStorageItem, storageKeys } from "@/utils";

const frictionAreaConfig = [
    { key: "poorRequirements" as const, label: "Poor Requirements", icon: AlertTriangle, color: "bg-friction-requirements" },
    { key: "communicationGaps" as const, label: "Communication Gaps", icon: MessageSquare, color: "bg-friction-communication" },
    { key: "weakOwnership" as const, label: "Weak Ownership", icon: Shield, color: "bg-friction-ownership" },
    { key: "dependencyBlockers" as const, label: "Dependency Blockers", icon: GitBranch, color: "bg-friction-dependencies" },
    { key: "processGaps" as const, label: "Process Gaps", icon: Clock, color: "bg-friction-process" },
    { key: "teamCulture" as const, label: "Team & Culture", icon: Users, color: "bg-friction-team" },
];

const sprintColors: Record<string, { bar: string; text: string; label: string }> = {
    "spr-012": { bar: "bg-primary-lighter", text: "text-primary-medium", label: "Sprint 12" },
    "spr-013": { bar: "bg-warning-light", text: "text-warning", label: "Sprint 13" },
    "spr-014": { bar: "bg-success-light", text: "text-success", label: "Sprint 14" },
};

const getScoreStatus = (score: number): MetricStatus => {
    if (score >= 80) return MetricStatus.Healthy;
    if (score >= 60) return MetricStatus.Warning;
    return MetricStatus.Critical;
};

const getBarColor = (score: number): string => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-error";
};

export const AnalyticsView = () => {
    useSettings();
    const { activeSprintId } = useSprintStore();
    const allMetrics = getStorageItem<SprintMetricsInterface[]>(storageKeys.metrics) ?? [];
    const sprints = getStorageItem<SprintInterface[]>(storageKeys.sprints) ?? [];

    const orderedSprintIds = ["spr-012", "spr-013", "spr-014"];

    const sprintMetricsMap = useMemo(() => {
        const map: Record<string, SprintMetricsInterface> = {};
        for (const m of allMetrics) {
            map[m.sprintId] = m;
        }
        return map;
    }, [allMetrics]);

    const activeMetrics = sprintMetricsMap[activeSprintId];

    // Gather all unique metric names across sprints for trend comparison
    const allMetricNames = useMemo(() => {
        const names = new Set<string>();
        for (const sm of allMetrics) {
            for (const m of sm.metrics) {
                names.add(m.name);
            }
        }
        return Array.from(names);
    }, [allMetrics]);

    return (
        <div>
            <Header
                title={t("Sprint Analytics")}
                description={t("Compare metrics across sprints and track improvement trends")}
            />

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="metrics">All Metrics</TabsTrigger>
                    <TabsTrigger value="trends">Sprint Trends</TabsTrigger>
                    <TabsTrigger value="friction">Friction Breakdown</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview">
                    {/* Sprint Comparison - Health Scores */}
                    <h2 className="text-lg font-semibold text-text-dark mb-4">Sprint Health Comparison</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        {orderedSprintIds.map((sprintId) => {
                            const data = sprintMetricsMap[sprintId];
                            const sprint = sprints.find((s) => s.id === sprintId);
                            const score = data?.healthScore ?? 0;
                            const isActive = sprintId === activeSprintId;
                            return (
                                <Card key={sprintId} className={cn(isActive && "ring-2 ring-primary")}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-center">
                                            {sprint?.name ?? sprintId}
                                            {isActive && (
                                                <span className="ml-2 text-xs text-primary font-normal">(Active)</span>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center gap-3">
                                        <ScoreGauge score={score} size="lg" label="Health" />
                                        <StatusBadge status={getScoreStatus(score)} />
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Quick Metrics for Active Sprint */}
                    {activeMetrics && (
                        <>
                            <h2 className="text-lg font-semibold text-text-dark mb-3">
                                Key Metrics - {sprints.find((s) => s.id === activeSprintId)?.name ?? activeSprintId}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {activeMetrics.metrics.slice(0, 8).map((m) => (
                                    <MetricCard
                                        key={m.id}
                                        name={m.name}
                                        value={m.value}
                                        unit={m.unit}
                                        status={m.status}
                                        trend={m.trend}
                                        trendPercent={m.trendPercent}
                                        description={m.description}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </TabsContent>

                {/* All Metrics Tab */}
                <TabsContent value="metrics">
                    <h2 className="text-lg font-semibold text-text-dark mb-4">
                        All Metrics - {sprints.find((s) => s.id === activeSprintId)?.name ?? activeSprintId}
                    </h2>
                    {activeMetrics ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {activeMetrics.metrics.map((m) => (
                                <MetricCard
                                    key={m.id}
                                    name={m.name}
                                    value={m.value}
                                    unit={m.unit}
                                    status={m.status}
                                    trend={m.trend}
                                    trendPercent={m.trendPercent}
                                    description={m.description}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-text-muted text-center py-8">No metrics data available for this sprint.</p>
                    )}
                </TabsContent>

                {/* Sprint-over-Sprint Trends Tab */}
                <TabsContent value="trends">
                    <h2 className="text-lg font-semibold text-text-dark mb-4">Sprint-over-Sprint Trends</h2>

                    {/* Legend */}
                    <div className="flex items-center gap-4 mb-6">
                        {orderedSprintIds.map((id) => (
                            <div key={id} className="flex items-center gap-2">
                                <div className={cn("h-3 w-3 rounded-sm", sprintColors[id]?.bar ?? "bg-muted")} />
                                <span className="text-xs text-text-secondary">{sprintColors[id]?.label ?? id}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-4">
                        {allMetricNames.map((metricName) => {
                            const values = orderedSprintIds.map((sprintId) => {
                                const sm = sprintMetricsMap[sprintId];
                                const metric = sm?.metrics.find((m) => m.name === metricName);
                                return { sprintId, value: metric?.value ?? 0, unit: metric?.unit ?? "" };
                            });
                            const maxVal = Math.max(...values.map((v) => v.value), 1);

                            return (
                                <Card key={metricName}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-semibold text-text-dark">{metricName}</h3>
                                            <span className="text-xs text-text-muted">{values[0].unit}</span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {values.map(({ sprintId, value }) => {
                                                const config = sprintColors[sprintId];
                                                const widthPercent = maxVal > 0 ? (value / maxVal) * 100 : 0;
                                                return (
                                                    <div key={sprintId} className="flex items-center gap-3">
                                                        <span className="text-xs text-text-muted w-16 shrink-0">{config?.label ?? sprintId}</span>
                                                        <div className="flex-1 h-5 rounded bg-muted overflow-hidden">
                                                            <div
                                                                className={cn("h-full rounded transition-all duration-500", config?.bar ?? "bg-primary")}
                                                                style={{ width: `${Math.max(widthPercent, 2)}%` }}
                                                            />
                                                        </div>
                                                        <span className={cn("text-xs font-bold w-12 text-right", config?.text ?? "text-text-dark")}>
                                                            {value}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* Friction Breakdown Tab */}
                <TabsContent value="friction">
                    <h2 className="text-lg font-semibold text-text-dark mb-4">Health Score Breakdown</h2>

                    {activeMetrics ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Overall Score */}
                            <Card className="md:col-span-2">
                                <CardContent className="p-6 flex items-center gap-6">
                                    <ScoreGauge score={activeMetrics.healthScore} size="md" label="Overall" />
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-text-dark mb-1">Overall Health Score</h3>
                                        <p className="text-sm text-text-secondary mb-3">
                                            Composite score derived from 6 friction areas. Each area contributes to the overall sprint health.
                                        </p>
                                        <StatusBadge status={getScoreStatus(activeMetrics.healthScore)} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Friction Area Progress Bars */}
                            {frictionAreaConfig.map(({ key, label, icon: Icon }) => {
                                const score = activeMetrics.frictionScores[key] ?? 0;
                                return (
                                    <Card key={key}>
                                        <CardContent className="p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4 text-text-secondary" />
                                                    <h4 className="text-sm font-semibold text-text-dark">{label}</h4>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("text-lg font-bold", score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-error")}>{score}</span>
                                                    <StatusBadge status={getScoreStatus(score)} />
                                                </div>
                                            </div>
                                            <div className="h-3 rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full transition-all duration-500", getBarColor(score))}
                                                    style={{ width: `${score}%` }}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-text-muted text-center py-8">No friction data available for this sprint.</p>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};
