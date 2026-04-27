import { useEffect, useState } from "react";

import { tasksConstants } from "@/constants";
import { TaskPhase } from "@/enums";
import { t, useTaskViews } from "@/hooks";
import type {
    UseTransitionDialogArgsInterface,
    UseTransitionDialogReturnInterface,
    TransitionResultInterface,
} from "@/interfaces";

export const useTransitionDialog = ({
    open,
    task,
    targetPhase,
    onClose,
}: UseTransitionDialogArgsInterface): UseTransitionDialogReturnInterface => {
    const { transitionCriteriaHandler } = useTaskViews();
    const [result, setResult] = useState<TransitionResultInterface | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [hours, setHours] = useState("");
    const [note, setNote] = useState("");
    const [reason, setReason] = useState("");

    const isBackward = task && targetPhase
        ? tasksConstants.phaseIndex[targetPhase] < tasksConstants.phaseIndex[(task.status as TaskPhase) ?? TaskPhase.Backlog]
        : false;

    useEffect(() => {
        if (!open || !task || !targetPhase) {
            setResult(null);
            setHours("");
            setNote("");
            setReason("");
            return;
        }
        if (isBackward) {
            setResult(null);
            setIsFetching(false);
            return;
        }
        let cancelled = false;
        setIsFetching(true);
        setResult(null);
        transitionCriteriaHandler(task.id, targetPhase).then((res) => {
            if (cancelled) return;
            if (res) {
                setResult({
                    allowed: res.all_passed,
                    reason: res.all_passed
                        ? t("All criteria met. Ready to move forward.")
                        : t("Some criteria are not yet met."),
                    criteria: res.criteria.map((c) => ({ label: c.label, met: c.passed })),
                });
            } else {
                onClose();
            }
            setIsFetching(false);
        });
        return () => { cancelled = true; };
    }, [open, task?.id, targetPhase, isBackward, transitionCriteriaHandler, onClose]);

    return {
        isFetching,
        result,
        isBackward,
        hours,
        setHours,
        note,
        setNote,
        reason,
        setReason,
    };
};
