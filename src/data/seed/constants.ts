import { TaskPhase, TaskPriority, BlockerStatus } from "@/enums";
import type { TaskInterface, BlockerInterface, ReadinessChecklistInterface } from "@/interfaces";

export const COLUMNS: { phase: TaskPhase; label: string; index: number }[] = [
    { phase: TaskPhase.Backlog, label: "Backlog", index: 0 },
    { phase: TaskPhase.Ready, label: "Ready", index: 1 },
    { phase: TaskPhase.InProgress, label: "In Progress", index: 2 },
    { phase: TaskPhase.Review, label: "Review", index: 3 },
    { phase: TaskPhase.QA, label: "QA", index: 4 },
    { phase: TaskPhase.Done, label: "Done", index: 5 },
];

export const PHASE_INDEX: Record<TaskPhase, number> = {
    [TaskPhase.Backlog]: 0,
    [TaskPhase.Ready]: 1,
    [TaskPhase.InProgress]: 2,
    [TaskPhase.Review]: 3,
    [TaskPhase.QA]: 4,
    [TaskPhase.Done]: 5,
};

export const PRIORITY_VARIANT: Record<TaskPriority, "error" | "warning" | "default" | "secondary"> = {
    [TaskPriority.Critical]: "error",
    [TaskPriority.High]: "warning",
    [TaskPriority.Medium]: "default",
    [TaskPriority.Low]: "secondary",
};

export const READINESS_LABELS: { key: keyof ReadinessChecklistInterface; label: string }[] = [
    { key: "acceptanceCriteriaDefined", label: "Acceptance criteria defined" },
    { key: "businessRulesClear", label: "Business rules clear" },
    { key: "edgeCasesIdentified", label: "Edge cases identified" },
    { key: "dependenciesMapped", label: "Dependencies mapped" },
    { key: "designAvailable", label: "Design available" },
    { key: "apiContractReady", label: "API contract ready" },
    { key: "estimationDone", label: "Estimation done" },
];

export const COLUMN_COLORS: Record<TaskPhase, string> = {
    [TaskPhase.Backlog]: "bg-text-muted",
    [TaskPhase.Ready]: "bg-primary",
    [TaskPhase.InProgress]: "bg-warning",
    [TaskPhase.Review]: "bg-[#8b5cf6]",
    [TaskPhase.QA]: "bg-[#ec4899]",
    [TaskPhase.Done]: "bg-success",
};

/* -------------------------------------------------------------------------- */
/*  Pure Helpers                                                                */
/* -------------------------------------------------------------------------- */

/** Capitalise the first character of a string. */
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Human-readable label for a TaskPhase. Uses COLUMNS as the single source of truth. */
export const phaseLabel = (phase: TaskPhase): string =>
    COLUMNS.find((c) => c.phase === phase)?.label ?? capitalize(phase);

/** Infer the best-guess workType from a task's tags (for legacy data migration). */
export const inferWorkType = (tags: string[]): TaskInterface["workType"] => {
    const lower = tags.map((t) => t.toLowerCase());
    if (lower.some((t) => ["design", "ux", "ui", "figma"].includes(t))) return "Design";
    if (lower.some((t) => ["backend", "api", "db", "sql", "auth"].includes(t))) return "Backend";
    if (lower.some((t) => ["qa", "testing", "bug"].includes(t))) return "QA";
    return "Frontend";
};

/* -------------------------------------------------------------------------- */
/*  Transition Gate Logic (pure — no React state)                              */
/* -------------------------------------------------------------------------- */

export interface TransitionResult {
    allowed: boolean;
    reason: string;
    criteria: { label: string; met: boolean }[];
}

const READINESS_THRESHOLD = 70;

type TransitionRule = (task: TaskInterface, blocker: BlockerInterface | undefined) => TransitionResult;

