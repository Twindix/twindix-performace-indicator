import type { SprintStatus } from "@/enums";

export interface SprintInterface {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: SprintStatus;
    healthScore: number;
    goals: string[];
}

export interface SprintListResponseInterface {
    data: SprintInterface[];
    isSuccess: boolean;
}

export interface SprintDetailResponseInterface {
    data: SprintInterface;
    isSuccess: boolean;
}

export interface SprintSummaryInterface {
    total_tasks: number;
    completed_tasks: number;
    total_story_points: number;
    total_estimated_hours: number;
    blocked_count: number;
}

export interface SprintSummaryResponseInterface {
    data: SprintSummaryInterface;
    isSuccess: boolean;
}

export interface CreateSprintPayloadInterface {
    name: string;
    startDate: string;
    endDate: string;
    goals?: string[];
}

export interface UpdateSprintPayloadInterface extends Partial<CreateSprintPayloadInterface> {
    status?: SprintStatus;
}

export interface SprintsContextInterface {
    sprints: SprintInterface[];
    summaries: Record<string, SprintSummaryInterface | undefined>;
    isLoading: boolean;
    refetch: () => Promise<void>;
    setSummary: (id: string, summary: SprintSummaryInterface) => void;
    patchSprintLocal: (sprint: SprintInterface) => void;
    removeSprintLocal: (id: string) => void;
}
