import type { DecisionCategory, DecisionStatus } from "@/enums";

export interface DecisionInterface {
    id: string;
    title: string;
    description: string;
    context: string;
    status: DecisionStatus;
    ownerId: string;
    participants: string[];
    sprintId: string;
    createdAt: string;
    decidedAt?: string;
    category: DecisionCategory;
    outcome?: string;
}
