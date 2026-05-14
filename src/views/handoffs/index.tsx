import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, XCircle, ArrowRightLeft, BarChart3, FolderKanban, Layers, Target } from "lucide-react";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { AnimatedNumber, EmptyState, Header } from "@/components/shared";
import { handoffsSeed, timeSeed } from "@/data";
import { t, useSettings } from "@/hooks";
import type { CriterionInterface, HandoffInterface } from "@/interfaces";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui";
import { cn, td } from "@/utils";

const PIPELINE_PHASE_KEYS = ["Product", "Design", "Development", "Code Review", "QA", "Done"];

const getCompletionColor = (rate: number): string => {
    if (rate >= 100) return "bg-success";
    if (rate >= 80) return "bg-primary";
    if (rate >= 60) return "bg-warning";
    return "bg-error";
};

const getCompletionTextColor = (rate: number): string => {
    if (rate >= 100) return "text-success";
    if (rate >= 80) return "text-primary";
    if (rate >= 60) return "text-warning";
    return "text-error";
};

const getCompletionBgColor = (rate: number): string => {
    if (rate >= 100) return "bg-success-light";
    if (rate >= 80) return "bg-primary-lighter";
    if (rate >= 60) return "bg-warning-light";
    return "bg-error-light";
};

const CriteriaList = ({ title, criteria }: { title: string; criteria: CriterionInterface[] }) => (
    <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">{title}</p>
        <div className="flex flex-col gap-1.5">
            {criteria.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                    {c.met ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" /> : <XCircle className="h-4 w-4 text-text-muted shrink-0" />}
                    <span className={cn("text-xs", c.met ? "text-text-dark" : "text-text-muted")}>{td(c.label)}</span>
                </div>
            ))}
        </div>
    </div>
);

const StatsRow = ({ stats }: { stats: { total: number; avgCompletion: number; fullyCompleted: number; belowThreshold: number } }) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-lighter"><ArrowRightLeft className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={stats.total} /></p><p className="text-xs text-text-muted">{t("Total Handoffs")}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-lighter"><BarChart3 className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={stats.avgCompletion} suffix="%" /></p><p className="text-xs text-text-muted">{t("Avg Completion")}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-light"><Target className="h-5 w-5 text-success" /></div><div><p className="text-2xl font-bold text-success"><AnimatedNumber value={stats.fullyCompleted} /></p><p className="text-xs text-text-muted">{t("Fully Completed")}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-light"><XCircle className="h-5 w-5 text-error" /></div><div><p className="text-2xl font-bold text-error"><AnimatedNumber value={stats.belowThreshold} /></p><p className="text-xs text-text-muted">{t("Below Threshold")}</p></div></div></CardContent></Card>
    </div>
);

const HandoffCards = ({ handoffs }: { handoffs: HandoffInterface[] }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {handoffs.map((handoff) => {
            const rate = handoff.completionRate;
            return (
                <Card key={handoff.id} className={cn("overflow-hidden", rate < 60 && "border-error/40")}>
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", getCompletionBgColor(rate))}>
                                    <ArrowRight className={cn("h-4 w-4", getCompletionTextColor(rate))} />
                                </div>
                                <div className="min-w-0">
                                    <CardTitle className="text-sm">
                                        {t(handoff.fromPhase)} <ArrowRight className="inline h-3.5 w-3.5 mx-0.5" /> {t(handoff.toPhase)}
                                    </CardTitle>
                                    <p className="text-xs text-text-muted mt-0.5">{t("Task")}: {handoff.taskId}</p>
                                </div>
                            </div>
                            <Badge variant={rate >= 100 ? "success" : rate >= 80 ? "default" : rate >= 60 ? "warning" : "error"}>{rate}%</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-text-muted">{t("Completion")}</span>
                                <span className={cn("text-xs font-bold", getCompletionTextColor(rate))}><AnimatedNumber value={rate} suffix="%" /></span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div className={cn("h-full rounded-full transition-all duration-500", getCompletionColor(rate))} style={{ width: `${Math.min(rate, 100)}%` }} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <CriteriaList title={t("Entry Criteria")} criteria={handoff.entryCriteria} />
                            <CriteriaList title={t("Exit Criteria")} criteria={handoff.exitCriteria} />
                        </div>
                    </CardContent>
                </Card>
            );
        })}
    </div>
);

