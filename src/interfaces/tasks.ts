import type { TaskPhase, TaskPriority } from "@/enums";

export interface ReadinessChecklistInterface {
    acceptanceCriteriaDefined: boolean;
    businessRulesClear: boolean;
    edgeCasesIdentified: boolean;
    dependenciesMapped: boolean;
    designAvailable: boolean;
    apiContractReady: boolean;
    estimationDone: boolean;
}

export interface TaskInterface {
    id: string;
    title: string;
    description: string;
    assigneeId: string;
    phase: TaskPhase;
    priority: TaskPriority;
    storyPoints: number;
    sprintId: string;
    readinessScore: number;
    readinessChecklist: ReadinessChecklistInterface;
    hasBlocker: boolean;
    blockerId?: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    workType: "Design" | "Frontend" | "Backend" | "QA" | "Done";
}
