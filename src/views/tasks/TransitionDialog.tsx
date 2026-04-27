import { useState, useEffect } from "react";
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, Clock, Undo2 } from "lucide-react";
import { Badge, Button, Input, Skeleton, Textarea } from "@/atoms";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/ui";
import { cn } from "@/utils";
import { tasksConstants } from "@/constants";
import { TaskPhase, TaskPriority } from "@/enums";
import { t, useTaskViews } from "@/hooks";
import type { TaskInterface, TransitionResultInterface } from "@/interfaces";
import { phaseLabel } from "@/lib/tasks";
import { capitalize } from "@/utils";

interface TransitionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: TaskInterface | null;
    targetPhase: TaskPhase | null;
    onConfirm: (payload?: { loggedHours?: number; note?: string; reason?: string }) => void;
    isAssignee?: boolean;
    isSubmitting?: boolean;
}

export const TransitionDialog = ({
    open,
    onOpenChange,
    task,
    targetPhase,
    onConfirm,
    isAssignee = false,
    isSubmitting = false,
}: TransitionDialogProps) => {
    const { transitionCriteriaHandler } = useTaskViews();
    const [result, setResult] = useState<TransitionResultInterface | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [hours, setHours] = useState("");
    const [note, setNote] = useState("");
    const [reason, setReason] = useState("");

    const isBackward = task && targetPhase
        ? tasksConstants.phaseIndex[targetPhase as TaskPhase] < tasksConstants.phaseIndex[(task.status as TaskPhase) ?? TaskPhase.Backlog]
        : false;

    useEffect(() => {
        if (!open || !task || !targetPhase) {
            setResult(null);
            setHours("");
            setNote("");
            setReason("");
            return;
        }
        // Backward move: skip criteria fetch — only needs a reason from the user
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
                onOpenChange(false);
            }
            setIsFetching(false);
        });
        return () => { cancelled = true; };
    }, [open, task?.id, targetPhase, isBackward, transitionCriteriaHandler, onOpenChange]);

    if (!task || !targetPhase) return null;

    const showTimeInput = !isBackward && isAssignee && (result?.allowed ?? false);

    const handleConfirmForward = () => {
        const h = parseFloat(hours);
        onConfirm(showTimeInput && !isNaN(h) && h > 0 ? { loggedHours: h, note: note.trim() } : undefined);
    };

    const handleConfirmBackward = () => {
        onConfirm({ reason: reason.trim() });
    };

    // Backward move dialog — reason input, no criteria fetch
    if (isBackward) {
        const canSubmit = reason.trim().length > 0;
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
                            <strong>{t(phaseLabel(task.status as TaskPhase ?? TaskPhase.Backlog))}</strong> → <strong>{t(phaseLabel(targetPhase as TaskPhase))}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-xl bg-muted p-3 mt-2">
                        <p className="text-sm font-semibold text-text-dark">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={tasksConstants.priorityVariants[task.priority as TaskPriority]} className="text-[10px]">{t(capitalize(task.priority))}</Badge>
                            <span className="text-xs text-text-muted">{task.storyPoints} {t("points")}</span>
                        </div>
                    </div>

                    <div className="mt-4 space-y-2">
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                            {t("Reason")} <span className="text-error">*</span>
                        </p>
                        <p className="text-xs text-text-muted">
                            {t("Explain why this task needs to go back to a previous phase. The PM will review this request.")}
                        </p>
                        <Textarea
                            placeholder={t("Why are you moving this task back?")}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            className="bg-surface"
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>{t("Cancel")}</Button>
                        <Button onClick={handleConfirmBackward} loading={isSubmitting} disabled={!canSubmit}>{t("Request Move Back")}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // Forward move dialog — criteria + optional time input
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        {isFetching || !result
                            ? <ShieldCheck className="h-5 w-5 text-text-muted" />
                            : result.allowed
                                ? <ShieldCheck className="h-5 w-5 text-success" />
                                : <Lock className="h-5 w-5 text-error" />}
                        <DialogTitle>
                            {isFetching || !result ? t("Checking criteria…") : result.allowed ? t("Confirm Phase Transition") : t("Transition Blocked")}
                        </DialogTitle>
                    </div>
                    <DialogDescription>
                        {t("Moving forward")}:{" "}
                        <strong>{t(phaseLabel(task.status as TaskPhase ?? TaskPhase.Backlog))}</strong> → <strong>{t(phaseLabel(targetPhase as TaskPhase))}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-xl bg-muted p-3 mt-2">
                    <p className="text-sm font-semibold text-text-dark">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant={tasksConstants.priorityVariants[task.priority as TaskPriority]} className="text-[10px]">{t(capitalize(task.priority))}</Badge>
                        <span className="text-xs text-text-muted">{task.storyPoints} {t("points")}</span>
                    </div>
                </div>

                {isFetching || !result ? (
                    <div className="mt-4 flex flex-col gap-2">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-9 rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <>
                        {result.criteria.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                                    {result.allowed ? t("Transition Criteria") : t("Required Criteria")}
                                </p>
                                <div className="space-y-2">
                                    {result.criteria.map((c, i) => (
                                        <div key={i} className={cn("flex items-center gap-3 rounded-lg px-3 py-2", c.met ? "bg-success-light/50" : "bg-error-light/50")}>
                                            {c.met
                                                ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                                : <AlertCircle className="h-4 w-4 text-error shrink-0" />}
                                            <span className={cn("text-sm", c.met ? "text-text-dark" : "text-error font-medium")}>{c.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className={cn("text-sm mt-4 p-3 rounded-lg", result.allowed ? "bg-success-light/30 text-success" : "bg-error-light/30 text-error")}>
                            {result.reason}
                        </p>

                        {showTimeInput && (
                            <div className="mt-4 p-4 rounded-xl bg-muted border border-border space-y-3">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-text-muted" />
                                    <p className="text-sm font-semibold text-text-dark">{t("Log Time Spent")}</p>
                                </div>
                                <p className="text-xs text-text-muted">{t("How many hours did you work on this phase?")}</p>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        min="0.5"
                                        step="0.5"
                                        placeholder={t("e.g. 4.5")}
                                        value={hours}
                                        onChange={(e) => setHours(e.target.value)}
                                        className="w-28 bg-surface"
                                    />
                                    <Input
                                        placeholder={t("Note (optional)")}
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        className="flex-1 bg-surface"
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>{t("Cancel")}</Button>
                    {!isFetching && result?.allowed && (
                        <Button onClick={handleConfirmForward} loading={isSubmitting}>{t("Move Forward")}</Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
