import { Badge } from "@/atoms";
import { tasksConstants } from "@/constants";
import { TaskPriority } from "@/enums";
import { t } from "@/hooks";
import type { TransitionTaskSummaryPropsInterface } from "@/interfaces";
import { capitalize } from "@/utils";

export const TransitionTaskSummary = ({ task }: TransitionTaskSummaryPropsInterface) => (
    <div className="rounded-xl bg-muted p-3 mt-2">
        <p className="text-sm font-semibold text-text-dark">{task.title}</p>
        <div className="flex items-center gap-2 mt-1">
            <Badge variant={tasksConstants.priorityVariants[task.priority as TaskPriority]} className="text-[10px]">
                {t(capitalize(task.priority))}
            </Badge>
            <span className="text-xs text-text-muted">{task.storyPoints} {t("points")}</span>
        </div>
    </div>
);
