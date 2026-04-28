import { tasksConstants } from "@/constants";
import { TaskPhase } from "@/enums";
import type { TransitionDialogPropsInterface } from "@/interfaces";

import { BackwardTransitionDialog } from "./BackwardTransitionDialog";
import { ForwardTransitionDialog } from "./ForwardTransitionDialog";

export const TransitionDialog = ({
    open,
    onOpenChange,
    task,
    targetPhase,
    onConfirm,
    isAssignee = false,
    isSubmitting = false,
}: TransitionDialogPropsInterface) => {
    if (!task || !targetPhase) return null;

    const isBackward =
        tasksConstants.phaseIndex[targetPhase] < tasksConstants.phaseIndex[(task.status as TaskPhase) ?? TaskPhase.Backlog];

    if (isBackward) {
        return (
            <BackwardTransitionDialog
                open={open}
                onOpenChange={onOpenChange}
                task={task}
                targetPhase={targetPhase}
                isSubmitting={isSubmitting}
                onConfirm={onConfirm}
            />
        );
    }

    return (
        <ForwardTransitionDialog
            open={open}
            onOpenChange={onOpenChange}
            task={task}
            targetPhase={targetPhase}
            isAssignee={isAssignee}
            isSubmitting={isSubmitting}
            onConfirm={onConfirm}
        />
    );
};
