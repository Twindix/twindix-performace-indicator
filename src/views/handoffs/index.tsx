import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Download, Settings, XCircle } from "lucide-react";

import { Badge, Button, Card, CardContent } from "@/atoms";
import { AnimatedNumber, EmptyState, Header } from "@/components/shared";
import {
    t,
    useHandoffsOverview,
    usePermissions,
    useProjectsListLite,
    useToggleHandoffCheck,
} from "@/hooks";
import { useQueryAction } from "@/hooks/shared";
import type { HandoffCriteriaSeedInterface, SprintInterface } from "@/interfaces";
import { projectsService } from "@/services";
import { useSprintStore } from "@/store";
import { cn, downloadCsv } from "@/utils";

import { ManageCriteriaDialog } from "./ManageCriteriaDialog";

export const HandoffsView = () => {
    const p = usePermissions();
    const { activeSprintId } = useSprintStore();
    const { projects } = useProjectsListLite();

    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [selectedSprintId, setSelectedSprintId] = useState<string>(activeSprintId ?? "");

    const { data: sprints = [] } = useQueryAction<SprintInterface[]>(
        () => projectsService.sprintsHandler(selectedProjectId),
        [selectedProjectId],
        { enabled: !!selectedProjectId, context: "handoffs.sprints", initialData: [] },
    );
    const [manageOpen, setManageOpen] = useState(false);

    // Auto-select first project if none selected
    useEffect(() => {
        if (!selectedProjectId && projects.length > 0) {
            setSelectedProjectId(projects[0].id);
        }
    }, [projects, selectedProjectId]);

    // Update selected sprint when active sprint changes
    useEffect(() => {
        if (activeSprintId && activeSprintId !== selectedSprintId) {
            setSelectedSprintId(activeSprintId);
        }
    }, [activeSprintId, selectedSprintId]);

    const { data, isLoading, refetch } = useHandoffsOverview(selectedProjectId, selectedSprintId);
    const { checkHandler, uncheckHandler, isLoading: isToggling } = useToggleHandoffCheck();

    console.log('[HandoffsView] State:', { 
        selectedProjectId, 
        selectedSprintId, 
        isLoading, 
        hasData: !!data,
        data 
    });

    const canToggle = p.handoffs.toggleCheck() && !isToggling;
    const canDownload = p.reports.downloadCSV();

    const handleDownloadCsv = () => {
        if (!data) return;
        const projectName = projects.find((pr) => pr.id === selectedProjectId)?.name ?? selectedProjectId;
        const sprintName = sprints.find((sp) => sp.id === selectedSprintId)?.name ?? selectedSprintId;
        const header = ["Summary", "Total Criteria", "Required Criteria", "Checked", "Required Checked", "Ready for Handoff"];
        const summary = ["", data.total_criteria, data.required_criteria, data.checked_count, data.required_checked_count, data.ready_for_handoff ? "Yes" : "No"];
        const cols = ["Criteria ID", "Title", "Description", "From Phase", "To Phase", "Required", "Checked", "Created At"];
        const rows = data.criteria.map((c) => [c.id, c.title, c.description ?? "", c.from_phase, c.to_phase, c.is_required ? "Yes" : "No", c.is_checked ? "Yes" : "No", c.created_at]);
        downloadCsv(`handoffs-${projectName}-${sprintName}.csv`, [header, summary, [], cols, ...rows]);
    };

    const handleToggle = async (criterion: HandoffCriteriaSeedInterface) => {
        if (!canToggle || !selectedSprintId) return;
        if (criterion.is_checked) {
            await uncheckHandler(criterion.id, selectedSprintId);
        } else {
            await checkHandler(criterion.id, selectedSprintId);
        }
        refetch();
    };

    const criteria = data?.criteria ?? [];
    const grouped = criteria.reduce<Record<string, HandoffCriteriaSeedInterface[]>>((acc, c) => {
        const key = `${c.from_phase} → ${c.to_phase}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(c);
        return acc;
    }, {});

    return (
        <div>
            <Header
                title={t("Handoff Tracker")}
                description={t("Phase transition criteria and handoff readiness")}
                actions={
                    <div className="flex items-center gap-2">
                        {canDownload && data && (
                            <Button size="sm" variant="outline" className="gap-1.5" onClick={handleDownloadCsv}>
                                <Download className="h-4 w-4" />
                                {t("Download CSV")}
                            </Button>
                        )}
                        {p.handoffs.manageCriteria() && (
                            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setManageOpen(true)}>
                                <Settings className="h-4 w-4" />
                                {t("Manage Criteria")}
                            </Button>
                        )}
                    </div>
                }
            />

            <div className="flex items-center gap-2 mb-4 flex-wrap">
                {projects.map((project) => (
                    <button
                        key={project.id}
                        type="button"
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

            <div className="flex items-center gap-2 mb-6 flex-wrap">
                {sprints.map((sprint) => (
                    <button
                        key={sprint.id}
                        type="button"
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

            {isLoading && !data ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
                    {t("Loading handoffs...")}
                </div>
            ) : !data ? (
                <EmptyState icon={ArrowRight} title={t("No Handoff Data")} description={t("No criteria found for this project/sprint.")} />
            ) : (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <StatCard label={t("Total Criteria")} value={data.total_criteria} />
                        <StatCard label={t("Required")} value={data.required_criteria} />
                        <StatCard label={t("Checked")} value={data.checked_count} tone="success" />
                        <div className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-3">
                            <div className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-full shrink-0",
                                data.ready_for_handoff ? "bg-success-light" : "bg-error-light",
                            )}>
                                {data.ready_for_handoff
                                    ? <CheckCircle2 className="h-5 w-5 text-success" />
                                    : <XCircle className="h-5 w-5 text-error" />
                                }
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-wide text-text-muted">{t("Status")}</p>
                                <p className={cn("text-sm font-bold", data.ready_for_handoff ? "text-success" : "text-error")}>
                                    {data.ready_for_handoff ? t("Ready") : t("Not Ready")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {criteria.length === 0 ? (
                        <EmptyState icon={ArrowRight} title={t("No Criteria")} description={t("No handoff criteria defined for this project.")} />
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {Object.entries(grouped).map(([transition, items]) => (
                                <Card key={transition}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xs font-semibold text-primary bg-primary-lighter px-2 py-1 rounded">
                                                {transition}
                                            </span>
                                            <Badge variant={items.every((c) => c.is_checked) ? "success" : "secondary"} className="text-[10px]">
                                                {items.filter((c) => c.is_checked).length}/{items.length}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            {items.map((c) => (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => handleToggle(c)}
                                                    disabled={!canToggle}
                                                    className={cn(
                                                        "flex items-center gap-2 text-left",
                                                        canToggle ? "cursor-pointer hover:opacity-80" : "cursor-default",
                                                    )}
                                                >
                                                    {c.is_checked ? (
                                                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-text-muted shrink-0" />
                                                    )}
                                                    <span className={cn("text-xs flex-1 text-left", c.is_checked ? "text-text-dark" : "text-text-muted")}>
                                                        {c.title}
                                                    </span>
                                                    {c.is_required && (
                                                        <span className="text-[10px] text-error font-semibold shrink-0">{t("Required")}</span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}

            <ManageCriteriaDialog
                open={manageOpen}
                onOpenChange={(next) => { setManageOpen(next); if (!next) refetch(); }}
                projectId={selectedProjectId}
            />
        </div>
    );
};

const StatCard = ({ label, value, tone }: { label: string; value: number; tone?: "success" }) => (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
        <p className="text-[11px] uppercase tracking-wide text-text-muted">{label}</p>
        <p className={cn("text-2xl font-bold mt-1", tone === "success" ? "text-success" : "text-text-dark")}>
            <AnimatedNumber value={value} />
        </p>
    </div>
);
