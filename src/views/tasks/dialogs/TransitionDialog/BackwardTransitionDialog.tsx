import { Undo2 } from "lucide-react";

import { Button, Textarea } from "@/atoms";
import { t, useTransitionDialog } from "@/hooks";
import type { BackwardTransitionDialogPropsInterface } from "@/interfaces";
import { phaseLabel } from "@/lib/tasks";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui";

import { TransitionTaskSummary } from "./TransitionTaskSummary";

export const BackwardTransitionDialog = ({
    open,
    onOpenChange,
    task,
    targetPhase,
    isSubmitting,
    onConfirm,
}: BackwardTransitionDialogPropsInterface) => {
    const dialog = useTransitionDialog({ open, task, targetPhase, onClose: () => onOpenChange(false) });
    const canSubmit = dialog.reason.trim().length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <Undo2 className="h-5 w-5 text-warning" />
                        <DialogTitle>{t("Move Task Back")}</DialogTitle>
                    </div>
                    <DialogDescription>
                        {t("Moving back")}:{" "}
                        <strong>{t(phaseLabel(task.status as never))}</strong> → <strong>{t(phaseLabel(targetPhase))}</strong>
                    </DialogDescription>
                </DialogHeader>

                <TransitionTaskSummary task={task} />

                <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                        {t("Reason")} <span className="text-error">*</span>
                    </p>
                    <p className="text-xs text-text-muted">
                        {t("Explain why this task needs to go back to a previous phase. The PM will review this request.")}
                    </p>
                    <Textarea
                        placeholder={t("Why are you moving this task back?")}
                        value={dialog.reason}
                        onChange={(e) => dialog.setReason(e.target.value)}
                        rows={4}
                        className="bg-surface"
                    />
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        {t("Cancel")}
                    </Button>
                    <Button onClick={() => onConfirm({ reason: dialog.reason.trim() })} loading={isSubmitting} disabled={!canSubmit}>
                        {t("Request Move Back")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
