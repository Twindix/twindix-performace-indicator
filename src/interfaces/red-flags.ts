export type RedFlagSeverity = "low" | "medium" | "high" | "critical";

export interface RedFlagInterface {
    id: string;
    title: string;
    description: string;
    severity: RedFlagSeverity;
    createdById: string;
    createdAt: string;
    updatedAt: string;
    sprintId: string;
}
