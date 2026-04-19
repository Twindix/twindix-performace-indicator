export interface TeamInterface {
    id: string;
    name: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
}

export interface TeamsListResponseInterface {
    data: TeamInterface[];
    isSuccess: boolean;
}

export interface TeamDetailResponseInterface {
    data: TeamInterface;
    isSuccess: boolean;
}

export interface CreateTeamPayloadInterface {
    name: string;
    description?: string;
}

export interface TeamsContextInterface {
    teams: TeamInterface[];
    isLoading: boolean;
    refetch: () => Promise<void>;
    createTeam: (payload: CreateTeamPayloadInterface) => Promise<TeamInterface | null>;
}
