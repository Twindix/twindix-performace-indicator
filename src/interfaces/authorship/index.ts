export interface AuthorshipEntryInterface {
    id: string;
    kind: "feature" | "task";
    name: string;
    description: string;
    creator_id: string;
    created_at: string;
    updated_at: string;
    project_id: string;
    sprint_id?: string;
    linked_task_ids: string[];
    status: "draft" | "active" | "shipped" | "archived";
    tags: string[];
}

export interface AuthorshipSeedInterface {
    entries: AuthorshipEntryInterface[];
}
