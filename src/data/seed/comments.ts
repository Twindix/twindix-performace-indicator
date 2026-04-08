import type { CommentInterface } from "@/interfaces";

/*
  usr-001: Mohamed Elhawary  — Senior Frontend Engineer
  usr-002: Basel Sherif       — Frontend Engineer
  usr-003: Ahmed Heikal       — Senior Backend Engineer
  usr-004: Ahmed Bashier      — Senior Backend Engineer
  usr-005: Hazem Hassanien    — CTO
  usr-008: Karim Sayed        — Project Manager
  usr-009: Rashad Abdallah    — Quality Control
  usr-012: Mohamed Ahmed      — UI/UX Product Designer
*/

export const seedComments: CommentInterface[] = [
    { id: "cmt-001", taskId: "tsk-007", taskTitle: "Build sprint health dashboard widgets", authorId: "usr-001", mentionedId: "usr-005", content: "The gauge component is ready. @Hazem can you confirm the health score thresholds before I finalize the colors?", createdAt: "2026-03-31T09:15:00Z", hasResponse: true, responseAt: "2026-03-31T10:30:00Z", responderId: "usr-005", sprintId: "spr-014" },
    { id: "cmt-002", taskId: "tsk-009", taskTitle: "Build metrics aggregation API", authorId: "usr-003", mentionedId: "usr-004", content: "The aggregation endpoint is blocked on the DB schema. @Ahmed Bashier can you finalize the decisions table migration first?", createdAt: "2026-04-02T11:00:00Z", hasResponse: false, sprintId: "spr-014" },
    { id: "cmt-003", taskId: "tsk-008", taskTitle: "Implement blocker tracking UI", authorId: "usr-002", mentionedId: "usr-012", content: "Waiting on the final Figma for the blocker impact chart. @Mohamed Ahmed is the design ready?", createdAt: "2026-04-01T14:20:00Z", hasResponse: true, responseAt: "2026-04-01T16:00:00Z", responderId: "usr-012", sprintId: "spr-014" },
    { id: "cmt-004", taskId: "tsk-010", taskTitle: "Build report generation engine", authorId: "usr-001", content: "Completed the executive summary layout. Moving to friction analysis section now.", createdAt: "2026-04-01T10:00:00Z", hasResponse: false, sprintId: "spr-014" },
    { id: "cmt-005", taskId: "tsk-012", taskTitle: "Design decision log database schema", authorId: "usr-004", mentionedId: "usr-008", content: "Schema draft is done. @Karim Sayed please review the audit trail columns and confirm if we need soft deletes.", createdAt: "2026-04-01T15:45:00Z", hasResponse: true, responseAt: "2026-04-02T09:00:00Z", responderId: "usr-008", sprintId: "spr-014" },
    { id: "cmt-006", taskId: "tsk-016", taskTitle: "QA: Sprint analytics multi-sprint comparison", authorId: "usr-009", mentionedId: "usr-003", content: "Found a discrepancy in the velocity calculation for sprint 12. @Ahmed Heikal can you check the aggregation logic?", createdAt: "2026-04-03T10:30:00Z", hasResponse: false, sprintId: "spr-014" },
    { id: "cmt-007", taskId: "tsk-011", taskTitle: "Implement task readiness gate system", authorId: "usr-002", mentionedId: "usr-001", content: "The drag-and-drop is working but the gate enforcement blocks valid moves. @Mohamed Elhawary can you review the readiness check logic?", createdAt: "2026-03-30T13:00:00Z", hasResponse: true, responseAt: "2026-03-30T14:15:00Z", responderId: "usr-001", sprintId: "spr-014" },
    { id: "cmt-008", taskId: "tsk-014", taskTitle: "Communication response time tracker UI", authorId: "usr-001", content: "Tab layout is done. The channel bar chart renders correctly in both light and dark mode.", createdAt: "2026-04-03T11:00:00Z", hasResponse: false, sprintId: "spr-014" },
    { id: "cmt-009", taskId: "tsk-005", taskTitle: "Design executive report template", authorId: "usr-012", mentionedId: "usr-008", content: "Figma file updated with print-friendly version. @Karim Sayed please share with the CEO for early feedback.", createdAt: "2026-03-26T12:00:00Z", hasResponse: true, responseAt: "2026-03-26T15:30:00Z", responderId: "usr-008", sprintId: "spr-014" },
    { id: "cmt-010", taskId: "tsk-023", taskTitle: "Build sprint performance data pipeline", authorId: "usr-011", mentionedId: "usr-003", content: "The anomaly detection threshold needs a backend config endpoint. @Ahmed Heikal can we add that to the metrics API?", createdAt: "2026-04-02T14:00:00Z", hasResponse: false, sprintId: "spr-014" },
    { id: "cmt-011", taskId: "tsk-007", taskTitle: "Build sprint health dashboard widgets", authorId: "usr-002", mentionedId: "usr-001", content: "The friction area cards overlap on mobile. @Mohamed Elhawary should we stack them vertically below 640px?", createdAt: "2026-04-02T09:30:00Z", hasResponse: true, responseAt: "2026-04-02T10:00:00Z", responderId: "usr-001", sprintId: "spr-014" },
    { id: "cmt-012", taskId: "tsk-006", taskTitle: "Implement RBAC API endpoints", authorId: "usr-003", mentionedId: "usr-005", content: "RBAC middleware is ready for review. @Hazem please approve the permission matrix before we merge.", createdAt: "2026-03-28T16:00:00Z", hasResponse: true, responseAt: "2026-03-29T09:00:00Z", responderId: "usr-005", sprintId: "spr-014" },
    { id: "cmt-013", taskId: "tsk-017", taskTitle: "QA: Ownership map and conflict detection", authorId: "usr-009", content: "All conflict scenarios passed. Ownership assignment is accurate across 12 team members.", createdAt: "2026-04-03T14:00:00Z", hasResponse: false, sprintId: "spr-014" },
    { id: "cmt-014", taskId: "tsk-025", taskTitle: "Write sprint grooming checklist and risk review template", authorId: "usr-008", mentionedId: "usr-005", content: "Draft templates are ready. @Hazem can you review the risk scoring criteria before we publish?", createdAt: "2026-04-02T17:00:00Z", hasResponse: false, sprintId: "spr-014" },
    { id: "cmt-015", taskId: "tsk-015", taskTitle: "Dark mode implementation", authorId: "usr-002", mentionedId: "usr-012", content: "Dark mode is done across all 11 views. @Mohamed Ahmed please do a final visual check on the color tokens.", createdAt: "2026-04-03T09:00:00Z", hasResponse: true, responseAt: "2026-04-03T11:30:00Z", responderId: "usr-012", sprintId: "spr-014" },
];
