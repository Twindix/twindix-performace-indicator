import { AlertCircle, Trash2 } from "lucide-react";

import { Badge, Button } from "@/atoms";
import { tasksConstants } from "@/constants";
import { TaskPriority } from "@/enums";
import { t } from "@/hooks";
import type { TaskDetailHeaderPropsInterface } from "@/interfaces";
import { DialogDescription, DialogHeader, DialogTitle } from "@/ui";
import { capitalize } from "@/utils";

export const TaskDetailHeader = ({ task, canDelete, onRequestDelete }: TaskDetailHeaderPropsInterface) => (
    <DialogHeader>
        <div className="flex items-center gap-2 mb-1">
            <Badge variant={tasksConstants.priorityVariants[task.priority as TaskPriority] ?? "default"}>
                {t(capitalize(task.priority))}
            </Badge>
            {task.is_blocked && (
                <Badge variant="error">
                    <AlertCircle className="h-3 w-3 me-1" />
                    {t("Blocked")}
                </Badge>
            )}
            {canDelete && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRequestDelete}
                    className="ms-auto text-error hover:text-error hover:bg-error-light gap-1.5 h-7 px-2 me-8"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("Delete")}
                </Button>
            )}
        </div>
        <DialogTitle className="text-xl">{task.title}</DialogTitle>
        <DialogDescription>{task.description}</DialogDescription>
    </DialogHeader>
);
