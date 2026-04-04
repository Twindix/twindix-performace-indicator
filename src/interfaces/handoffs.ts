export interface CriterionInterface {
    id: string;
    label: string;
    met: boolean;
}

export interface HandoffInterface {
    id: string;
    fromPhase: string;
    toPhase: string;
    taskId: string;
    entryCriteria: CriterionInterface[];
    exitCriteria: CriterionInterface[];
    completionRate: number;
    completedAt?: string;
    sprintId: string;
}
