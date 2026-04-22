export interface TeamMemberInterface {
    id: string;
    full_name: string;
    avatar_initials: string;
}

export interface TeamInterface {
    id: string;
    name: string;
    description?: string | null;
    member_count?: number;
    members?: TeamMemberInterface[];
    created_at?: string;
    updated_at?: string;
}

export interface TeamsListResponseInterface {
    data: TeamInterface[];
}

export interface TeamDetailResponseInterface {
    data: TeamInterface;
}

export interface CreateTeamPayloadInterface {
    name: string;
    description?: string;
}

export interface UpdateTeamPayloadInterface extends Partial<CreateTeamPayloadInterface> {}

export interface TeamLiteInterface {
    id: string;
    name: string;
}
