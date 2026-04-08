import { useState, useMemo, useCallback, type DragEvent } from "react";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Circle,
    ClipboardList,
    Filter,
    GripVertical,
    Layers,
    Lock,
    Search,
    ShieldCheck,
    Tag,
    User,
} from "lucide-react";
import { toast } from "sonner";

import { Badge, Button, Card, CardContent, Input } from "@/atoms";
import { EmptyState, Header, ScoreGauge } from "@/components/shared";
import { TasksSkeleton } from "@/components/skeletons";
import { TaskPhase, TaskPriority, BlockerStatus } from "@/enums";
import type {
    TaskInterface,
    ReadinessChecklistInterface,
    UserInterface,
    BlockerInterface,
} from "@/interfaces";
import { t, useSettings, usePageLoader } from "@/hooks";
import { useSprintStore } from "@/store";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    Checkbox,
    Avatar,
    AvatarFallback,
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/ui";
import { cn, td, formatDate, getStorageItem, setStorageItem, storageKeys } from "@/utils";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const COLUMNS: { phase: TaskPhase; label: string; index: number }[] = [
    { phase: TaskPhase.Backlog, label: "Backlog", index: 0 },
    { phase: TaskPhase.Ready, label: "Ready", index: 1 },
    { phase: TaskPhase.InProgress, label: "In Progress", index: 2 },
    { phase: TaskPhase.Review, label: "Review", index: 3 },
    { phase: TaskPhase.QA, label: "QA", index: 4 },
    { phase: TaskPhase.Done, label: "Done", index: 5 },
];

const PHASE_INDEX: Record<TaskPhase, number> = {
    [TaskPhase.Backlog]: 0,
    [TaskPhase.Ready]: 1,
    [TaskPhase.InProgress]: 2,
    [TaskPhase.Review]: 3,
    [TaskPhase.QA]: 4,
    [TaskPhase.Done]: 5,
};

const PRIORITY_VARIANT: Record<TaskPriority, "error" | "warning" | "default" | "secondary"> = {
    [TaskPriority.Critical]: "error",
    [TaskPriority.High]: "warning",
    [TaskPriority.Medium]: "default",
    [TaskPriority.Low]: "secondary",
};

const READINESS_LABELS: { key: keyof ReadinessChecklistInterface; label: string }[] = [
    { key: "acceptanceCriteriaDefined", label: "Acceptance criteria defined" },
    { key: "businessRulesClear", label: "Business rules clear" },
    { key: "edgeCasesIdentified", label: "Edge cases identified" },
    { key: "dependenciesMapped", label: "Dependencies mapped" },
    { key: "designAvailable", label: "Design available" },
    { key: "apiContractReady", label: "API contract ready" },
    { key: "estimationDone", label: "Estimation done" },
];

const COLUMN_COLORS: Record<TaskPhase, string> = {
    [TaskPhase.Backlog]: "bg-text-muted",
    [TaskPhase.Ready]: "bg-primary",
    [TaskPhase.InProgress]: "bg-warning",
    [TaskPhase.Review]: "bg-[#8b5cf6]",
    [TaskPhase.QA]: "bg-[#ec4899]",
    [TaskPhase.Done]: "bg-success",
};

/* -------------------------------------------------------------------------- */
/*  Transition Gate Logic                                                      */
/* -------------------------------------------------------------------------- */

interface TransitionResult {
    allowed: boolean;
    reason: string;
    criteria: { label: string; met: boolean }[];
}

const READINESS_THRESHOLD = 70;

