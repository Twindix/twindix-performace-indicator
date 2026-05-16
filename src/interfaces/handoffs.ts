export type HandoffCriteriaType = "entry" | "exit";

export interface HandoffCriterionInterface {
    id: string;
    label: string;
    checked: boolean;
}

export interface HandoffTransitionInterface {
    from_phase: string;
    to_phase: string;
    task_id: string;
    task_code: string;
    completion: number;
    entry_criteria: HandoffCriterionInterface[];
    exit_criteria: HandoffCriterionInterface[];
}

export interface HandoffsSummaryInterface {
    total_handoffs: number;
    avg_completion: number;
    fully_completed: number;
    below_threshold: number;
}

export interface HandoffsResponseInterface {
    summary: HandoffsSummaryInterface;
    phases: string[];
    transitions: HandoffTransitionInterface[];
}

export interface HandoffsFiltersInterface {
    scope?: "sprint" | "project";
    sprint_id?: string;
    project_id?: string;
}

export interface HandoffCriteriaSeedInterface {
    id: string;
    from_phase: string;
    to_phase: string;
    criteria_type: HandoffCriteriaType;
    label: string;
    is_default: boolean;
    project_id: string | null;
}

export interface CreateHandoffCriteriaPayloadInterface {
    from_phase: string;
    to_phase: string;
    criteria_type: HandoffCriteriaType;
    label: string;
    project_id?: string | null;
    is_default?: boolean;
}

export interface UpdateHandoffCriteriaPayloadInterface {
    label?: string;
}

export interface HandoffTaskStatusInterface {
    task_id: string;
    task_code: string;
    from_phase: string;
    to_phase: string;
    completion: number;
    entry_criteria: HandoffCriterionInterface[];
    exit_criteria: HandoffCriterionInterface[];
}
