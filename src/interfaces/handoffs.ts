export interface HandoffCriteriaSeedInterface {
    id: string;
    project_id: string;
    from_phase: string;
    to_phase: string;
    title: string;
    description: string | null;
    is_required: boolean;
    is_checked?: boolean;
    created_at: string;
    updated_at: string;
}

export interface HandoffStatusResponseInterface {
    total_criteria: number;
    required_criteria: number;
    checked_count: number;
    required_checked_count: number;
    ready_for_handoff: boolean;
    criteria: HandoffCriteriaSeedInterface[];
}

export interface CreateHandoffCriteriaPayloadInterface {
    from_phase: string;
    to_phase: string;
    title: string;
    description?: string | null;
    is_required: boolean;
}

export interface UpdateHandoffCriteriaPayloadInterface {
    title?: string;
    description?: string | null;
    is_required?: boolean;
}

export interface HandoffCheckPayloadInterface {
    sprint_id: string;
}
