import { Circle, AlertCircle, Clock, Link2 } from "lucide-react";

import { Badge } from "@/atoms";
import { TaskPriority } from "@/enums";
import type { PipelineBoardInterface, TaskInterface, UserInterface } from "@/interfaces";
import { t } from "@/hooks";
import { cn } from "@/utils";

const PRIORITY_VARIANT: Record<string, "error" | "warning" | "default" | "secondary"> = {
    critical: "error",
    high: "warning",
    medium: "default",
    low: "secondary",
};

const COLUMN_COLOR_CLASS: Record<string, string> = {
    backlog: "text-slate-400",
    ready: "text-primary",
    in_progress: "text-warning",
    review: "text-purple-500",
    qa: "text-pink-500",
    done: "text-success",
};

export interface PipelineViewProps {
    pipeline: PipelineBoardInterface;
    members: UserInterface[];
    setSelectedTask: (task: TaskInterface) => void;
    setDialogOpen: (open: boolean) => void;
}

export const PipelineView = ({
    pipeline,
    setSelectedTask,
    setDialogOpen,
}: PipelineViewProps) => {
    const columns = Object.entries(pipeline);

    if (columns.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-text-muted text-sm">
                {t("No pipeline data available")}
            </div>
        );
    }

    return (
        <div className="flex flex-1 gap-4 pb-4 overflow-x-auto min-h-[calc(100vh-14rem)] bg-surface-body p-4 rounded-xl">
            {columns.map(([colKey, tasks]) => (
                <div
                    key={colKey}
                    className="flex flex-col w-80 shrink-0 bg-surface rounded-xl overflow-hidden border border-border shadow-sm"
                >
                    <div className="p-3 border-b border-border flex items-center justify-between sticky top-0 z-10 hidden-scrollbar bg-surface relative">
                        <h3 className="text-sm font-bold text-text-dark flex items-center gap-2">
                            <Circle className={cn("h-2.5 w-2.5 fill-current", COLUMN_COLOR_CLASS[colKey] ?? "text-text-muted")} />
                            {t(colKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))}
                        </h3>
                        <span className="text-[10px] font-semibold text-text-muted bg-muted px-2 py-0.5 rounded-full border border-border">
                            {tasks.length}
                        </span>
                    </div>

                    <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                        {tasks.length === 0 && (
                            <p className="text-xs text-text-muted italic text-center py-8">{t("No tasks")}</p>
                        )}
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className="bg-surface rounded-lg p-3 border border-border shadow-sm hover:shadow-md hover:border-primary transition-all cursor-pointer"
                                onClick={() => { setSelectedTask(task); setDialogOpen(true); }}
                            >
                                <div className="flex items-start justify-between mb-2 gap-2">
                                    <span className="text-[10px] font-semibold text-text-muted shrink-0">
                                        {task.task_number ?? task.id}
                                    </span>
                                    <div className="flex items-center gap-1 flex-wrap justify-end">
                                        <Badge variant={PRIORITY_VARIANT[task.priority as TaskPriority] ?? "default"} className="text-[9px] px-1.5 py-0.5">
                                            {t(task.priority.charAt(0).toUpperCase() + task.priority.slice(1))}
                                        </Badge>
                                        {task.is_blocked && (
                                            <AlertCircle className="h-3.5 w-3.5 text-error shrink-0" />
                                        )}
                                        {task.is_blocked_by_dependency && (
                                            <Link2 className="h-3.5 w-3.5 text-error shrink-0" aria-label={t("Blocked by dependency")} />
                                        )}
                                        {task.dead_time_status === "approaching" && (
                                            <Clock className="h-3.5 w-3.5 text-warning shrink-0" aria-label={t("Approaching deadline")} />
                                        )}
                                        {task.dead_time_status === "overdue" && (
                                            <Clock className="h-3.5 w-3.5 text-error shrink-0" aria-label={t("Overdue")} />
                                        )}
                                    </div>
                                </div>

                                <p className="text-sm font-medium text-text-dark mb-2 line-clamp-2">{task.title}</p>

                                <div className="flex items-center gap-1 flex-wrap mb-2">
                                    {task.tags.map((tag) => (
                                        <span key={typeof tag === "string" ? tag : tag.id} className="text-[9px] font-medium text-text-secondary bg-muted px-1.5 py-0.5 rounded">
                                            #{typeof tag === "string" ? tag : tag.tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-text-muted">
                                    {task.estimated_hours ? (
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {task.estimated_hours}h
                                        </span>
                                    ) : <span />}
                                    {task.assignee && (
                                        <span className="font-medium bg-primary/10 text-primary rounded-full px-1.5 py-0.5">
                                            {task.assignee.avatar_initials}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
