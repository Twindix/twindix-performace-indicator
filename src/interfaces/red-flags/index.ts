export type RedFlagSeverity = "low" | "medium" | "high" | "critical";

export interface RedFlagInterface {
    id: string;
    title: string;
    description: string;
    severity: RedFlagSeverity;
    is_stalled?: boolean;
    createdById: string;
    createdAt: string;
    updatedAt: string;
    sprintId: string;
}

export interface RedFlagsListResponseInterface {
    data: RedFlagInterface[];
    isSuccess: boolean;
}

export interface RedFlagDetailResponseInterface {
    data: RedFlagInterface;
    isSuccess: boolean;
}

export interface RedFlagsCountInterface {
    count: number;
}

export interface RedFlagsCountResponseInterface {
    data: RedFlagsCountInterface;
    isSuccess: boolean;
}

export interface CreateRedFlagPayloadInterface {
    title: string;
    description?: string;
    severity: RedFlagSeverity;
}

export interface UpdateRedFlagPayloadInterface {
    title?: string;
    description?: string;
    severity?: RedFlagSeverity;
    is_stalled?: boolean;
}

export interface RedFlagsListFiltersInterface {
    severity?: RedFlagSeverity;
    per_page?: number;
}

export interface RedFlagsContextInterface {
    redFlags: RedFlagInterface[];
    count: number;
    isLoading: boolean;
    refetch: (filters?: RedFlagsListFiltersInterface) => Promise<void>;
    refetchCount: () => Promise<void>;
    patchRedFlagLocal: (flag: RedFlagInterface) => void;
    removeRedFlagLocal: (id: string) => void;
}
