import type { TeamMemberWorkloadInterface } from "@/interfaces";

// References timeSeed member ids (m-01..m-08) and sprint ids (sp-01..sp-06).
export const workloadSeed: TeamMemberWorkloadInterface[] = [
    // sp-01 — Alpha Sprint (active, pr-01)
    { memberId: "m-01", sprintId: "sp-01", assignedPoints: 24, completedPoints: 20, capacity: 21, contextSwitches: 4, activeTaskCount: 3 },
    { memberId: "m-02", sprintId: "sp-01", assignedPoints: 18, completedPoints: 14, capacity: 21, contextSwitches: 2, activeTaskCount: 2 },
    { memberId: "m-03", sprintId: "sp-01", assignedPoints: 22, completedPoints: 10, capacity: 18, contextSwitches: 6, activeTaskCount: 4 },

    // sp-02 — Beta Sprint (planning, pr-01)
    { memberId: "m-02", sprintId: "sp-02", assignedPoints: 12, completedPoints: 4, capacity: 21, contextSwitches: 2, activeTaskCount: 1 },
    { memberId: "m-03", sprintId: "sp-02", assignedPoints: 8, completedPoints: 0, capacity: 18, contextSwitches: 1, activeTaskCount: 1 },

    // sp-03 — DS Sprint 1 (active, pr-02)
    { memberId: "m-04", sprintId: "sp-03", assignedPoints: 15, completedPoints: 12, capacity: 13, contextSwitches: 5, activeTaskCount: 3 },
    { memberId: "m-01", sprintId: "sp-03", assignedPoints: 5, completedPoints: 5, capacity: 8, contextSwitches: 1, activeTaskCount: 1 },

    // sp-04 — FE Sprint 1 (planning, pr-03)
    { memberId: "m-05", sprintId: "sp-04", assignedPoints: 13, completedPoints: 8, capacity: 13, contextSwitches: 3, activeTaskCount: 2 },

    // sp-05 — ML Sprint 1 (active, pr-04)
    { memberId: "m-06", sprintId: "sp-05", assignedPoints: 18, completedPoints: 12, capacity: 18, contextSwitches: 2, activeTaskCount: 2 },
    { memberId: "m-07", sprintId: "sp-05", assignedPoints: 22, completedPoints: 14, capacity: 18, contextSwitches: 5, activeTaskCount: 3 },

    // sp-06 — Sales Q2 (completed, pr-05)
    { memberId: "m-08", sprintId: "sp-06", assignedPoints: 10, completedPoints: 10, capacity: 13, contextSwitches: 1, activeTaskCount: 0 },
];
