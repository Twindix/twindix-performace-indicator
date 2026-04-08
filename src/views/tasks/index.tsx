import { useState, useMemo, useCallback, useRef, type DragEvent } from "react";
import React from "react";
import {
    ArrowRight,
    AtSign,
    Check,
    CheckCircle2,
    Circle,
    ClipboardList,
    Clock,
    Edit2,
    Filter,
    GripVertical,
    Layers,
    Lock,
    Plus,
    MessageCircle,
    Paperclip,
    Search,
    Send,
    ShieldCheck,
    Smile,
    Tag,
    Trash2,
    User,
    X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge, Button, Card, CardContent, Input } from "@/atoms";
import { EmptyState, Header } from "@/components/shared";
import { TasksSkeleton } from "@/components/skeletons";
import { TaskPhase, TaskPriority, BlockerStatus, UserRole } from "@/enums";
import type {
    TaskInterface,
    TaskAttachmentInterface,
    TaskCommentInterface,
    TaskTimeLogInterface,
    ReadinessChecklistInterface,
import { TaskPhase } from "@/enums";
import type {
    TaskInterface,
    UserInterface,
    BlockerInterface,
} from "@/interfaces";
import { t, useSettings, usePageLoader } from "@/hooks";
import { useSprintStore } from "@/store";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/ui";
import { cn, td, formatDate, getStorageItem, setStorageItem, storageKeys } from "@/utils";
import { AddTaskDialog } from "./add-task-dialog";

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
                {(task.attachments?.length ?? 0) > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-text-muted">
                        <Paperclip className="h-3 w-3" />{task.attachments!.length}
                    </span>
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
    onConfirm: (payload?: { loggedHours?: number }) => void;
    currentUserId: string;
}

const TransitionDialog = ({ open, onOpenChange, task, targetPhase, transitionResult, onConfirm, currentUserId }: TransitionDialogProps) => {
    const [hours, setHours] = React.useState<string>("");

    React.useEffect(() => {
        if (open) setHours("");
    }, [open]);

    if (!task || !targetPhase || !transitionResult) return null;

    const fromLabel = COLUMNS.find((c) => c.phase === task.phase)?.label ?? task.phase;
    const toLabel = COLUMNS.find((c) => c.phase === targetPhase)?.label ?? targetPhase;
    const isBackward = PHASE_INDEX[targetPhase] < PHASE_INDEX[task.phase];
    const shouldPromptTime = task.assigneeId === currentUserId;

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

                {/* Optional Hours Input */}
                {shouldPromptTime && transitionResult.allowed && (
                    <div className="mt-4 p-3 rounded-xl bg-muted border border-border">
                        <label className="block text-sm font-semibold text-text-dark mb-1.5">{t("Time Tracking")}</label>
                        <p className="text-xs text-text-muted mb-2">{t("How many hours did you work on this task?")}</p>
                        <Input 
                            type="number" 
                            min="0"
                            step="0.5"
                            placeholder={t("e.g., 4.5")} 
                            value={hours} 
                            onChange={(e) => setHours(e.target.value)} 
                            className="w-full sm:w-1/2 bg-surface"
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t("Cancel")}</Button>
                    {transitionResult.allowed && (
                        <Button 
                            onClick={() => onConfirm(shouldPromptTime && hours ? { loggedHours: parseFloat(hours) } : undefined)}
                            disabled={shouldPromptTime && !hours.trim()}
                        >
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
    members: UserInterface[];
    currentUserId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onMoveRequest: (task: TaskInterface, targetPhase: TaskPhase) => void;
    onUpdateAttachments: (taskId: string, attachments: TaskAttachmentInterface[]) => void;
    onUpdateComments: (taskId: string, comments: TaskCommentInterface[]) => void;
    onUpdateTimeLogs: (taskId: string, timeLogs: TaskTimeLogInterface[]) => void;
}

const TaskDetailDialog = ({ task, member, blocker, members, currentUserId, open, onOpenChange, onMoveRequest, onUpdateAttachments, onUpdateComments, onUpdateTimeLogs }: TaskDetailDialogProps) => {
    if (!task) return null;

    const currentIndex = PHASE_INDEX[task.phase];
    const prevPhase = currentIndex > 0 ? COLUMNS[currentIndex - 1].phase : null;
    const nextPhase = currentIndex < COLUMNS.length - 1 ? COLUMNS[currentIndex + 1].phase : null;
    const attachments = task.attachments ?? [];
    const comments = task.comments ?? [];
    const timeLogs = task.timeLogs ?? [];

    const getMember = (id: string) => members.find((m) => m.id === id);
    const authUser = getMember(currentUserId);
    const isAssignee = task.assigneeId === currentUserId;
    const isManager = authUser?.role === UserRole.CEO || authUser?.role === UserRole.CTO || authUser?.role === UserRole.ProjectManager;

    const canSeeTimeLogs = isAssignee || isManager;

    const hoursByPhase = timeLogs.reduce((acc, log) => {
        const phaseLabel = COLUMNS.find((c) => c.phase === log.phase)?.label ?? log.phase;
        acc[phaseLabel] = (acc[phaseLabel] || 0) + log.hours;
        return acc;
    }, {} as Record<string, number>);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                const newAtt: TaskAttachmentInterface = {
                    id: `att-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    dataUrl: reader.result as string,
                    uploadedAt: new Date().toISOString(),
                };
                onUpdateAttachments(task.id, [...(task.attachments ?? []), newAtt]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = "";
    };

    const handleRemove = (id: string) => {
        onUpdateAttachments(task.id, attachments.filter((a) => a.id !== id));
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const isImage = (type: string) => type.startsWith("image/");

    // ── Comment state ──
    const [commentText, setCommentText] = useState("");
    const [mentionQuery, setMentionQuery] = useState("");
    const [showMentions, setShowMentions] = useState(false);
    const [mentionedId, setMentionedId] = useState<string | undefined>();
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentText, setEditCommentText] = useState("");
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // ── Work Log state ──
    const [workLogHours, setWorkLogHours] = useState("");
    const [workLogNote, setWorkLogNote] = useState("");

    const submitWorkLog = () => {
        const hours = parseFloat(workLogHours);
        if (isNaN(hours) || hours <= 0) return;
        const newLog: TaskTimeLogInterface = {
            id: `log-${Date.now()}`,
            userId: currentUserId,
            phase: task.phase,
            hours,
            description: workLogNote.trim(),
            createdAt: new Date().toISOString(),
        };
        onUpdateTimeLogs(task.id, [...timeLogs, newLog]);
        setWorkLogHours("");
        setWorkLogNote("");
    };

    const deleteWorkLog = (logId: string) => {
        onUpdateTimeLogs(task.id, timeLogs.filter((l) => l.id !== logId));
    };

    const mentionSuggestions = members.filter((m) =>
        mentionQuery.length > 0 && m.name.toLowerCase().includes(mentionQuery.toLowerCase())
    );

    const handleCommentInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setCommentText(val);
        const atIdx = val.lastIndexOf("@");
        if (atIdx !== -1 && atIdx === val.length - 1) {
            setMentionQuery("");
            setShowMentions(true);
        } else if (atIdx !== -1 && val.slice(atIdx + 1).match(/^\w+$/)) {
            setMentionQuery(val.slice(atIdx + 1));
            setShowMentions(true);
        } else {
            setShowMentions(false);
            setMentionQuery("");
        }
    };

    const pickMention = (m: UserInterface) => {
        const atIdx = commentText.lastIndexOf("@");
        setCommentText(commentText.slice(0, atIdx) + `@${m.name} `);
        setMentionedId(m.id);
        setShowMentions(false);
        textareaRef.current?.focus();
    };

    const submitComment = () => {
        if (!commentText.trim()) return;
        const newComment: TaskCommentInterface = {
            id: `cmt-${Date.now()}`,
            authorId: currentUserId,
            content: commentText.trim(),
            mentionedId,
            createdAt: new Date().toISOString(),
        };
        onUpdateComments(task.id, [...comments, newComment]);
        setCommentText("");
        setMentionedId(undefined);
        setShowMentions(false);
    };

    const handleDeleteComment = (commentId: string) => {
        onUpdateComments(task.id, comments.filter((c) => c.id !== commentId));
    };

    const handleStartEdit = (comment: TaskCommentInterface) => {
        setEditingCommentId(comment.id);
        setEditCommentText(comment.content);
    };

    const handleSaveEdit = () => {
        if (!editCommentText.trim() || !editingCommentId) return;
        onUpdateComments(
            task.id,
            comments.map((c) =>
                c.id === editingCommentId
                    ? { ...c, content: editCommentText.trim(), updatedAt: new Date().toISOString() }
                    : c
            )
        );
        setEditingCommentId(null);
        setEditCommentText("");
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditCommentText("");
    };

    const handleReact = (commentId: string, emoji: string) => {
        onUpdateComments(
            task.id,
            comments.map((c) => {
                if (c.id !== commentId) return c;
                const reactions = { ...(c.reactions || {}) };
                const users = reactions[emoji] || [];
                if (users.includes(currentUserId)) {
                    reactions[emoji] = users.filter((id) => id !== currentUserId);
                    if (reactions[emoji].length === 0) delete reactions[emoji];
                } else {
                    reactions[emoji] = [...users, currentUserId];
                }
                return { ...c, reactions };
            })
        );
    };

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

                {/* Attachments */}
                <div className="mt-4 pb-4 border-b border-border">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                            <Paperclip className="h-3.5 w-3.5" />
                            {t("Attachments")}
                            {attachments.length > 0 && <span className="bg-muted rounded-full px-1.5 py-0.5 text-[10px] font-semibold">{attachments.length}</span>}
                        </p>
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-primary hover:text-primary-dark font-medium transition-colors">
                            <Paperclip className="h-3.5 w-3.5" />
                            {t("Upload")}
                            <input type="file" multiple className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>

                    {attachments.length === 0 ? (
                        <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-6 cursor-pointer hover:border-primary hover:bg-primary-lighter/20 transition-colors">
                            <Paperclip className="h-6 w-6 text-text-muted" />
                            <p className="text-xs text-text-muted">{t("Click to upload files")}</p>
                            <input type="file" multiple className="hidden" onChange={handleFileChange} />
                        </label>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {attachments.map((att) => (
                                <div key={att.id} className="flex items-center gap-3 rounded-lg bg-muted p-2.5 group">
                                    {isImage(att.type) ? (
                                        <img src={att.dataUrl} alt={att.name} className="h-10 w-10 rounded object-cover shrink-0" />
                                    ) : (
                                        <div className="h-10 w-10 rounded bg-primary-lighter flex items-center justify-center shrink-0">
                                            <Paperclip className="h-4 w-4 text-primary" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <a href={att.dataUrl} download={att.name} className="text-xs font-medium text-text-dark hover:text-primary truncate block transition-colors">{att.name}</a>
                                        <p className="text-[10px] text-text-muted">{formatSize(att.size)}</p>
                                    </div>
                                    <button onClick={() => handleRemove(att.id)} className="p-1 rounded text-text-muted hover:text-error hover:bg-error-light opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
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

                {/* Work Logs */}
                {canSeeTimeLogs && (
                    <div className="mt-4 pb-4 border-b border-border">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {t("Time Tracking / Work Logs")}
                                {timeLogs.length > 0 && <span className="bg-muted rounded-full px-1.5 py-0.5 text-[10px] font-semibold">{timeLogs.length}</span>}
                            </p>
                            {timeLogs.length > 0 && (
                                <span className="text-xs font-semibold text-text-dark bg-muted px-2 py-1 rounded-lg">
                                    {t("Total")}: {timeLogs.reduce((sum, l) => sum + l.hours, 0)} {t("h")}
                                </span>
                            )}
                        </div>

                        {/* Breakdown by phase */}
                        {Object.keys(hoursByPhase).length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                {Object.entries(hoursByPhase).map(([phase, hours]) => (
                                    <Badge key={phase} variant="secondary" className="text-[10px]">
                                        {t(phase)}: {hours} {t("h")}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    
                    {timeLogs.length > 0 && (
                        <div className="flex flex-col gap-2 mb-3">
                            {timeLogs.map((log) => {
                                const author = getMember(log.userId);
                                return (
                                    <div key={log.id} className="flex gap-2.5 items-start p-2 rounded-lg bg-surface border border-transparent hover:border-border transition-colors group">
                                        <Avatar className="h-6 w-6 shrink-0 mt-0.5">
                                            <AvatarFallback className="text-[8px]">{author?.avatar ?? "?"}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <span className="text-xs font-medium text-text-dark">{author?.name ?? t("Unknown")}</span>
                                                <span className="text-[10px] text-text-muted">
                                                    {new Date(log.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short" })}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-2 mt-0.5">
                                                <p className="text-xs text-text-secondary">{log.description || <span className="italic opacity-50">{t("No note")}</span>}</p>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-xs font-bold text-primary px-1.5 py-0.5 rounded bg-primary-lighter/30">{log.hours} {t("h")}</span>
                                                    {log.userId === currentUserId && (
                                                        <button onClick={() => deleteWorkLog(log.id)} className="p-1 rounded text-text-muted hover:text-error hover:bg-error-light opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    <div className="flex items-stretch gap-2 bg-muted p-2 rounded-xl border border-border">
                        <Input 
                            type="number" 
                            min="0.5" 
                            step="0.5" 
                            placeholder={t("Hrs")} 
                            value={workLogHours} 
                            onChange={(e) => setWorkLogHours(e.target.value)} 
                            className="w-20 bg-surface h-8 text-sm"
                        />
                        <div className="relative flex-1">
                            <Input 
                                placeholder={t("What did you work on? (optional)")} 
                                value={workLogNote} 
                                onChange={(e) => setWorkLogNote(e.target.value)} 
                                onKeyDown={(e) => { if (e.key === "Enter") submitWorkLog(); }}
                                className="w-full bg-surface h-8 text-sm"
                            />
                        </div>
                        <Button onClick={submitWorkLog} disabled={!workLogHours || parseFloat(workLogHours) <= 0} size="sm" className="h-8">
                            {t("Log time")}
                        </Button>
                    </div>
                </div>
                )}

                {/* Comments */}
                <div className="mt-4">
                    <p className="text-xs font-medium text-text-muted flex items-center gap-1.5 mb-3">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {t("Comments")}
                        {comments.length > 0 && <span className="bg-muted rounded-full px-1.5 py-0.5 text-[10px] font-semibold">{comments.length}</span>}
                    </p>

                    {/* Existing comments */}
                    {comments.length > 0 && (
                        <div className="flex flex-col gap-3 mb-4">
                            {comments.map((c) => {
                                const author = getMember(c.authorId);
                                const mentioned = getMember(c.mentionedId ?? "");
                                const isAuthor = c.authorId === currentUserId;
                                const isEditing = editingCommentId === c.id;

                                return (
                                    <div key={c.id} className="flex gap-2.5 group">
                                        <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                                            <AvatarFallback className="text-[9px]">{author?.avatar ?? "?"}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-xs font-semibold text-text-dark">{author?.name ?? t("Unknown")}</span>
                                                {mentioned && (
                                                    <span className="flex items-center gap-0.5 text-[10px] text-primary">
                                                        <AtSign className="h-3 w-3" />{mentioned.name}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-text-muted ms-auto flex items-center">
                                                    {new Date(c.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                                    {c.updatedAt && <span className="ms-1 italic opacity-70">({t("edited")})</span>}
                                                </span>
                                            </div>

                                            {isEditing ? (
                                                <div className="mt-1">
                                                    <textarea
                                                        value={editCommentText}
                                                        onChange={(e) => setEditCommentText(e.target.value)}
                                                        className="w-full rounded-md border border-input bg-surface px-2 py-1 text-sm text-text-dark focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                                        rows={2}
                                                    />
                                                    <div className="flex justify-end gap-1 mt-1">
                                                        <button onClick={handleCancelEdit} className="p-1 text-text-muted hover:text-text-dark bg-muted rounded-md transition-colors"><X className="h-3 w-3" /></button>
                                                        <button onClick={handleSaveEdit} className="p-1 text-success hover:text-success-dark bg-success-light/30 rounded-md transition-colors"><Check className="h-3 w-3" /></button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-text-secondary bg-muted rounded-lg px-3 py-2">{c.content}</p>
                                            )}

                                            {/* Reactions & Actions */}
                                            {!isEditing && (
                                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                    {Object.entries(c.reactions || {}).map(([emoji, users]) => (
                                                        <button
                                                            key={emoji}
                                                            onClick={() => handleReact(c.id, emoji)}
                                                            className={cn(
                                                                "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] transition-colors",
                                                                users.includes(currentUserId) ? "bg-primary-lighter/30 text-primary border border-primary/20" : "bg-muted text-text-muted hover:bg-muted-dark hover:text-text-dark"
                                                            )}
                                                        >
                                                            <span>{emoji}</span>
                                                            <span className="font-medium">{users.length}</span>
                                                        </button>
                                                    ))}

                                                    <div className="flex items-center gap-1 ms-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="relative group/react">
                                                            <button className="p-1.5 rounded text-text-muted hover:text-text-dark hover:bg-muted transition-colors"><Smile className="h-3.5 w-3.5" /></button>
                                                            <div className="absolute bottom-full end-0 pb-1 hidden group-hover/react:block z-10 w-max">
                                                                <div className="flex items-center gap-1 p-1 bg-surface border border-border rounded-lg shadow-lg">
                                                                    {["👍", "👎", "😄", "🎉", "😕", "👀", "❤️", "🚀"].map(emoji => (
                                                                        <button key={emoji} onClick={() => handleReact(c.id, emoji)} className="p-1.5 hover:bg-muted rounded text-sm transition-colors">{emoji}</button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {isAuthor && (
                                                            <>
                                                                <button onClick={() => handleStartEdit(c)} className="p-1.5 rounded text-text-muted hover:text-primary hover:bg-primary-lighter/20 transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                                                                <button onClick={() => handleDeleteComment(c.id)} className="p-1.5 rounded text-text-muted hover:text-error hover:bg-error-light transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Input */}
                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            value={commentText}
                            onChange={handleCommentInput}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
                            placeholder={t("Write a comment… type @ to mention someone")}
                            rows={2}
                            className="w-full rounded-[var(--radius-default)] border border-input bg-surface px-3 py-2 pe-10 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-colors"
                        />
                        <button
                            onClick={submitComment}
                            disabled={!commentText.trim()}
                            className="absolute bottom-2 end-2 p-1.5 rounded-md text-primary hover:bg-primary-lighter disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <Send className="h-4 w-4" />
                        </button>

                        {/* Mention dropdown */}
                        {showMentions && mentionSuggestions.length > 0 && (
                            <div className="absolute bottom-full mb-1 start-0 w-full max-h-40 overflow-y-auto rounded-xl border border-border bg-surface shadow-lg z-50">
                                {mentionSuggestions.map((m) => (
                                    <button
                                        key={m.id}
                                        onMouseDown={(e) => { e.preventDefault(); pickMention(m); }}
                                        className="flex items-center gap-2 w-full px-3 py-2 hover:bg-accent text-left transition-colors cursor-pointer"
                                    >
                                        <Avatar className="h-6 w-6 shrink-0">
                                            <AvatarFallback className="text-[9px]">{m.avatar}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-xs font-medium text-text-dark">{m.name}</p>
                                            <p className="text-[10px] text-text-muted">{m.team}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
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
import { cn, getStorageItem, setStorageItem, storageKeys } from "@/utils";
import {
    COLUMNS,
    COLUMN_COLORS,
    capitalize,
    phaseLabel,
    inferWorkType,
    checkTransition,
    type TransitionResult,
} from "../../data/seed/constants";
import { BoardView } from "./BoardView";
import { PipelineView } from "./PipelineView";
import { TaskDetailDialog } from "./TaskDetailDialog";
import { TransitionDialog } from "./TransitionDialog";



/* -------------------------------------------------------------------------- */
/*  Main View                                                                  */
/* -------------------------------------------------------------------------- */

export const TasksView = () => {
    const isLoading = usePageLoader();
    useSettings();
    const { activeSprintId } = useSprintStore();

    // Initialise tasks — migrate any legacy items missing workType in the initialiser itself (no useEffect needed)
    const [allTasks, setAllTasks] = useState<TaskInterface[]>(() => {
        const stored = getStorageItem<TaskInterface[]>(storageKeys.tasks) ?? [];
        const hasMissing = stored.some((t) => !t.workType);
        if (!hasMissing) return stored;
        const migrated = stored.map((t) => t.workType ? t : { ...t, workType: inferWorkType(t.tags) });
        setStorageItem(storageKeys.tasks, migrated);
        return migrated;
    });

    const members = getStorageItem<UserInterface[]>(storageKeys.teamMembers) ?? [];
    const blockers = getStorageItem<BlockerInterface[]>(storageKeys.blockers) ?? [];

    const [selectedTask, setSelectedTask] = useState<TaskInterface | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
    const [phaseFilter, setPhaseFilter] = useState<string>("all");
    const [readinessFilter, setReadinessFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"board" | "pipeline">("board");

    const [draggedTask, setDraggedTask] = useState<TaskInterface | null>(null);
    const [dragOverPhase, setDragOverPhase] = useState<TaskPhase | null>(null);

    const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
    const [transitionTask, setTransitionTask] = useState<TaskInterface | null>(null);
    const [transitionTarget, setTransitionTarget] = useState<TaskPhase | null>(null);
    const [transitionResult, setTransitionResult] = useState<TransitionResult | null>(null);

    // ── Derived data ──────────────────────────────────────────────────────────

    const sprintTasks = useMemo(
        () => allTasks.filter((t) => t.sprintId === activeSprintId),
        [allTasks, activeSprintId],
    );

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
        const q = searchQuery.toLowerCase().trim();
        return sprintTasks.filter((t) =>
            (!q || t.title.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q))) &&
            (priorityFilter === "all" || t.priority === priorityFilter) &&
            (assigneeFilter === "all" || t.assigneeId === assigneeFilter),
        );
    }, [sprintTasks, searchQuery, priorityFilter, assigneeFilter]);

    const tasksByPhase = useMemo(() => {
        const map = new Map<TaskPhase, TaskInterface[]>();
        for (const col of COLUMNS) map.set(col.phase, []);
        for (const task of filteredTasks) map.get(task.phase)?.push(task);
        return map;
    }, [filteredTasks]);

    const selectedBlocker = useMemo(
        () => blockers.find((b) => b.id === selectedTask?.blockerId),
        [selectedTask, blockers],
    );

    const selectedMember = useMemo(
        () => members.find((m) => m.id === selectedTask?.assigneeId),
        [selectedTask, members],
    );

    const sprintAssigneeIds = useMemo(
        () => [...new Set(sprintTasks.map((t) => t.assigneeId))],
        [sprintTasks],
    );

    const totalPoints = sprintTasks.reduce((sum, t) => sum + t.storyPoints, 0);
    const donePoints  = sprintTasks.filter((t) => t.phase === COLUMNS[COLUMNS.length - 1].phase).reduce((sum, t) => sum + t.storyPoints, 0);
    const blockedCount = sprintTasks.filter((t) => t.hasBlocker).length;

    // ── Mutations ─────────────────────────────────────────────────────────────

    const updateTasks = useCallback((updater: (prev: TaskInterface[]) => TaskInterface[]) => {
        setAllTasks((prev) => {
            const next = updater(prev);
            setStorageItem(storageKeys.tasks, next);
            return next;
        });
    }, []);

    const handleAddTask = useCallback((task: TaskInterface) => {
        updateTasks((prev) => [...prev, task]);
    }, [updateTasks]);

    // Move task to new phase
    const moveTask = useCallback((taskId: string, newPhase: TaskPhase, extraProps?: Partial<TaskInterface>) => {
        updateTasks((prev) => prev.map((t) =>
            t.id === taskId ? { ...t, phase: newPhase, updatedAt: new Date().toISOString().split("T")[0], ...extraProps } : t,
    const updateTaskField = useCallback((taskId: string, field: keyof TaskInterface, value: any) => {
        updateTasks((prev) => prev.map((t) =>
            t.id === taskId ? { ...t, [field]: value, updatedAt: new Date().toISOString().split("T")[0] } : t,
        ));
    }, [updateTasks]);

    // ── Transition flow ───────────────────────────────────────────────────────

    const requestTransition = useCallback((task: TaskInterface, targetPhase: TaskPhase) => {
        if (task.phase === targetPhase) return;
        setTransitionTask(task);
        setTransitionTarget(targetPhase);
        setTransitionResult(checkTransition(task, targetPhase, blockers));
        setTransitionDialogOpen(true);
    }, [blockers]);

    // Confirm and execute the transition
    const confirmTransition = useCallback((payload?: { loggedHours?: number }) => {
        if (!transitionTask || !transitionTarget) return;

        const fromLabel = COLUMNS.find((c) => c.phase === transitionTask.phase)?.label;
        const toLabel = COLUMNS.find((c) => c.phase === transitionTarget)?.label;

        const extraProps: Partial<TaskInterface> = {};
        if (payload?.loggedHours) {
            const currentUserId = getStorageItem<{ id: string }>(storageKeys.authUser)?.id ?? "";
            const newLog: TaskTimeLogInterface = {
                id: `log-${Date.now()}`,
                userId: currentUserId,
                phase: transitionTask.phase,
                hours: payload.loggedHours,
                description: `Time tracked moving to ${toLabel ?? transitionTarget}`,
                createdAt: new Date().toISOString(),
            };
            extraProps.timeLogs = [...(transitionTask.timeLogs ?? []), newLog];
        }

        moveTask(transitionTask.id, transitionTarget, extraProps);
    const confirmTransition = useCallback(() => {
        if (!transitionTask || !transitionTarget) return;
        updateTaskField(transitionTask.id, "phase", transitionTarget);
        toast.success(`${t("Task moved")}: ${t(phaseLabel(transitionTask.phase))} → ${t(phaseLabel(transitionTarget))}`, {
            description: transitionTask.title,
        });
        setTransitionDialogOpen(false);
        setTransitionTask(null);
        setTransitionTarget(null);
        setTransitionResult(null);
    }, [transitionTask, transitionTarget, updateTaskField, t]);

    // ── Drag handlers ─────────────────────────────────────────────────────────

    const handleDragStart  = useCallback((_e: DragEvent<HTMLDivElement>, task: TaskInterface) => setDraggedTask(task), []);
    const handleDragOver   = useCallback((e: DragEvent<HTMLDivElement>) => e.preventDefault(), []);
    const handleDragEnter  = useCallback((_e: DragEvent<HTMLDivElement>, phase: TaskPhase) => setDragOverPhase(phase), []);
    const handleDragLeave  = useCallback((e: DragEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverPhase(null);
    }, []);
    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>, targetPhase: TaskPhase) => {
        e.preventDefault();
        setDragOverPhase(null);
        if (draggedTask && draggedTask.phase !== targetPhase) requestTransition(draggedTask, targetPhase);
        setDraggedTask(null);
    }, [draggedTask, requestTransition]);

    const handleTaskClick = (task: TaskInterface) => {
        setSelectedTask(task);
        setDialogOpen(true);
    };

    const handleUpdateAttachments = useCallback((taskId: string, attachments: TaskAttachmentInterface[]) => {
        updateTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, attachments } : t));
        setSelectedTask((prev) => prev?.id === taskId ? { ...prev, attachments } : prev);
    }, [updateTasks]);

    const handleUpdateComments = useCallback((taskId: string, comments: TaskCommentInterface[]) => {
        updateTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, comments } : t));
        setSelectedTask((prev) => prev?.id === taskId ? { ...prev, comments } : prev);
    }, [updateTasks]);

    const handleUpdateTimeLogs = useCallback((taskId: string, timeLogs: TaskTimeLogInterface[]) => {
        updateTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, timeLogs } : t));
        setSelectedTask((prev) => prev?.id === taskId ? { ...prev, timeLogs } : prev);
    }, [updateTasks]);

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
    // ── Render ────────────────────────────────────────────────────────────────

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
                                    <SelectItem value="all">{t("All Priorities")}</SelectItem>
                                    {(["critical", "high", "medium", "low"] as const).map((p) => (
                                        <SelectItem key={p} value={p}>{t(capitalize(p))}</SelectItem>
                                    ))}
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
                            <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setAddTaskDialogOpen(true)}>
                                <Plus className="h-4 w-4" />
                                {t("Add Task")}
                            </Button>
                        </div>

                        <div className="flex items-center bg-muted p-1 rounded-lg ml-auto">
                            <Button variant={viewMode === "board" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("board")} className="h-7 text-xs px-3">
                                {t("Kanban")}
                            </Button>
                            <Button variant={viewMode === "pipeline" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("pipeline")} className="h-7 text-xs px-3">
                                {t("Pipeline")}
                            </Button>
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

            {filteredTasks.length === 0 ? (
                <EmptyState icon={ClipboardList} title={t("No tasks found")} description={t("Try adjusting your filters or search query.")} />
            ) : viewMode === "board" ? (
                <BoardView
                    tasksByPhase={tasksByPhase}
                    members={members}
                    draggedTask={draggedTask}
                    dragOverPhase={dragOverPhase}
                    handleDragStart={handleDragStart}
                    handleDragOver={handleDragOver}
                    handleDragEnter={handleDragEnter}
                    handleDragLeave={handleDragLeave}
                    handleDrop={handleDrop}
                    setSelectedTask={setSelectedTask}
                    setDialogOpen={setDialogOpen}
                />
            ) : (
                <PipelineView
                    tasks={filteredTasks}
                    members={members}
                    setSelectedTask={setSelectedTask}
                    setDialogOpen={setDialogOpen}
                />
            )}

            <TaskDetailDialog
                task={selectedTask}
                member={selectedMember}
                blocker={selectedBlocker}
                members={members}
                currentUserId={getStorageItem<{ id: string }>(storageKeys.authUser)?.id ?? ""}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onMoveRequest={requestTransition}
                onUpdateAttachments={handleUpdateAttachments}
                onUpdateComments={handleUpdateComments}
                onUpdateTimeLogs={handleUpdateTimeLogs}
            />

            <TransitionDialog
                open={transitionDialogOpen}
                onOpenChange={setTransitionDialogOpen}
                task={transitionTask}
                targetPhase={transitionTarget}
                transitionResult={transitionResult}
                onConfirm={confirmTransition}
                currentUserId={getStorageItem<{ id: string }>(storageKeys.authUser)?.id ?? ""}
            />

            {/* Add Task Dialog */}
            <AddTaskDialog
                open={addTaskDialogOpen}
                onOpenChange={setAddTaskDialogOpen}
                members={members}
                sprintId={activeSprintId ?? ""}
                onAddTask={handleAddTask}
            />
        </div>
    );
};
