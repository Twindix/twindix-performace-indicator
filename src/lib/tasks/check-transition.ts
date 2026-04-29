import { tasksConstants } from "@/constants";
import { BlockerStatus, TaskPhase } from "@/enums";
import type {
    BlockerInterface,
    TaskInterface,
    TransitionResultInterface,
} from "@/interfaces";

type TransitionRule = (task: TaskInterface, blocker: BlockerInterface | undefined) => TransitionResultInterface;

const TRANSITION_RULES: Partial<Record<string, TransitionRule>> = {
    [`${TaskPhase.Backlog}->${TaskPhase.Ready}`]: (task) => {
        const criteria = tasksConstants.readinessLabels.map(({ key, label }) => ({
            label,
            met: task.readinessChecklist?.[key] ?? false,
        }));
        const ok = (task.readinessScore ?? 0) >= tasksConstants.readinessThreshold;
        criteria.push({
            label: `Readiness score ≥ ${tasksConstants.readinessThreshold}% (currently ${task.readinessScore}%)`,
            met: ok,
        });
        return {
            allowed: ok,
            reason: ok
                ? "All readiness criteria met. Task is ready for development."
                : `Readiness score is ${task.readinessScore}% — needs ${tasksConstants.readinessThreshold}%. Complete the missing checklist items first.`,
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
            reason: allowed
                ? "Task is ready to start development."
                : !hasAssignee
                    ? "Task must have an assignee before starting."
                    : `Task is blocked: "${blocker?.title}". Resolve the blocker first.`,
            criteria,
        };
    },
    [`${TaskPhase.InProgress}->${TaskPhase.Review}`]: (_task, blocker) => {
        const notBlocked = !blocker;
        return {
            allowed: notBlocked,
            reason: notBlocked
                ? "Task is ready for code review."
                : `Task is blocked: "${blocker?.title}". Resolve before requesting review.`,
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
            reason: notBlocked
                ? "Task is ready for QA testing."
                : `Task is blocked: "${blocker?.title}". Resolve before moving to QA.`,
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
            reason: notBlocked
                ? "Task has passed QA and is ready to be marked as done."
                : `Task is blocked: "${blocker?.title}". Cannot mark as done until resolved.`,
            criteria: [
                { label: "No active blockers", met: notBlocked },
                { label: "All test cases passed", met: true },
                { label: "No critical bugs found", met: true },
                { label: "Product owner sign-off", met: true },
            ],
        };
    },
};

export const checkTransition = (
    task: TaskInterface,
    toPhase: TaskPhase,
    blockers: BlockerInterface[],
): TransitionResultInterface => {
    const fromIndex = tasksConstants.phaseIndex[(task.phase as TaskPhase) ?? TaskPhase.Backlog];
    const toIndex = tasksConstants.phaseIndex[toPhase];

    if (toIndex < fromIndex) {
        return {
            allowed: true,
            reason: "Moving task back to a previous phase.",
            criteria: [{ label: "Backward transitions are always allowed", met: true }],
        };
    }

    if (toIndex > fromIndex + 1) {
        return {
            allowed: false,
            reason: "Tasks can only move one phase forward at a time.",
            criteria: [{ label: "Sequential phase transition (one step at a time)", met: false }],
        };
    }

    const activeBlocker = task.hasBlocker
        ? blockers.find((b) => b.id === task.blockerId && (b.status === BlockerStatus.Active || b.status === BlockerStatus.Escalated))
        : undefined;

    const rule = TRANSITION_RULES[`${task.phase}->${toPhase}`];
    return rule ? rule(task, activeBlocker) : { allowed: true, reason: "", criteria: [] };
};