const computeStats = (handoffs: HandoffInterface[]) => {
    const total = handoffs.length;
    const avgCompletion = total > 0 ? Math.round(handoffs.reduce((sum, h) => sum + h.completionRate, 0) / total) : 0;
    const fullyCompleted = handoffs.filter((h) => h.completionRate >= 100).length;
    const belowThreshold = handoffs.filter((h) => h.completionRate < 80).length;
    return { total, avgCompletion, fullyCompleted, belowThreshold };
};

export const HandoffsView = () => {
    useSettings();

    const [scope, setScope] = useState<"sprint" | "project">("sprint");
    const [selectedSprintId, setSelectedSprintId] = useState<string>(timeSeed.sprints.find((s) => s.status === "active")?.id ?? timeSeed.sprints[0]?.id ?? "");
    const [selectedProjectId, setSelectedProjectId] = useState<string>(timeSeed.projects[0]?.id ?? "");

    const sprintHandoffs = useMemo(
        () => handoffsSeed.filter((h) => h.sprintId === selectedSprintId),
        [selectedSprintId],
    );

    const projectHandoffs = useMemo(() => {
        const projectSprintIds = new Set(timeSeed.sprints.filter((s) => s.project_id === selectedProjectId).map((s) => s.id));
        return handoffsSeed.filter((h) => projectSprintIds.has(h.sprintId));
    }, [selectedProjectId]);

    const sprintStats = useMemo(() => computeStats(sprintHandoffs), [sprintHandoffs]);
    const projectStats = useMemo(() => computeStats(projectHandoffs), [projectHandoffs]);

    if (handoffsSeed.length === 0) {
        return (
            <div>
                <Header title={t("Handoff Tracker")} description={t("Phase transition quality, scoped by project or sprint")} />
                <EmptyState icon={ArrowRightLeft} title={t("No Handoffs")} description={t("No handoff data available")} />
            </div>
        );
    }

    return (
        <div>
            <Header title={t("Handoff Tracker")} description={t("Phase transition quality, scoped by project or sprint")} />

            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="grid grid-cols-3 sm:flex sm:items-center sm:justify-center gap-1 sm:gap-1">
                        {PIPELINE_PHASE_KEYS.map((phase, i) => (
                            <div key={phase} className="flex items-center gap-1">
                                <div className="flex items-center justify-center rounded-lg bg-primary-lighter px-2 sm:px-3 py-2 w-full sm:w-auto">
                                    <span className="text-[10px] sm:text-xs font-semibold text-primary whitespace-nowrap">{t(phase)}</span>
                                </div>
                                {i < PIPELINE_PHASE_KEYS.length - 1 && (
                                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-text-muted shrink-0 hidden sm:block" />
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Tabs value={scope} onValueChange={(v) => setScope(v as typeof scope)}>
                <TabsList className="mb-4">
                    <TabsTrigger value="sprint"><Layers className="h-4 w-4 me-1.5" />{t("By Sprint")}</TabsTrigger>
                    <TabsTrigger value="project"><FolderKanban className="h-4 w-4 me-1.5" />{t("By Project")}</TabsTrigger>
                </TabsList>

                <TabsContent value="sprint">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {timeSeed.sprints.map((sprint) => (
                            <button
                                key={sprint.id}
                                onClick={() => setSelectedSprintId(sprint.id)}
                                className={cn(
                                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                                    selectedSprintId === sprint.id
                                        ? "border-primary bg-primary-lighter text-primary"
                                        : "border-border text-text-muted hover:text-text-dark hover:bg-muted/40",
                                )}
                            >
                                {sprint.name}
                            </button>
                        ))}
                    </div>
                    <StatsRow stats={sprintStats} />
                    {sprintHandoffs.length > 0 ? <HandoffCards handoffs={sprintHandoffs} /> : <EmptyState icon={ArrowRightLeft} title={t("No Handoffs")} description={t("No handoffs for this sprint")} />}
                </TabsContent>

                <TabsContent value="project">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {timeSeed.projects.map((project) => (
                            <button
                                key={project.id}
                                onClick={() => setSelectedProjectId(project.id)}
                                className={cn(
                                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                                    selectedProjectId === project.id
                                        ? "border-primary bg-primary-lighter text-primary"
                                        : "border-border text-text-muted hover:text-text-dark hover:bg-muted/40",
                                )}
                            >
                                {project.name}
                            </button>
                        ))}
                    </div>
                    <StatsRow stats={projectStats} />
                    {projectHandoffs.length > 0 ? <HandoffCards handoffs={projectHandoffs} /> : <EmptyState icon={ArrowRightLeft} title={t("No Handoffs")} description={t("No handoffs for this project")} />}
                </TabsContent>
            </Tabs>
        </div>
    );
};