const checkTransition = (
    task: TaskInterface,
    fromPhase: TaskPhase,
    toPhase: TaskPhase,
    blockers: BlockerInterface[],
): TransitionResult => {
    const fromIndex = PHASE_INDEX[fromPhase];
    const toIndex = PHASE_INDEX[toPhase];

    // Moving backward is always allowed (e.g., sending back from Review to In Progress)
    if (toIndex < fromIndex) {
        return {
            allowed: true,
            reason: "Moving task back to a previous phase.",
            criteria: [{ label: "Backward transitions are always allowed", met: true }],
        };
    }

    // Can only move one step forward at a time (no skipping phases)
    if (toIndex > fromIndex + 1) {
        return {
            allowed: false,
            reason: "Tasks can only move one phase forward at a time. Move it step by step.",
            criteria: [{ label: "Sequential phase transition (one step at a time)", met: false }],
        };
    }

    const activeBlocker = task.hasBlocker
        ? blockers.find((b) => b.id === task.blockerId && (b.status === BlockerStatus.Active || b.status === BlockerStatus.Escalated))
        : null;

    // Backlog → Ready: Readiness gate must pass (≥70%)
    if (fromPhase === TaskPhase.Backlog && toPhase === TaskPhase.Ready) {
        const criteria = READINESS_LABELS.map(({ key, label }) => ({
            label,
            met: task.readinessChecklist[key],
        }));
        const readinessOk = task.readinessScore >= READINESS_THRESHOLD;
        criteria.push({ label: `Readiness score ≥ ${READINESS_THRESHOLD}% (currently ${task.readinessScore}%)`, met: readinessOk });

        return {
            allowed: readinessOk,
            reason: readinessOk
                ? "All readiness criteria met. Task is ready for development."
                : `Task readiness score is ${task.readinessScore}% — must be at least ${READINESS_THRESHOLD}% to move to Ready. Complete the missing checklist items first.`,
            criteria,
        };
    }

    // Ready → In Progress: Must have assignee, no active blocker
    if (fromPhase === TaskPhase.Ready && toPhase === TaskPhase.InProgress) {
        const hasAssignee = !!task.assigneeId;
        const notBlocked = !activeBlocker;
        const criteria = [
            { label: "Task has an assignee", met: hasAssignee },
            { label: "No active blockers", met: notBlocked },
        ];
        const allowed = hasAssignee && notBlocked;
        return {
            allowed,
            reason: allowed
                ? "Task is ready to start development."
                : !hasAssignee ? "Task must have an assignee before starting." : `Task is blocked: "${activeBlocker?.title}". Resolve the blocker first.`,
            criteria,
        };
    }

    // In Progress → Review: Must not be blocked, should have implementation
    if (fromPhase === TaskPhase.InProgress && toPhase === TaskPhase.Review) {
        const notBlocked = !activeBlocker;
        const criteria = [
            { label: "No active blockers", met: notBlocked },
            { label: "Implementation completed", met: true },
            { label: "Self-review done", met: true },
        ];
        return {
            allowed: notBlocked,
            reason: notBlocked
                ? "Task is ready for code review."
                : `Task is blocked: "${activeBlocker?.title}". Resolve the blocker before requesting review.`,
            criteria,
        };
    }

    // Review → QA: Must not be blocked
    if (fromPhase === TaskPhase.Review && toPhase === TaskPhase.QA) {
        const notBlocked = !activeBlocker;
        const criteria = [
            { label: "No active blockers", met: notBlocked },
            { label: "Code review approved", met: true },
            { label: "Review comments addressed", met: true },
        ];
        return {
            allowed: notBlocked,
            reason: notBlocked
                ? "Task is ready for QA testing."
                : `Task is blocked: "${activeBlocker?.title}". Resolve before moving to QA.`,
            criteria,
        };
    }

    // QA → Done: Must not be blocked, all QA checks pass
    if (fromPhase === TaskPhase.QA && toPhase === TaskPhase.Done) {
        const notBlocked = !activeBlocker;
        const criteria = [
            { label: "No active blockers", met: notBlocked },
            { label: "All test cases passed", met: true },
            { label: "No critical bugs found", met: true },
            { label: "Product owner sign-off", met: true },
        ];
        return {
            allowed: notBlocked,
            reason: notBlocked
                ? "Task has passed QA and is ready to be marked as done."
                : `Task is blocked: "${activeBlocker?.title}". Cannot mark as done until resolved.`,
            criteria,
        };
    }

    return { allowed: true, reason: "", criteria: [] };
};

/* -------------------------------------------------------------------------- */
/*  Mini progress ring                                                         */
/* -------------------------------------------------------------------------- */

