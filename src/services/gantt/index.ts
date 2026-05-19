import { apisData } from "@/data";
import type { GanttApiFiltersInterface, GanttResponseInterface, GanttTaskInterface } from "@/interfaces";
import { apiClient } from "@/lib/axios";

const normalizeTask = (t: any): GanttTaskInterface => ({
    id: t.id,
    code: t.code ?? "",
    title: t.title ?? "",
    status: t.status,
    priority: t.priority ?? "medium",
    start_date: t.start_date ?? null,
    due_date: t.due_date ?? t.end_date ?? null,
    progress: typeof t.progress === "number" ? t.progress : 0,
    assignee: t.assignee ? (typeof t.assignee === "object" ? (t.assignee.name ?? null) : t.assignee) : null,
    dependencies: Array.isArray(t.dependencies)
        ? t.dependencies
        : typeof t.dependencies === "string" && t.dependencies.trim()
            ? t.dependencies.split(",").map((s: string) => s.trim())
            : [],
    is_blocked: t.is_blocked ?? false,
    estimated_hours: t.estimated_hours != null ? Number(t.estimated_hours) : null,
});

export const ganttService = {
    bySprintHandler: async (sprintId: string, filters?: GanttApiFiltersInterface): Promise<GanttResponseInterface> => {
        const { data } = await apiClient.get<{ data: any }>(
            apisData.gantt.bySprint(sprintId),
            { params: filters },
        );
        const raw = data.data;
        return {
            sprint: raw.sprint,
            tasks: (raw.tasks ?? []).map(normalizeTask),
        };
    },

    byProjectHandler: async (projectId: string, filters?: GanttApiFiltersInterface): Promise<GanttResponseInterface> => {
        const { data } = await apiClient.get<{ data: any }>(
            apisData.gantt.byProject(projectId),
            { params: filters },
        );
        const raw = data.data;
        // Project mode returns {project, sprints:[]} — flatten sprint-level tasks
        const tasks: GanttTaskInterface[] = [];
        for (const sprint of raw.sprints ?? []) {
            if (Array.isArray(sprint.tasks)) {
                for (const t of sprint.tasks) tasks.push(normalizeTask(t));
            }
        }
        return {
            sprint: raw.project ? { id: raw.project.id, name: raw.project.name, start_date: raw.project.start_date ?? "", end_date: raw.project.end_date ?? "" } : { id: projectId, name: "", start_date: "", end_date: "" },
            tasks,
        };
    },
};
