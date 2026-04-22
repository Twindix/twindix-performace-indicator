export interface TeamInterface {
    id: string;
    name: string;
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

export interface TeamLiteInterface {
    id: string;
    name: string;
}
