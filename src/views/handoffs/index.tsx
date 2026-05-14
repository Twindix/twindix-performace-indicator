import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, XCircle, ArrowRightLeft, BarChart3, FolderKanban, Layers, Settings } from "lucide-react";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { AnimatedNumber, EmptyState, Header } from "@/components/shared";
import {
    t,
    usePermissions,
    useProjectsListLite,
    useSprintsList,
    useHandoffsOverview,
    useToggleHandoffCheck,
} from "@/hooks";
import type {
    HandoffCriterionInterface,
    HandoffTransitionInterface,
    HandoffsResponseInterface,
} from "@/interfaces";
import { useSprintStore } from "@/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui";
import { cn, td } from "@/utils";

import { ManageCriteriaDialog } from "./ManageCriteriaDialog";

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

const CriteriaList = ({
    title,
    criteria,
    taskId,
    canToggle,
    onToggle,
}: {
    title: string;
    criteria: HandoffCriterionInterface[];
    taskId: string;
    canToggle: boolean;
    onToggle: (taskId: string, criteriaId: string) => void;
}) => (
    <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">{title}</p>
        <div className="flex flex-col gap-1.5">
            {criteria.map((c) => (
                <button
                    key={c.id}
                    type="button"
                    onClick={() => canToggle && onToggle(taskId, c.id)}
                    disabled={!canToggle}
                    className={cn(
                        "flex items-center gap-2 text-left",
                        canToggle ? "cursor-pointer hover:opacity-80" : "cursor-default",
                    )}
                >
                    {c.checked ? (
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    ) : (
                        <XCircle className="h-4 w-4 text-text-muted shrink-0" />
                    )}
                    <span className={cn("text-xs", c.checked ? "text-text-dark" : "text-text-muted")}>{td(c.label)}</span>
                </button>
            ))}
        </div>
    </div>
);

const StatsRow = ({ stats }: { stats: HandoffsResponseInterface["summary"] }) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-lighter"><ArrowRightLeft className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={stats.total_handoffs} /></p><p className="text-xs text-text-muted">{t("Total Handoffs")}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-lighter"><BarChart3 className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold text-text-dark"><AnimatedNumber value={stats.avg_completion} suffix="%" /></p><p className="text-xs text-text-muted">{t("Avg Completion")}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-light"><CheckCircle2 className="h-5 w-5 text-success" /></div><div><p className="text-2xl font-bold text-success"><AnimatedNumber value={stats.fully_completed} /></p><p className="text-xs text-text-muted">{t("Fully Completed")}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-light"><XCircle className="h-5 w-5 text-error" /></div><div><p className="text-2xl font-bold text-error"><AnimatedNumber value={stats.below_threshold} /></p><p className="text-xs text-text-muted">{t("Below Threshold")}</p></div></div></CardContent></Card>
    </div>
);

const HandoffCards = ({
    handoffs,
    canToggle,
    onToggle,
}: {
    handoffs: HandoffTransitionInterface[];
    canToggle: boolean;
    onToggle: (taskId: string, criteriaId: string) => void;
}) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {handoffs.map((handoff) => {
            const rate = handoff.completion;
            return (
                <Card key={`${handoff.task_id}-${handoff.from_phase}-${handoff.to_phase}`} className={cn("overflow-hidden", rate < 60 && "border-error/40")}>
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", getCompletionBgColor(rate))}>
                                    <ArrowRight className={cn("h-4 w-4", getCompletionTextColor(rate))} />
                                </div>
                                <div className="min-w-0">
                                    <CardTitle className="text-sm">
                                        {t(handoff.from_phase)} <ArrowRight className="inline h-3.5 w-3.5 mx-0.5" /> {t(handoff.to_phase)}
                                    </CardTitle>
                                    <p className="text-xs text-text-muted mt-0.5">{t("Task")}: {handoff.task_code}</p>
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
                            <CriteriaList title={t("Entry Criteria")} criteria={handoff.entry_criteria} taskId={handoff.task_id} canToggle={canToggle} onToggle={onToggle} />
                            <CriteriaList title={t("Exit Criteria")} criteria={handoff.exit_criteria} taskId={handoff.task_id} canToggle={canToggle} onToggle={onToggle} />
                        </div>
                    </CardContent>
                </Card>
            );
        })}
    </div>
);

