export interface RequirementItemInterface {
    id: string;
    label: string;
    met: boolean;
    task_id?: string;
    created_at?: string;
    updated_at?: string;
}

export interface RequirementsListResponseInterface {
    data: RequirementItemInterface[];
    isSuccess: boolean;
}

export interface RequirementDetailResponseInterface {
    data: RequirementItemInterface;
    isSuccess: boolean;
}

export interface CreateRequirementPayloadInterface {
    label: string;
}

export interface UpdateRequirementPayloadInterface {
    label?: string;
    met?: boolean;
}
