import { Activity, Circle, ClipboardList, Layers, User } from "lucide-react";

import { tasksConstants } from "@/constants";
import { TaskPhase } from "@/enums";
import { t } from "@/hooks";
import type { TaskMetaGridPropsInterface } from "@/interfaces";
import { statusLabel } from "@/lib/tasks";
import { Avatar, AvatarFallback } from "@/ui";
import { cn, formatDate } from "@/utils";

export const TaskMetaGrid = ({ task }: TaskMetaGridPropsInterface) => {
    const status = task.status ?? "backlog";
    const statusColorBg = tasksConstants.columnColors[status as TaskPhase] ?? "bg-text-muted";

    return (
        <div className="grid grid-cols-2 gap-4 mt-4 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-text-muted" />
                <div>
                    <p className="text-xs text-text-muted">{t("Assignee")}</p>
                    {task.assignee ? (
                        <div className="flex items-center gap-1 mt-0.5">
                            <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[8px]">{task.assignee.avatar_initials}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-text-dark">{task.assignee.full_name}</span>
                        </div>
                    ) : (
                        <span className="text-sm font-medium text-text-muted">{t("Unassigned")}</span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-text-muted" />
                <div>
                    <p className="text-xs text-text-muted">{t("Story Points")}</p>
                    <p className="text-sm font-medium text-text-dark">{task.story_points ?? "—"}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-text-muted" />
                <div>
                    <p className="text-xs text-text-muted">{t("Task Number")}</p>
                    <p className="text-sm font-medium text-text-dark">{task.task_number ?? task.id}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-text-muted" />
                <div>
                    <p className="text-xs text-text-muted">{t("Created")}</p>
                    <p className="text-sm font-medium text-text-dark">{formatDate(task.created_at ?? "")}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-text-muted" />
                <div>
                    <p className="text-xs text-text-muted">{t("Status")}</p>
                    <span className={cn("text-sm font-semibold", statusColorBg.replace("bg-", "text-"))}>
                        {t(statusLabel(status))}
                    </span>
                </div>
            </div>
            {task.estimated_hours && (
                <div className="flex items-center gap-2">
                    <Circle className="h-4 w-4 text-text-muted" />
                    <div>
                        <p className="text-xs text-text-muted">{t("Estimated Hours")}</p>
                        <p className="text-sm font-medium text-text-dark">{task.estimated_hours}h</p>
                    </div>
                </div>
            )}
        </div>
    );
};