// One entry per valid forward transition — replaces the if/else chain in index.tsx
const TRANSITION_RULES: Partial<Record<string, TransitionRule>> = {
    [`${TaskPhase.Backlog}->${TaskPhase.Ready}`]: (task) => {
        const criteria = READINESS_LABELS.map(({ key, label }) => ({ label, met: task.readinessChecklist[key] }));
        const ok = task.readinessScore >= READINESS_THRESHOLD;
        criteria.push({ label: `Readiness score ≥ ${READINESS_THRESHOLD}% (currently ${task.readinessScore}%)`, met: ok });
        return {
            allowed: ok,
            reason: ok
                ? "All readiness criteria met. Task is ready for development."
                : `Readiness score is ${task.readinessScore}% — needs ${READINESS_THRESHOLD}%. Complete the missing checklist items first.`,
            criteria,
        };
    },
    [`${TaskPhase.Ready}->${TaskPhase.InProgress}`]: (task, blocker) => {
        const hasAssignee = (task.assigneeIds ?? []).length > 0;
        const notBlocked = !blocker;
        const criteria = [
            { label: "Task has an assignee", met: hasAssignee },
            { label: "No active blockers", met: notBlocked },
        ];
        const allowed = hasAssignee && notBlocked;
        return {
            allowed,
            reason: allowed ? "Task is ready to start development."
                : !hasAssignee ? "Task must have an assignee before starting."
                : `Task is blocked: "${blocker?.title}". Resolve the blocker first.`,
            criteria,
        };
    },
    [`${TaskPhase.InProgress}->${TaskPhase.Review}`]: (_task, blocker) => {
        const notBlocked = !blocker;
        return {
            allowed: notBlocked,
            reason: notBlocked ? "Task is ready for code review." : `Task is blocked: "${blocker?.title}". Resolve before requesting review.`,
            criteria: [
                { label: "No active blockers", met: notBlocked },
                { label: "Implementation completed", met: true },
                { label: "Self-review done", met: true },
            ],
        };
    },
    [`${TaskPhase.Review}->${TaskPhase.QA}`]: (_task, blocker) => {
        const notBlocked = !blocker;
        return {
            allowed: notBlocked,
            reason: notBlocked ? "Task is ready for QA testing." : `Task is blocked: "${blocker?.title}". Resolve before moving to QA.`,
            criteria: [
                { label: "No active blockers", met: notBlocked },
                { label: "Code review approved", met: true },
                { label: "Review comments addressed", met: true },
            ],
        };
    },
    [`${TaskPhase.QA}->${TaskPhase.Done}`]: (_task, blocker) => {
        const notBlocked = !blocker;
        return {
            allowed: notBlocked,
            reason: notBlocked ? "Task has passed QA and is ready to be marked as done." : `Task is blocked: "${blocker?.title}". Cannot mark as done until resolved.`,
            criteria: [
                { label: "No active blockers", met: notBlocked },
                { label: "All test cases passed", met: true },
                { label: "No critical bugs found", met: true },
                { label: "Product owner sign-off", met: true },
            ],
        };
    },
};

export const checkTransition = (task: TaskInterface, toPhase: TaskPhase, blockers: BlockerInterface[]): TransitionResult => {
    const fromIndex = PHASE_INDEX[task.phase];
    const toIndex = PHASE_INDEX[toPhase];

    if (toIndex < fromIndex)
        return { allowed: true, reason: "Moving task back to a previous phase.", criteria: [{ label: "Backward transitions are always allowed", met: true }] };

    if (toIndex > fromIndex + 1)
        return { allowed: false, reason: "Tasks can only move one phase forward at a time.", criteria: [{ label: "Sequential phase transition (one step at a time)", met: false }] };

    const activeBlocker = task.hasBlocker
        ? blockers.find((b) => b.id === task.blockerId && (b.status === BlockerStatus.Active || b.status === BlockerStatus.Escalated))
        : undefined;

    const rule = TRANSITION_RULES[`${task.phase}->${toPhase}`];
    return rule ? rule(task, activeBlocker) : { allowed: true, reason: "", criteria: [] };
};
