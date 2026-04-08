import type { AlertInterface } from "@/interfaces";

export const seedAlerts: AlertInterface[] = [
    {
        id: "alt-001",
        title: "Deployment window this Friday",
        description: "We have a production deployment scheduled for Friday 6 PM. All in-progress tasks must be merged and tested by Thursday EOD.",
        createdById: "usr-008",
        mentionedIds: [], // all
        resolvedByIds: ["usr-001", "usr-003"],
        createdAt: "2026-04-01T09:00:00Z",
        updatedAt: "2026-04-01T09:00:00Z",
        sprintId: "spr-014",
    },
    {
        id: "alt-002",
        title: "API contract review needed",
        description: "The metrics aggregation API contract needs sign-off before frontend integration starts. Please review the Swagger doc and confirm.",
        createdById: "usr-005",
        mentionedIds: ["usr-001", "usr-002", "usr-003"],
        resolvedByIds: ["usr-003"],
        createdAt: "2026-04-02T10:30:00Z",
        updatedAt: "2026-04-02T10:30:00Z",
        sprintId: "spr-014",
    },
    {
        id: "alt-003",
        title: "QA environment is down",
        description: "The QA environment has been unreachable since this morning. Testing is blocked. DevOps is investigating — please hold off on pushing new builds.",
        createdById: "usr-009",
        mentionedIds: ["usr-004", "usr-003"],
        resolvedByIds: [],
        createdAt: "2026-04-03T08:15:00Z",
        updatedAt: "2026-04-03T08:15:00Z",
        sprintId: "spr-014",
    },
    {
        id: "alt-004",
        title: "Sprint review meeting moved",
        description: "Sprint review has been rescheduled from Thursday 3 PM to Friday 10 AM. Please update your calendars.",
        createdById: "usr-008",
        mentionedIds: [],
        resolvedByIds: ["usr-001", "usr-002", "usr-005", "usr-009", "usr-012"],
        createdAt: "2026-04-01T14:00:00Z",
        updatedAt: "2026-04-01T14:00:00Z",
        sprintId: "spr-014",
    },
];
