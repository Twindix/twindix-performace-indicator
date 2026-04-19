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

export interface SprintSummaryResponseInterface {
    data: {
        totalTasks: number;
        completedTasks: number;
        blockedTasks: number;
        healthScore: number;
    };
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
    isLoading: boolean;
    refetch: () => Promise<void>;
    fetchSprintDetail: (id: string) => Promise<SprintInterface | null>;
    createSprint: (payload: CreateSprintPayloadInterface) => Promise<SprintInterface | null>;
    updateSprint: (id: string, payload: UpdateSprintPayloadInterface) => Promise<SprintInterface | null>;
    deleteSprint: (id: string) => Promise<boolean>;
    activateSprint: (id: string) => Promise<SprintInterface | null>;
}
