export type RedFlagSeverity = "medium" | "high" | "critical";

export interface RedFlagReporterInterface {
    id: string;
    full_name: string;
    avatar_initials: string;
}

export interface RedFlagInterface {
    id: string;
    title: string;
    description: string;
    severity: string;
    reporter: RedFlagReporterInterface;
    is_stalled: boolean;
    created_at: string;
    updated_at: string;
}

export interface RedFlagsListResponseInterface {
    data: RedFlagInterface[];
}

export interface RedFlagDetailResponseInterface {
    data: RedFlagInterface;
}

export interface RedFlagsCountInterface {
    count: number;
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
}

export interface RedFlagFormStateInterface {
    title: string;
    description: string;
    severity: RedFlagSeverity;
}