export const HandoffsView = () => {
    const p = usePermissions();
    const activeSprintId = useSprintStore((s) => s.activeSprintId);
    const { sprints } = useSprintsList();
    const { projects } = useProjectsListLite();

    const [scope, setScope] = useState<"sprint" | "project">("sprint");
    const [selectedSprintId, setSelectedSprintId] = useState<string>(activeSprintId ?? "");
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [manageOpen, setManageOpen] = useState(false);

    const filters = useMemo(() => {
        if (scope === "sprint") {
            return { scope: "sprint" as const, sprint_id: selectedSprintId || undefined };
        }
        return { scope: "project" as const, project_id: selectedProjectId || undefined };
    }, [scope, selectedSprintId, selectedProjectId]);

    const { data, isLoading, refetch, setData } = useHandoffsOverview(filters);
    const { toggleHandler, isLoading: isToggling } = useToggleHandoffCheck();

    const canToggle = p.handoffs.toggleCheck() && !isToggling;

    const onToggle = async (taskId: string, criteriaId: string) => {
        const updated = await toggleHandler(taskId, criteriaId);
        if (!updated || !data) return;
        // Patch local state with updated transition completion + criteria check states
        setData({
            ...data,
            transitions: data.transitions.map((tr) =>
                tr.task_id === taskId && tr.from_phase === updated.from_phase && tr.to_phase === updated.to_phase
                    ? {
                        ...tr,
                        completion: updated.completion,
                        entry_criteria: updated.entry_criteria,
                        exit_criteria: updated.exit_criteria,
                    }
                    : tr,
            ),
        });
        // Recompute summary by refetching (cheap) — keeps avg/fully/below correct
        refetch();
    };

    const handoffs = data?.transitions ?? [];
    const summary = data?.summary ?? { total_handoffs: 0, avg_completion: 0, fully_completed: 0, below_threshold: 0 };
    const phases = data?.phases ?? ["Product", "Design", "Development", "Code Review", "QA", "Done"];

    return (
        <div>
            <Header
                title={t("Handoff Tracker")}
                description={t("Phase transition quality, scoped by project or sprint")}
                actions={p.handoffs.manageCriteria() ? (
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setManageOpen(true)}>
                        <Settings className="h-4 w-4" />
                        {t("Manage Criteria")}
                    </Button>
                ) : null}
            />

            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="grid grid-cols-3 sm:flex sm:items-center sm:justify-center gap-1 sm:gap-1">
                        {phases.map((phase, i) => (
                            <div key={phase} className="flex items-center gap-1">
                                <div className="flex items-center justify-center rounded-lg bg-primary-lighter px-2 sm:px-3 py-2 w-full sm:w-auto">
                                    <span className="text-[10px] sm:text-xs font-semibold text-primary whitespace-nowrap">{t(phase)}</span>
                                </div>
                                {i < phases.length - 1 && (
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
                        {sprints.map((sprint) => (
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
                    {isLoading && handoffs.length === 0 ? (
                        <LoadingTile />
                    ) : (
                        <>
                            <StatsRow stats={summary} />
                            {handoffs.length > 0 ? (
                                <HandoffCards handoffs={handoffs} canToggle={canToggle} onToggle={onToggle} />
                            ) : (
                                <EmptyState icon={ArrowRightLeft} title={t("No Handoffs")} description={t("No handoffs for this sprint")} />
                            )}
                        </>
                    )}
                </TabsContent>

                <TabsContent value="project">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {projects.map((project) => (
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
                    {isLoading && handoffs.length === 0 ? (
                        <LoadingTile />
                    ) : (
                        <>
                            <StatsRow stats={summary} />
                            {handoffs.length > 0 ? (
                                <HandoffCards handoffs={handoffs} canToggle={canToggle} onToggle={onToggle} />
                            ) : (
                                <EmptyState icon={ArrowRightLeft} title={t("No Handoffs")} description={t("No handoffs for this project")} />
                            )}
                        </>
                    )}
                </TabsContent>
            </Tabs>

            <ManageCriteriaDialog
                open={manageOpen}
                onOpenChange={(next) => { setManageOpen(next); if (!next) refetch(); }}
                phases={phases}
            />
        </div>
    );
};

const LoadingTile = () => (
    <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
        {t("Loading handoffs...")}
    </div>
);
