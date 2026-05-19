import { useEffect, useMemo, useState } from "react";
import { GanttChart as GanttIcon } from "lucide-react";

import { EmptyState, Header } from "@/components/shared";
import { GanttStatus } from "@/enums";
import { t, useGanttTasks, useProjectsListLite, useSprintsList } from "@/hooks";
import type { GanttFiltersInterface } from "@/interfaces/gantt";
import { useSprintStore } from "@/store";

import { GanttChart } from "./GanttChart";
import { GanttFilters } from "./GanttFilters";

const DAY_MS = 24 * 60 * 60 * 1000;

const parseDate = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1).getTime();
};

const toIso = (ts: number) => new Date(ts).toISOString().slice(0, 10);

export const GanttView = () => {
    const { activeSprintId } = useSprintStore();
    const { sprints } = useSprintsList();
    const { projects } = useProjectsListLite();

    const [filters, setFilters] = useState<GanttFiltersInterface>({
        status: "all",
        mode: "sprint",
        entityId: activeSprintId ?? "",
    });

    // Update entityId when activeSprintId changes
    useEffect(() => {
        if (activeSprintId && filters.mode === "sprint" && filters.entityId !== activeSprintId) {
            setFilters((prev) => ({ ...prev, entityId: activeSprintId }));
        }
    }, [activeSprintId, filters.mode, filters.entityId]);

    const apiFilters = filters.status !== "all" ? { status: filters.status as GanttStatus } : undefined;
    const { tasks, isLoading } = useGanttTasks(filters.entityId, filters.mode, apiFilters);

    const { windowStart, windowEnd } = useMemo(() => {
        const datedTasks = tasks.filter((t) => t.start_date && t.due_date);
        if (datedTasks.length === 0) {
            const now = Date.now();
            return {
                windowStart: toIso(now - 30 * DAY_MS),
                windowEnd: toIso(now + 60 * DAY_MS),
            };
        }
        const minStart = Math.min(...datedTasks.map((task) => parseDate(task.start_date!)));
        const maxEnd = Math.max(...datedTasks.map((task) => parseDate(task.due_date!)));
        return {
            windowStart: toIso(minStart - 3 * DAY_MS),
            windowEnd: toIso(maxEnd + 3 * DAY_MS),
        };
    }, [tasks]);

    const totals = {
        total_tasks: tasks.length,
        in_progress: tasks.filter((t) => t.status === GanttStatus.InProgress).length,
        completed: tasks.filter((t) => t.status === GanttStatus.Completed).length,
        delayed: tasks.filter((t) => t.status === GanttStatus.Delayed).length,
    };

    const handleChange = (patch: Partial<GanttFiltersInterface>) =>
        setFilters((prev) => ({ ...prev, ...patch }));

    const handleReset = () => setFilters({ status: "all", mode: "sprint", entityId: activeSprintId ?? "" });

    const canReset = filters.status !== "all";

    return (
        <div>
            <Header
                title={t("Gantt")}
                description={t("Visualize task timelines by sprint or project.")}
            />

            <GanttFilters
                filters={filters}
                sprints={sprints}
                projects={projects}
                onChange={handleChange}
                onReset={handleReset}
                canReset={canReset}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <SummaryTile label={t("Tasks")} value={totals.total_tasks} />
                <SummaryTile label={t("In Progress")} value={totals.in_progress} tone="primary" />
                <SummaryTile label={t("Completed")} value={totals.completed} tone="success" />
                <SummaryTile label={t("Delayed")} value={totals.delayed} tone="error" />
            </div>

            {isLoading ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
                    {t("Loading gantt tasks...")}
                </div>
            ) : tasks.length === 0 ? (
                <EmptyState
                    icon={GanttIcon}
                    title={t("No tasks found")}
                    description={t("Select a sprint or project and adjust filters.")}
                />
            ) : (
                <div className="overflow-x-auto">
                    <GanttChart tasks={tasks} windowStart={windowStart} windowEnd={windowEnd} />
                </div>
            )}
        </div>
    );
};

interface SummaryTileProps {
    label: string;
    value: number;
    tone?: "default" | "primary" | "success" | "error";
}

const TONE_CLASS: Record<NonNullable<SummaryTileProps["tone"]>, string> = {
    default: "text-text-dark",
    primary: "text-primary-medium",
    success: "text-success",
    error: "text-error",
};

const SummaryTile = ({ label, value, tone = "default" }: SummaryTileProps) => (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
        <p className="text-[11px] uppercase tracking-wide text-text-muted">{label}</p>
        <p className={`text-xl font-bold mt-1 ${TONE_CLASS[tone]}`}>{value}</p>
    </div>
);
