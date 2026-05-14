import { useMemo, useState } from "react";
import { GanttChart as GanttIcon } from "lucide-react";

import { EmptyState, Header } from "@/components/shared";
import { ganttSeed } from "@/data/seed";
import { GanttStatus } from "@/enums";
import { t } from "@/hooks";
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

    const filteredTasks = useMemo(() => {
        return ganttSeed.tasks.filter((task) => {
            if (filters.projectId !== "all" && task.project_id !== filters.projectId) return false;
            if (filters.status !== "all" && task.status !== filters.status) return false;
            if (filters.rangeStart && parseDate(task.end_date) < parseDate(filters.rangeStart)) return false;
            if (filters.rangeEnd && parseDate(task.start_date) > parseDate(filters.rangeEnd)) return false;
            return true;
        });
    }, [filters]);

    const { windowStart, windowEnd } = useMemo(() => {
        if (filters.rangeStart && filters.rangeEnd) {
            return { windowStart: filters.rangeStart, windowEnd: filters.rangeEnd };
        }
        if (filteredTasks.length === 0) {
            const now = Date.now();
            return {
                windowStart: toIso(now - 30 * DAY_MS),
                windowEnd: toIso(now + 60 * DAY_MS),
            };
        }
        const minStart = Math.min(...filteredTasks.map((task) => parseDate(task.start_date)));
        const maxEnd = Math.max(...filteredTasks.map((task) => parseDate(task.end_date)));
        return {
            windowStart: filters.rangeStart || toIso(minStart - 3 * DAY_MS),
            windowEnd: filters.rangeEnd || toIso(maxEnd + 3 * DAY_MS),
        };
    }, [filteredTasks, filters.rangeStart, filters.rangeEnd]);

    const summary = useMemo(() => {
        const total = filteredTasks.length;
        const byStatus = filteredTasks.reduce<Record<string, number>>((acc, task) => {
            acc[task.status] = (acc[task.status] ?? 0) + 1;
            return acc;
        }, {});
        return {
            total,
            inProgress: byStatus[GanttStatus.InProgress] ?? 0,
            completed: byStatus[GanttStatus.Completed] ?? 0,
            delayed: byStatus[GanttStatus.Delayed] ?? 0,
        };
    }, [filteredTasks]);

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
                projects={ganttSeed.projects}
                filters={filters}
                onChange={handleChange}
                onReset={handleReset}
                canReset={canReset}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <SummaryTile label={t("Tasks")} value={summary.total} />
                <SummaryTile label={t("In Progress")} value={summary.inProgress} tone="primary" />
                <SummaryTile label={t("Completed")} value={summary.completed} tone="success" />
                <SummaryTile label={t("Delayed")} value={summary.delayed} tone="error" />
            </div>

            {filteredTasks.length === 0 ? (
                <EmptyState
                    icon={GanttIcon}
                    title={t("No tasks match these filters")}
                    description={t("Adjust the project, date range, or status filter to see tasks on the timeline.")}
                />
            ) : (
                <div className="overflow-x-auto">
                    <GanttChart tasks={filteredTasks} windowStart={windowStart} windowEnd={windowEnd} />
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
