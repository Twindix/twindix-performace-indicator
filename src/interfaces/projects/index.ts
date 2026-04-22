export interface ProjectCreatorInterface {
    id: string;
    full_name: string;
    avatar_initials: string;
}

export interface ProjectInterface {
    id: string;
    name: string;
    description?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    status: "planning" | "active" | "completed" | "on_hold";
    sprint_count?: number;
    member_count?: number;
    created_by?: ProjectCreatorInterface | null;
    created_at?: string;
    // legacy aliases — keep for any older code paths
    sprints_count?: number;
    members_count?: number;
}

export interface CreateProjectPayloadInterface {
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    status?: ProjectInterface["status"];
}

export interface UpdateProjectPayloadInterface extends Partial<CreateProjectPayloadInterface> {}

export interface ProjectLiteInterface {
    id: string;
    name: string;
    status: ProjectInterface["status"];
}