const ProgressRing = ({ score, size = 32 }: { score: number; size?: number }) => {
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const targetOffset = circumference - (score / 100) * circumference;
    const color =
        score >= 80 ? "var(--raw-success)" : score >= 60 ? "var(--raw-warning)" : "var(--raw-error)";

    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="absolute inset-0 -rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--raw-border)" strokeWidth={strokeWidth} />
                <circle
                    cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color}
                    strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={targetOffset} strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-text-dark">{score}</span>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/*  Task Card (Draggable)                                                      */
/* -------------------------------------------------------------------------- */

interface TaskCardProps {
    task: TaskInterface;
    member: UserInterface | undefined;
    onClick: () => void;
    onDragStart: (e: DragEvent<HTMLDivElement>, task: TaskInterface) => void;
}

const TaskCard = ({ task, member, onClick, onDragStart }: TaskCardProps) => (
    <div
        draggable
        onDragStart={(e) => onDragStart(e, task)}
        onClick={onClick}
        className={cn(
            "w-full text-left rounded-xl border border-border bg-card p-4 shadow-sm",
            "transition-all hover:shadow-md hover:border-primary/30 cursor-pointer active:cursor-grabbing",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            "group select-none",
        )}
    >
        {/* Drag handle + title */}
        <div className="flex items-start gap-2 mb-2">
            <GripVertical className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0" />
            <p className="text-sm font-medium text-text-dark leading-snug line-clamp-2 flex-1">{task.title}</p>
            {task.hasBlocker && (
                <span className="relative flex h-2.5 w-2.5 shrink-0 mt-1">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-error" />
                </span>
            )}
        </div>

        {/* Tags */}
        {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
                {task.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-text-muted">{tag}</span>
                ))}
                {task.tags.length > 3 && <span className="text-[10px] text-text-muted">+{task.tags.length - 3}</span>}
            </div>
        )}

        {/* Bottom row */}
        <div className="flex items-center justify-between gap-2 mt-2">
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[9px]">{member?.avatar ?? "?"}</AvatarFallback>
                </Avatar>
                <Badge variant={PRIORITY_VARIANT[task.priority]} className="text-[10px] px-2 py-0.5">{t(task.priority.charAt(0).toUpperCase() + task.priority.slice(1))}</Badge>
                {task.storyPoints > 0 && (
                    <span className="text-[10px] font-semibold text-text-muted bg-muted rounded-full h-5 w-5 flex items-center justify-center">{task.storyPoints}</span>
                )}
            </div>
            <ProgressRing score={task.readinessScore} size={28} />
        </div>
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Phase Transition Confirmation Dialog                                       */
/* -------------------------------------------------------------------------- */

interface TransitionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: TaskInterface | null;
    targetPhase: TaskPhase | null;
    transitionResult: TransitionResult | null;
    onConfirm: () => void;
}

