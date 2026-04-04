import type { TeamMemberWorkloadInterface } from "@/interfaces";

export const seedWorkload: TeamMemberWorkloadInterface[] = [
    { memberId: "usr-001", sprintId: "spr-014", assignedPoints: 34, completedPoints: 21, capacity: 21, contextSwitches: 6, activeTaskCount: 4 },
    { memberId: "usr-002", sprintId: "spr-014", assignedPoints: 24, completedPoints: 8, capacity: 21, contextSwitches: 4, activeTaskCount: 3 },
    { memberId: "usr-003", sprintId: "spr-014", assignedPoints: 16, completedPoints: 0, capacity: 21, contextSwitches: 2, activeTaskCount: 2 },
    { memberId: "usr-004", sprintId: "spr-014", assignedPoints: 8, completedPoints: 0, capacity: 21, contextSwitches: 1, activeTaskCount: 1 },
    { memberId: "usr-009", sprintId: "spr-014", assignedPoints: 10, completedPoints: 5, capacity: 13, contextSwitches: 5, activeTaskCount: 2 },
    { memberId: "usr-010", sprintId: "spr-014", assignedPoints: 13, completedPoints: 0, capacity: 21, contextSwitches: 1, activeTaskCount: 1 },
    { memberId: "usr-011", sprintId: "spr-014", assignedPoints: 8, completedPoints: 0, capacity: 13, contextSwitches: 2, activeTaskCount: 1 },
    { memberId: "usr-012", sprintId: "spr-014", assignedPoints: 10, completedPoints: 5, capacity: 13, contextSwitches: 2, activeTaskCount: 1 },
];
