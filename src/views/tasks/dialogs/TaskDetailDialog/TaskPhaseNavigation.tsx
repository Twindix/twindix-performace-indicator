import { ArrowRight, Flag } from "lucide-react";

import { Badge, Button } from "@/atoms";
import { tasksConstants } from "@/constants";
import { TaskPhase } from "@/enums";
import { t } from "@/hooks";
import type { TaskPhaseNavigationPropsInterface } from "@/interfaces";
import { statusLabel } from "@/lib/tasks";
import { cn } from "@/utils";

export const TaskPhaseNavigation = ({
    task,
    canFinish,
    canMove,
    isMarkingComplete,
    onMarkComplete,
    onMoveNext,
}: TaskPhaseNavigationPropsInterface) => {
    const status = task.status ?? "backlog";
    const isPendingApproval = task.pending_approval === true;
    const isDone = status === "done";
    const taskRequirements = task.requirements ?? [];
    const allReqsApproved = taskRequirements.length > 0 && taskRequirements.every((r) => r.is_done);
    const showFinish = canFinish && !isDone && !isPendingApproval && !allReqsApproved;

    const nextStatus = task.phase_navigation?.next ?? null;
    const nextLabel = nextStatus
        ? (tasksConstants.columns.find((c) => c.phase === nextStatus)?.label ?? statusLabel(nextStatus))
        : null;

    const colorClass = tasksConstants.columnColors[status as TaskPhase] ?? "bg-text-muted";

    return (
        <div className="flex items-center justify-between gap-3 mt-3 p-3 rounded-xl bg-muted">
            <div className="flex items-center gap-2">
                <div className={cn("h-2.5 w-2.5 rounded-full", colorClass)} />
                <span className="text-sm font-semibold text-text-dark">{t(statusLabel(status))}</span>
                {isPendingApproval && <Badge variant="warning" className="ms-1">{t("Awaiting Approval")}</Badge>}
            </div>
            <div className="flex items-center gap-2">
                {showFinish && (
                    <Button
                        size="sm"
                        variant="secondary"
                        loading={isMarkingComplete}
                        onClick={onMarkComplete}
                        className="gap-1.5"
                    >
                        {!isMarkingComplete && <Flag className="h-3.5 w-3.5" />}
                        {t("Finish")}
                    </Button>
                )}
                {nextStatus && !showFinish && !isPendingApproval && canMove && (
                    <Button
                        size="sm"
                        disabled={isMarkingComplete}
                        onClick={() => onMoveNext(nextStatus as TaskPhase)}
                        className="gap-1.5"
                    >
                        {t(nextLabel ?? "")}<ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                )}
                {!nextStatus && <Badge variant="success" className="px-3 py-1.5">{t("Completed")}</Badge>}
            </div>
        </div>
    );
};
