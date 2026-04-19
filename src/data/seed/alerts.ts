import type { AlertInterface } from "@/interfaces";

export const seedAlerts: AlertInterface[] = [
    {
        id: "alt-001",
        title: "Deployment window this Friday",
        body: "We have a production deployment scheduled for Friday 6 PM. All in-progress tasks must be merged and tested by Thursday EOD.",
        creator: { id: "usr-008", full_name: "Hazem Hassanien", avatar_initials: "HH" },
        mentioned_users: [],
        created_at: "2026-04-01T09:00:00Z",
        target: "everyone",
        status: "pending",
    },
    {
        id: "alt-002",
        title: "API contract review needed",
        body: "The metrics aggregation API contract needs sign-off before frontend integration starts. Please review the Swagger doc and confirm.",
        creator: { id: "usr-005", full_name: "Karim Sayed", avatar_initials: "KS" },
        mentioned_users: [
            { id: "usr-001", full_name: "Mohamed Elhawary", avatar_initials: "ME" },
            { id: "usr-002", full_name: "Basel Sherif", avatar_initials: "BS" },
            { id: "usr-003", full_name: "Ahmed Heikal", avatar_initials: "AH" },
        ],
        created_at: "2026-04-02T10:30:00Z",
        target: "specific_users",
        status: "acknowledged",
    },
    {
        id: "alt-003",
        title: "QA environment is down",
        body: "The QA environment has been unreachable since this morning. Testing is blocked. DevOps is investigating.",
        creator: { id: "usr-009", full_name: "Rashad Abdallah", avatar_initials: "RA" },
        mentioned_users: [
            { id: "usr-004", full_name: "Ahmed Bashier", avatar_initials: "AB" },
            { id: "usr-003", full_name: "Ahmed Heikal", avatar_initials: "AH" },
        ],
        created_at: "2026-04-03T08:15:00Z",
        target: "specific_users",
        status: "pending",
    },
    {
        id: "alt-004",
        title: "Sprint review meeting moved",
        body: "Sprint review has been rescheduled from Thursday 3 PM to Friday 10 AM. Please update your calendars.",
        creator: { id: "usr-008", full_name: "Hazem Hassanien", avatar_initials: "HH" },
        mentioned_users: [],
        created_at: "2026-04-01T14:00:00Z",
        target: "everyone",
        status: "done",
    },
];
