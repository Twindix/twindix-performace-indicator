import { AlertCircle, Clock, Link2 } from "lucide-react";

import { Badge } from "@/atoms";
import { tasksConstants } from "@/constants";
import { TaskPriority } from "@/enums";
import { t } from "@/hooks";
import type { TaskPipelineCardPropsInterface } from "@/interfaces";
import { capitalize } from "@/utils";

export const TaskPipelineCard = ({ task, onClick }: TaskPipelineCardPropsInterface) => (
    <div
        className="bg-surface rounded-lg p-3 border border-border shadow-sm hover:shadow-md hover:border-primary transition-all cursor-pointer"
        onClick={onClick}
    >
        <div className="flex items-start justify-between mb-2 gap-2">
            <span className="text-[10px] font-semibold text-text-muted shrink-0">
                {task.task_number ?? task.id}
            </span>
            <div className="flex items-center gap-1 flex-wrap justify-end">
                <Badge variant={tasksConstants.priorityVariants[task.priority as TaskPriority] ?? "default"} className="text-[9px] px-1.5 py-0.5">
                    {t(capitalize(task.priority))}
                </Badge>
                {task.is_blocked && <AlertCircle className="h-3.5 w-3.5 text-error shrink-0" />}
                {task.is_blocked_by_dependency && <Link2 className="h-3.5 w-3.5 text-error shrink-0" aria-label={t("Blocked by dependency")} />}
                {task.dead_time_status === "approaching" && <Clock className="h-3.5 w-3.5 text-warning shrink-0" aria-label={t("Approaching deadline")} />}
                {task.dead_time_status === "overdue" && <Clock className="h-3.5 w-3.5 text-error shrink-0" aria-label={t("Overdue")} />}
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
);