const TransitionDialog = ({ open, onOpenChange, task, targetPhase, transitionResult, onConfirm }: TransitionDialogProps) => {
    if (!task || !targetPhase || !transitionResult) return null;

    const fromLabel = COLUMNS.find((c) => c.phase === task.phase)?.label ?? task.phase;
    const toLabel = COLUMNS.find((c) => c.phase === targetPhase)?.label ?? targetPhase;
    const isBackward = PHASE_INDEX[targetPhase] < PHASE_INDEX[task.phase];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        {transitionResult.allowed ? (
                            <ShieldCheck className="h-5 w-5 text-success" />
                        ) : (
                            <Lock className="h-5 w-5 text-error" />
                        )}
                        <DialogTitle>
                            {transitionResult.allowed ? t("Confirm Phase Transition") : t("Transition Blocked")}
                        </DialogTitle>
                    </div>
                    <DialogDescription>
                        {isBackward ? t("Moving back") : t("Moving forward")}: <strong>{t(fromLabel)}</strong> → <strong>{t(toLabel)}</strong>
                    </DialogDescription>
                </DialogHeader>

                {/* Task info */}
                <div className="rounded-xl bg-muted p-3 mt-2">
                    <p className="text-sm font-semibold text-text-dark">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant={PRIORITY_VARIANT[task.priority]} className="text-[10px]">{t(task.priority.charAt(0).toUpperCase() + task.priority.slice(1))}</Badge>
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
                                    {c.met ? (
                                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4 text-error shrink-0" />
                                    )}
                                    <span className={cn("text-sm", c.met ? "text-text-dark" : "text-error font-medium")}>{c.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reason / status message */}
                <p className={cn("text-sm mt-4 p-3 rounded-lg", transitionResult.allowed ? "bg-success-light/30 text-success" : "bg-error-light/30 text-error")}>
                    {transitionResult.reason}
                </p>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t("Cancel")}</Button>
                    {transitionResult.allowed && (
                        <Button onClick={onConfirm}>
                            {isBackward ? t("Move Back") : t("Move Forward")}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

/* -------------------------------------------------------------------------- */
/*  Task Detail Dialog (enhanced with move buttons)                            */
/* -------------------------------------------------------------------------- */

interface TaskDetailDialogProps {
    task: TaskInterface | null;
    member: UserInterface | undefined;
    blocker: BlockerInterface | undefined;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onMoveRequest: (task: TaskInterface, targetPhase: TaskPhase) => void;
}

const TaskDetailDialog = ({ task, member, blocker, open, onOpenChange, onMoveRequest }: TaskDetailDialogProps) => {
    if (!task) return null;

    const currentIndex = PHASE_INDEX[task.phase];
    const prevPhase = currentIndex > 0 ? COLUMNS[currentIndex - 1].phase : null;
    const nextPhase = currentIndex < COLUMNS.length - 1 ? COLUMNS[currentIndex + 1].phase : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant={PRIORITY_VARIANT[task.priority]}>{t(task.priority.charAt(0).toUpperCase() + task.priority.slice(1))}</Badge>
                        {task.hasBlocker && (
                            <Badge variant="error"><AlertCircle className="h-3 w-3 me-1" />{t("Blocked")}</Badge>
                        )}
                    </div>
                    <DialogTitle className="text-xl">{task.title}</DialogTitle>
                    <DialogDescription>{task.description}</DialogDescription>
                </DialogHeader>

                {/* Phase navigation buttons */}
                <div className="flex items-center justify-between gap-3 mt-3 p-3 rounded-xl bg-muted">
                    {prevPhase ? (
                        <Button variant="secondary" size="sm" onClick={() => { onOpenChange(false); onMoveRequest(task, prevPhase); }} className="gap-1.5">
                            <ArrowLeft className="h-3.5 w-3.5" />
                            {t(COLUMNS[currentIndex - 1].label)}
                        </Button>
                    ) : <div />}

                    <div className="flex items-center gap-2">
                        <div className={cn("h-2.5 w-2.5 rounded-full", COLUMN_COLORS[task.phase])} />
                        <span className="text-sm font-semibold text-text-dark capitalize">{t(task.phase === "in_progress" ? "In Progress" : task.phase.charAt(0).toUpperCase() + task.phase.slice(1))}</span>
                    </div>

                    {nextPhase ? (
                        <Button size="sm" onClick={() => { onOpenChange(false); onMoveRequest(task, nextPhase); }} className="gap-1.5">
                            {t(COLUMNS[currentIndex + 1].label)}
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    ) : (
                        <Badge variant="success" className="px-3 py-1.5">{t("Completed")}</Badge>
                    )}
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-4 mt-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Assignee")}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px]">{member?.avatar ?? "?"}</AvatarFallback></Avatar>
                                <span className="text-sm font-medium text-text-dark">{member?.name ?? t("Unassigned")}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Story Points")}</p>
                            <p className="text-sm font-medium text-text-dark">{task.storyPoints}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Phase")}</p>
                            <p className="text-sm font-medium text-text-dark capitalize">{t(task.phase === "in_progress" ? "In Progress" : task.phase.charAt(0).toUpperCase() + task.phase.slice(1))}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Circle className="h-4 w-4 text-text-muted" />
                        <div>
                            <p className="text-xs text-text-muted">{t("Created")}</p>
                            <p className="text-sm font-medium text-text-dark">{formatDate(task.createdAt)}</p>
                        </div>
                    </div>
                </div>

                {/* Tags */}
                {task.tags.length > 0 && (
                    <div className="mt-4">
                        <p className="text-xs font-medium text-text-muted mb-2 flex items-center gap-1"><Tag className="h-3 w-3" />{t("Tags")}</p>
                        <div className="flex flex-wrap gap-1.5">
                            {task.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
                        </div>
                    </div>
                )}

                {/* Readiness Gate Section */}
                <div className="mt-5 pb-4 border-b border-border">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-text-dark">{t("Readiness Gate Checklist")}</h4>
                        <ScoreGauge score={task.readinessScore} size="sm" label={t("Ready")} />
                    </div>
                    <div className="space-y-3">
                        {READINESS_LABELS.map(({ key, label }) => {
                            const checked = task.readinessChecklist[key];
                            return (
                                <label key={key} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 transition-colors", checked ? "bg-success-light/50" : "bg-muted/50")}>
                                    <Checkbox checked={checked} disabled />
                                    <span className={cn("text-sm", checked ? "text-text-dark font-medium" : "text-text-secondary")}>{td(label)}</span>
                                    {checked && <CheckCircle2 className="h-3.5 w-3.5 text-success ml-auto" />}
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Blocker info */}
                {task.hasBlocker && blocker && (
                    <div className="mt-4 rounded-xl bg-error-light p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-error" />
                            <h4 className="text-sm font-semibold text-error">{t("Blocker")}</h4>
                            <Badge variant={blocker.status === BlockerStatus.Escalated ? "error" : "warning"}>{t(blocker.status.charAt(0).toUpperCase() + blocker.status.slice(1))}</Badge>
                        </div>
                        <p className="text-sm font-medium text-text-dark">{blocker.title}</p>
                        <p className="text-xs text-text-secondary mt-1">{blocker.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-text-muted">{t("Impact")}: <strong className="text-error">{t(blocker.impact.charAt(0).toUpperCase() + blocker.impact.slice(1))}</strong></span>
                            <span className="text-xs text-text-muted">{t("Duration")}: <strong>{blocker.durationDays} {t("days")}</strong></span>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

/* -------------------------------------------------------------------------- */
/*  Kanban Column (Drop Target)                                                */
/* -------------------------------------------------------------------------- */

interface KanbanColumnProps {
    phase: TaskPhase;
    label: string;
    tasks: TaskInterface[];
    members: UserInterface[];
    onTaskClick: (task: TaskInterface) => void;
    onDragStart: (e: DragEvent<HTMLDivElement>, task: TaskInterface) => void;
    onDrop: (e: DragEvent<HTMLDivElement>, targetPhase: TaskPhase) => void;
    isDragOver: boolean;
    onDragOver: (e: DragEvent<HTMLDivElement>) => void;
    onDragEnter: (e: DragEvent<HTMLDivElement>, phase: TaskPhase) => void;
    onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
}

const KanbanColumn = ({ phase, label, tasks, members, onTaskClick, onDragStart, onDrop, isDragOver, onDragOver, onDragEnter, onDragLeave }: KanbanColumnProps) => {
    const getMember = (id: string) => members.find((m) => m.id === id);

    return (
        <div className="flex flex-col min-w-[290px] w-[290px] lg:flex-1 lg:min-w-0">
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3 px-1">
                <div className={cn("h-2.5 w-2.5 rounded-full", COLUMN_COLORS[phase])} />
                <h3 className="text-sm font-semibold text-text-dark">{t(label)}</h3>
                <span className="flex items-center justify-center h-6 min-w-6 rounded-full bg-muted px-2 text-[11px] font-bold text-text-muted">{tasks.length}</span>
            </div>

            {/* Drop zone */}
            <div
                onDragOver={onDragOver}
                onDragEnter={(e) => onDragEnter(e, phase)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, phase)}
                className={cn(
                    "flex flex-col gap-3 flex-1 rounded-xl p-3 min-h-[120px] transition-all duration-200",
                    isDragOver
                        ? "border-2 border-dashed border-primary bg-primary-lighter/30"
                        : "bg-muted/30 border border-border/30",
                )}
            >
                {tasks.length === 0 ? (
                    <div className={cn("flex flex-col items-center justify-center h-full py-8 transition-opacity", isDragOver ? "opacity-100" : "opacity-60")}>
                        <p className="text-xs text-text-muted">{isDragOver ? t("Drop here") : t("No tasks")}</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            member={getMember(task.assigneeId)}
                            onClick={() => onTaskClick(task)}
                            onDragStart={onDragStart}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/*  Main View                                                                  */
/* -------------------------------------------------------------------------- */

export const TasksView = () => {
    const isLoading = usePageLoader();
    useSettings();
    const { activeSprintId } = useSprintStore();

    // Read tasks from localStorage so we can update them
    const [allTasks, setAllTasks] = useState<TaskInterface[]>(() => getStorageItem<TaskInterface[]>(storageKeys.tasks) ?? []);
    const members = getStorageItem<UserInterface[]>(storageKeys.teamMembers) ?? [];
    const blockers = getStorageItem<BlockerInterface[]>(storageKeys.blockers) ?? [];

    const [selectedTask, setSelectedTask] = useState<TaskInterface | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
    const [phaseFilter, setPhaseFilter] = useState<string>("all");
    const [readinessFilter, setReadinessFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");

    // Drag-and-drop state
    const [draggedTask, setDraggedTask] = useState<TaskInterface | null>(null);
    const [dragOverPhase, setDragOverPhase] = useState<TaskPhase | null>(null);

    // Transition dialog state
    const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
    const [transitionTask, setTransitionTask] = useState<TaskInterface | null>(null);
    const [transitionTarget, setTransitionTarget] = useState<TaskPhase | null>(null);
    const [transitionResult, setTransitionResult] = useState<TransitionResult | null>(null);

    const sprintTasks = useMemo(() => allTasks.filter((t) => t.sprintId === activeSprintId), [allTasks, activeSprintId]);

    const filteredTasks = useMemo(() => {
        let result = sprintTasks;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter((t) => t.title.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q)));
        }
        if (phaseFilter !== "all") {
            if (phaseFilter === "blocked") result = result.filter((t) => t.hasBlocker);
            else result = result.filter((t) => t.phase === phaseFilter);
        }
        if (priorityFilter !== "all") result = result.filter((t) => t.priority === priorityFilter);
        if (assigneeFilter !== "all") result = result.filter((t) => t.assigneeId === assigneeFilter);
        if (readinessFilter === "ready") result = result.filter((t) => t.readinessScore >= 70);
        if (readinessFilter === "not_ready") result = result.filter((t) => t.readinessScore < 70);
        if (typeFilter !== "all") result = result.filter((t) => (t.type ?? "feature") === typeFilter);
        return result;
    }, [sprintTasks, searchQuery, phaseFilter, priorityFilter, assigneeFilter, readinessFilter, typeFilter]);

    const tasksByPhase = useMemo(() => {
        const map = new Map<TaskPhase, TaskInterface[]>();
        for (const col of COLUMNS) map.set(col.phase, []);
        for (const task of filteredTasks) {
            const list = map.get(task.phase);
            if (list) list.push(task);
        }
        return map;
    }, [filteredTasks]);

    // Persist task changes to localStorage
    const updateTasks = useCallback((updater: (prev: TaskInterface[]) => TaskInterface[]) => {
        setAllTasks((prev) => {
            const next = updater(prev);
            setStorageItem(storageKeys.tasks, next);
            return next;
        });
    }, []);

    // Move task to new phase
    const moveTask = useCallback((taskId: string, newPhase: TaskPhase) => {
        updateTasks((prev) => prev.map((t) =>
            t.id === taskId ? { ...t, phase: newPhase, updatedAt: new Date().toISOString().split("T")[0] } : t,
        ));
    }, [updateTasks]);

    // Request a transition (opens confirmation dialog with gate check)
    const requestTransition = useCallback((task: TaskInterface, targetPhase: TaskPhase) => {
        if (task.phase === targetPhase) return;
        const result = checkTransition(task, task.phase, targetPhase, blockers);
        setTransitionTask(task);
        setTransitionTarget(targetPhase);
        setTransitionResult(result);
        setTransitionDialogOpen(true);
    }, [blockers]);

    // Confirm and execute the transition
    const confirmTransition = useCallback(() => {
        if (!transitionTask || !transitionTarget) return;

        const fromLabel = COLUMNS.find((c) => c.phase === transitionTask.phase)?.label;
        const toLabel = COLUMNS.find((c) => c.phase === transitionTarget)?.label;

        moveTask(transitionTask.id, transitionTarget);
        setTransitionDialogOpen(false);
        setTransitionTask(null);
        setTransitionTarget(null);
        setTransitionResult(null);

        toast.success(`${t("Task")} moved: ${t(fromLabel ?? "")} → ${t(toLabel ?? "")}`, {
            description: transitionTask.title,
        });
    }, [transitionTask, transitionTarget, moveTask]);

    // Drag handlers
    const handleDragStart = useCallback((_e: DragEvent<HTMLDivElement>, task: TaskInterface) => {
        setDraggedTask(task);
    }, []);

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    }, []);

    const handleDragEnter = useCallback((_e: DragEvent<HTMLDivElement>, phase: TaskPhase) => {
        setDragOverPhase(phase);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
        // Only clear if leaving the column entirely (not entering a child)
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverPhase(null);
        }
    }, []);

    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>, targetPhase: TaskPhase) => {
        e.preventDefault();
        setDragOverPhase(null);

        if (!draggedTask || draggedTask.phase === targetPhase) {
            setDraggedTask(null);
            return;
        }

        requestTransition(draggedTask, targetPhase);
        setDraggedTask(null);
    }, [draggedTask, requestTransition]);

    const handleTaskClick = (task: TaskInterface) => {
        setSelectedTask(task);
        setDialogOpen(true);
    };

    const selectedBlocker = useMemo(() => {
        if (!selectedTask?.blockerId) return undefined;
        return blockers.find((b) => b.id === selectedTask.blockerId);
    }, [selectedTask, blockers]);

    const selectedMember = useMemo(() => {
        if (!selectedTask) return undefined;
        return members.find((m) => m.id === selectedTask.assigneeId);
    }, [selectedTask, members]);

    const sprintAssigneeIds = useMemo(() => [...new Set(sprintTasks.map((t) => t.assigneeId))], [sprintTasks]);

    const totalPoints = sprintTasks.reduce((sum, t) => sum + t.storyPoints, 0);
    const donePoints = sprintTasks.filter((t) => t.phase === TaskPhase.Done).reduce((sum, t) => sum + t.storyPoints, 0);
    const blockedCount = sprintTasks.filter((t) => t.hasBlocker).length;

    if (isLoading) return <TasksSkeleton />;

    return (
        <div>
            <Header
                title={t("Task Management")}
                description={t("Drag tasks between columns to change their phase. Phase gates enforce readiness criteria.")}
                actions={
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <span><strong className="text-text-dark">{sprintTasks.length}</strong> {t("tasks")}</span>
                        <span className="text-border">|</span>
                        <span><strong className="text-text-dark">{donePoints}</strong>/{totalPoints} {t("points")}</span>
                        {blockedCount > 0 && (
                            <>
                                <span className="text-border">|</span>
                                <Badge variant="error">{blockedCount} {t("blocked")}</Badge>
                            </>
                        )}
                    </div>
                }
            />

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-5">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {/* Search */}
                        <div className="relative flex-1 min-w-0 sm:min-w-[200px] sm:max-w-sm">
                            <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" style={{ insetInlineStart: 12 }} />
                            <Input placeholder={t("Search tasks or tags...")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ paddingInlineStart: 40 }} />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            <Filter className="h-4 w-4 text-text-muted hidden sm:block shrink-0" />

                            {/* Phase / Status */}
                            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                                <SelectTrigger className="w-[150px] h-9 text-xs sm:text-sm"><SelectValue placeholder={t("Status")} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("All Statuses")}</SelectItem>
                                    <SelectItem value={TaskPhase.Backlog}>{t("Backlog")}</SelectItem>
                                    <SelectItem value={TaskPhase.Ready}>{t("Ready")}</SelectItem>
                                    <SelectItem value={TaskPhase.InProgress}>{t("In Progress")}</SelectItem>
                                    <SelectItem value={TaskPhase.Review}>{t("Review")}</SelectItem>
                                    <SelectItem value={TaskPhase.QA}>{t("Ready for Testing")}</SelectItem>
                                    <SelectItem value={TaskPhase.Done}>{t("Deployed")}</SelectItem>
                                    <SelectItem value="blocked">{t("Blocked")}</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Assignee */}
                            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                                <SelectTrigger className="w-[150px] h-9 text-xs sm:text-sm"><SelectValue placeholder={t("Assignee")} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("All Assignees")}</SelectItem>
                                    {sprintAssigneeIds.map((id) => {
                                        const m = members.find((mem) => mem.id === id);
                                        return <SelectItem key={id} value={id}>{m?.name ?? id}</SelectItem>;
                                    })}
                                </SelectContent>
                            </Select>

                            {/* Readiness */}
                            <Select value={readinessFilter} onValueChange={setReadinessFilter}>
                                <SelectTrigger className="w-[150px] h-9 text-xs sm:text-sm"><SelectValue placeholder={t("Readiness")} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("All Readiness")}</SelectItem>
                                    <SelectItem value="ready">{t("Ready (≥70%)")}</SelectItem>
                                    <SelectItem value="not_ready">{t("Not Ready (<70%)")}</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Priority */}
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-[130px] h-9 text-xs sm:text-sm"><SelectValue placeholder={t("Priority")} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("All Priorities")}</SelectItem>
                                    <SelectItem value={TaskPriority.Low}>{t("Low")}</SelectItem>
                                    <SelectItem value={TaskPriority.Medium}>{t("Medium")}</SelectItem>
                                    <SelectItem value={TaskPriority.High}>{t("High")}</SelectItem>
                                    <SelectItem value={TaskPriority.Critical}>{t("Critical")}</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Type */}
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[120px] h-9 text-xs sm:text-sm"><SelectValue placeholder={t("Type")} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("All Types")}</SelectItem>
                                    <SelectItem value="feature">{t("Feature")}</SelectItem>
                                    <SelectItem value="bug">{t("Bug")}</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Clear */}
                            {(phaseFilter !== "all" || assigneeFilter !== "all" || readinessFilter !== "all" || priorityFilter !== "all" || typeFilter !== "all" || searchQuery) && (
                                <button
                                    onClick={() => { setPhaseFilter("all"); setAssigneeFilter("all"); setReadinessFilter("all"); setPriorityFilter("all"); setTypeFilter("all"); setSearchQuery(""); }}
                                    className="text-xs text-text-muted hover:text-text-dark underline cursor-pointer"
                                >
                                    {t("Clear all")}
                                </button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Phase legend */}
            <div className="flex flex-wrap items-center gap-1.5 mb-6 mt-1 py-2 text-[10px] text-text-muted">
                {COLUMNS.map((col, i) => (
                    <span key={col.phase} className="flex items-center gap-1">
                        {i > 0 && <ArrowRight className="h-3 w-3 mx-0.5" />}
                        <span className={cn("h-2 w-2 rounded-full", COLUMN_COLORS[col.phase])} />
                        <span className="font-medium">{t(col.label)}</span>
                    </span>
                ))}
            </div>

            {/* Kanban Board */}
            {sprintTasks.length === 0 ? (
                <EmptyState icon={ClipboardList} title={t("No tasks found")} description={t("No tasks assigned to the current sprint")} />
            ) : (
                <div className="overflow-x-auto pb-4 -mx-2 px-2">
                    <div className="flex gap-4 min-w-max lg:min-w-0">
                        {COLUMNS.map(({ phase, label }) => (
                            <KanbanColumn
                                key={phase}
                                phase={phase}
                                label={label}
                                tasks={tasksByPhase.get(phase) ?? []}
                                members={members}
                                onTaskClick={handleTaskClick}
                                onDragStart={handleDragStart}
                                onDrop={handleDrop}
                                isDragOver={dragOverPhase === phase}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Task Detail Dialog */}
            <TaskDetailDialog
                task={selectedTask}
                member={selectedMember}
                blocker={selectedBlocker}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onMoveRequest={requestTransition}
            />

            {/* Phase Transition Confirmation Dialog */}
            <TransitionDialog
                open={transitionDialogOpen}
                onOpenChange={setTransitionDialogOpen}
                task={transitionTask}
                targetPhase={transitionTarget}
                transitionResult={transitionResult}
                onConfirm={confirmTransition}
            />
        </div>
    );
};
