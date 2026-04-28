import { Clock, Link2, Lock } from "lucide-react";

import { Badge } from "@/atoms";
import { tasksConstants } from "@/constants";
import { TaskPhase, TaskPriority } from "@/enums";
import { t } from "@/hooks";
import type { TaskKanbanCardPropsInterface } from "@/interfaces";
import { capitalize, cn } from "@/utils";

export const TaskKanbanCard = ({ task, onClick }: TaskKanbanCardPropsInterface) => {
    const blockedByDep = task.is_blocked_by_dependency === true;
    const columnColor = tasksConstants.columnColors[(task.status ?? TaskPhase.Backlog) as TaskPhase] ?? "bg-text-muted";

    return (
        <div
            className={cn(
                "bg-surface rounded-lg p-3 border shadow-sm hover:shadow-md transition-all z-20 pointer-events-auto relative cursor-pointer",
                task.is_blocked || blockedByDep ? "border-error bg-error/5" : "border-border",
                !task.is_blocked && !blockedByDep && "hover:border-primary",
            )}
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0", columnColor, "text-white")}>
                        {task.task_number ?? task.id}
                    </span>
                    {task.is_blocked && <Lock className="h-3 w-3 text-error shrink-0" />}
                    {blockedByDep && <Link2 className="h-3 w-3 text-error shrink-0" aria-label={t("Blocked by dependency")} />}
                    {task.dead_time_status === "approaching" && <Clock className="h-3 w-3 text-warning shrink-0" aria-label={t("Approaching deadline")} />}
                    {task.dead_time_status === "overdue" && <Clock className="h-3 w-3 text-error shrink-0" aria-label={t("Overdue")} />}
                </div>
            </div>

            <h4 className="text-sm font-semibold text-text-dark mb-2 leading-tight line-clamp-2">{task.title}</h4>

            <div className="flex items-center gap-1 mb-3 flex-wrap">
                {task.tags.map((tag) => (
                    <span key={typeof tag === "string" ? tag : tag.id} className="text-[9px] font-medium text-text-secondary bg-muted px-1.5 py-0.5 rounded">
                        #{typeof tag === "string" ? tag : tag.tag}
                    </span>
                ))}
            </div>

            <div className="flex items-center gap-1.5">
                <Badge variant={tasksConstants.priorityVariants[task.priority as TaskPriority] ?? "default"} className="text-[9px] px-1.5 py-0.5 rounded shadow-sm relative z-30">
                    {t(capitalize(task.priority))}
                </Badge>
                {(task.story_points ?? 0) > 0 && (
                    <span className="text-[10px] font-semibold text-text-muted bg-muted rounded-full h-5 w-5 flex items-center justify-center relative z-30">
                        {task.story_points}
                    </span>
                )}
                {task.assignee && (
                    <span className="ml-auto text-[10px] font-medium bg-primary/10 text-primary rounded-full px-1.5 py-0.5">
                        {task.assignee.avatar_initials}
                    </span>
                )}
            </div>
        </div>
    );
};
