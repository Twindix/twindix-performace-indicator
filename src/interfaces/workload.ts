export interface TeamMemberWorkloadInterface {
    memberId: string;
    sprintId: string;
    assignedPoints: number;
    completedPoints: number;
    capacity: number;
    contextSwitches: number;
    activeTaskCount: number;
}
