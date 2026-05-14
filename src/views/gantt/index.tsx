import { useMemo, useState } from "react";
import { GanttChart as GanttIcon } from "lucide-react";

import { EmptyState, Header } from "@/components/shared";
import { GanttStatus } from "@/enums";
import { t, useGanttTasks, useProjectsListLite } from "@/hooks";
import type { GanttFiltersInterface } from "@/interfaces/gantt";

import { GanttChart } from "./GanttChart";
import { GanttFilters } from "./GanttFilters";

const DAY_MS = 24 * 60 * 60 * 1000;

const parseDate = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1).getTime();
};

const toIso = (ts: number) => new Date(ts).toISOString().slice(0, 10);

const defaultFilters: GanttFiltersInterface = {
    projectId: "all",
    status: "all",
    rangeStart: "",
    rangeEnd: "",
};

export const GanttView = () => {
    const [filters, setFilters] = useState<GanttFiltersInterface>(defaultFilters);
    const { projects } = useProjectsListLite();

    const apiFilters = useMemo(() => ({
        project_id: filters.projectId !== "all" ? filters.projectId : undefined,
        status: filters.status !== "all" ? (filters.status as GanttStatus) : undefined,
        from: filters.rangeStart || undefined,
        to: filters.rangeEnd || undefined,
    }), [filters]);

    const { tasks, summary, isLoading } = useGanttTasks(apiFilters);

    const { windowStart, windowEnd } = useMemo(() => {
        if (filters.rangeStart && filters.rangeEnd) {
            return { windowStart: filters.rangeStart, windowEnd: filters.rangeEnd };
        }
        if (tasks.length === 0) {
            const now = Date.now();
            return {
                windowStart: toIso(now - 30 * DAY_MS),
                windowEnd: toIso(now + 60 * DAY_MS),
            };
        }
        const minStart = Math.min(...tasks.map((task) => parseDate(task.start_date)));
        const maxEnd = Math.max(...tasks.map((task) => parseDate(task.end_date)));
        return {
            windowStart: filters.rangeStart || toIso(minStart - 3 * DAY_MS),
            windowEnd: filters.rangeEnd || toIso(maxEnd + 3 * DAY_MS),
        };
    }, [tasks, filters.rangeStart, filters.rangeEnd]);

    const totals = summary ?? {
        total_tasks: tasks.length,
        in_progress: 0,
        completed: 0,
        delayed: 0,
    };

    const canReset =
        filters.projectId !== "all" ||
        filters.status !== "all" ||
        filters.rangeStart !== "" ||
        filters.rangeEnd !== "";

    const handleChange = (patch: Partial<GanttFiltersInterface>) =>
        setFilters((prev) => ({ ...prev, ...patch }));

    const handleReset = () => setFilters(defaultFilters);

    return (
        <div>
            <Header
                title={t("Gantt")}
                description={t("Visualize task timelines across projects. Filter by project, date range, or status.")}
            />

            <GanttFilters
                projects={projects}
                filters={filters}
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
                    title={t("No tasks match these filters")}
                    description={t("Adjust the project, date range, or status filter to see tasks on the timeline.")}
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
