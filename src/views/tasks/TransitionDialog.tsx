import { useState, useEffect } from "react";
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Badge, Button, Input } from "@/atoms";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/ui";
import { cn } from "@/utils";
import { t } from "@/hooks";
import type { TaskInterface } from "@/interfaces";
import type { TaskPhase } from "@/enums";
import {
    PHASE_INDEX,
    PRIORITY_VARIANT,
    phaseLabel,
    capitalize,
    type TransitionResult,
} from "../../data/seed/constants";

interface TransitionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: TaskInterface | null;
    targetPhase: TaskPhase | null;
    transitionResult: TransitionResult | null;
    onConfirm: (payload?: { loggedHours?: number; note?: string }) => void;
    isAssignee?: boolean;
}

export const TransitionDialog = ({
    open,
    onOpenChange,
    task,
    targetPhase,
    transitionResult,
    onConfirm,
    isAssignee = false,
}: TransitionDialogProps) => {
    const [hours, setHours] = useState("");
    const [note, setNote] = useState("");

    useEffect(() => {
        if (open) { setHours(""); setNote(""); }
    }, [open]);

    if (!task || !targetPhase || !transitionResult) return null;

    const isBackward = PHASE_INDEX[targetPhase] < PHASE_INDEX[task.phase];
    const showTimeInput = isAssignee && transitionResult.allowed && !isBackward;

    const handleConfirm = () => {
        const h = parseFloat(hours);
        onConfirm(showTimeInput && !isNaN(h) && h > 0 ? { loggedHours: h, note: note.trim() } : undefined);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        {transitionResult.allowed
                            ? <ShieldCheck className="h-5 w-5 text-success" />
                            : <Lock className="h-5 w-5 text-error" />}
                        <DialogTitle>
                            {transitionResult.allowed ? t("Confirm Phase Transition") : t("Transition Blocked")}
                        </DialogTitle>
                    </div>
                    <DialogDescription>
                        {isBackward ? t("Moving back") : t("Moving forward")}:{" "}
                        <strong>{t(phaseLabel(task.phase))}</strong> → <strong>{t(phaseLabel(targetPhase))}</strong>
                    </DialogDescription>
                </DialogHeader>

                {/* Task info */}
                <div className="rounded-xl bg-muted p-3 mt-2">
                    <p className="text-sm font-semibold text-text-dark">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant={PRIORITY_VARIANT[task.priority]} className="text-[10px]">{t(capitalize(task.priority))}</Badge>
                        <span className="text-xs text-text-muted">{task.storyPoints} {t("points")}</span>
                    </div>
                </div>

                {/* Criteria checklist */}
                {transitionResult.criteria.length > 0 && (
                    <div className="mt-4">
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                            {transitionResult.allowed ? t("Transition Criteria") : t("Required Criteria")}
                        </p>
                        <div className="space-y-2">
                            {transitionResult.criteria.map((c, i) => (
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

                {/* Reason */}
                <p className={cn("text-sm mt-4 p-3 rounded-lg", transitionResult.allowed ? "bg-success-light/30 text-success" : "bg-error-light/30 text-error")}>
                    {transitionResult.reason}
                </p>

                {/* Time input — only for assignee on forward moves */}
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

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t("Cancel")}</Button>
                    {transitionResult.allowed && (
                        <Button onClick={handleConfirm}>
                            {isBackward ? t("Move Back") : t("Move Forward")}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
