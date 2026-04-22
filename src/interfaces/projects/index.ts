export interface ProjectInterface {
    id: string;
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    status: "planning" | "active" | "completed" | "on_hold";
    sprints_count: number;
    members_count: number;
}

export interface CreateProjectPayloadInterface {
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    status?: ProjectInterface["status"];
}

export interface UpdateProjectPayloadInterface extends Partial<CreateProjectPayloadInterface> {}

export interface ProjectLiteInterface {
    id: string;
    name: string;
    status: ProjectInterface["status"];
}
