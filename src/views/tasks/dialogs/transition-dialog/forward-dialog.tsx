import { Lock, ShieldCheck } from "lucide-react";

import { Button, Skeleton } from "@/atoms";
import { t, useTransitionDialog } from "@/hooks";
import type { ForwardTransitionDialogPropsInterface } from "@/interfaces";
import { phaseLabel } from "@/lib/tasks";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui";

import { TransitionCriteriaList } from "./criteria-list";
import { TransitionTaskSummary } from "./task-summary";
import { TransitionTimeInput } from "./time-input";

export const ForwardTransitionDialog = ({
    open,
    onOpenChange,
    task,
    targetPhase,
    isAssignee,
    isSubmitting,
    onConfirm,
}: ForwardTransitionDialogPropsInterface) => {
    const dialog = useTransitionDialog({ open, task, targetPhase, onClose: () => onOpenChange(false) });
    const showTimeInput = isAssignee && (dialog.result?.allowed ?? false);

    const handleConfirm = () => {
        const h = parseFloat(dialog.hours);
        onConfirm(showTimeInput && !isNaN(h) && h > 0 ? { loggedHours: h, note: dialog.note.trim() } : undefined);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        {dialog.isFetching || !dialog.result
                            ? <ShieldCheck className="h-5 w-5 text-text-muted" />
                            : dialog.result.allowed
                                ? <ShieldCheck className="h-5 w-5 text-success" />
                                : <Lock className="h-5 w-5 text-error" />}
                        <DialogTitle>
                            {dialog.isFetching || !dialog.result
                                ? t("Checking criteria…")
                                : dialog.result.allowed
                                    ? t("Confirm Phase Transition")
                                    : t("Transition Blocked")}
                        </DialogTitle>
                    </div>
                    <DialogDescription>
                        {t("Moving forward")}:{" "}
                        <strong>{t(phaseLabel(task.status as never))}</strong> → <strong>{t(phaseLabel(targetPhase))}</strong>
                    </DialogDescription>
                </DialogHeader>

                <TransitionTaskSummary task={task} />

                {dialog.isFetching || !dialog.result ? (
                    <div className="mt-4 flex flex-col gap-2">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-9 rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <>
                        <TransitionCriteriaList
                            criteria={dialog.result.criteria}
                            allowed={dialog.result.allowed}
                            reason={dialog.result.reason}
                        />

                        {showTimeInput && (
                            <TransitionTimeInput
                                hours={dialog.hours}
                                onHoursChange={dialog.setHours}
                                note={dialog.note}
                                onNoteChange={dialog.setNote}
                            />
                        )}
                    </>
                )}

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        {t("Cancel")}
                    </Button>
                    {!dialog.isFetching && dialog.result?.allowed && (
                        <Button onClick={handleConfirm} loading={isSubmitting}>{t("Move Forward")}</Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
