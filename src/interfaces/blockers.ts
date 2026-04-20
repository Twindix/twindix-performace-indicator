import type { BlockerImpact, BlockerStatus, BlockerType } from "@/enums";

export interface BlockerInterface {
    id: string;
    title: string;
    description: string;
    type: BlockerType;
    status: BlockerStatus;
    impact: BlockerImpact;
    reporterId: string;
    ownerId: string;
    taskIds: string[];
    sprintId: string;
    createdAt: string;
    resolvedAt?: string;
    durationDays: number;
    notes: string;
}
