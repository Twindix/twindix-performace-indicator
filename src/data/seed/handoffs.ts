import type { HandoffInterface } from "@/interfaces";

export const seedHandoffs: HandoffInterface[] = [
    {
        id: "hnd-001", fromPhase: "Design", toPhase: "Development", taskId: "tsk-004", sprintId: "spr-014", completionRate: 85,
        entryCriteria: [
            { id: "ec-001", label: "Figma designs finalized and approved", met: true },
            { id: "ec-002", label: "Design tokens documented", met: true },
            { id: "ec-003", label: "Responsive breakpoints specified", met: true },
            { id: "ec-004", label: "Interaction states defined (hover, focus, disabled)", met: false },
            { id: "ec-005", label: "Accessibility requirements noted", met: true },
        ],
        exitCriteria: [
            { id: "xc-001", label: "Component structure matches design", met: true },
            { id: "xc-002", label: "All states implemented", met: false },
            { id: "xc-003", label: "Responsive layout verified", met: true },
        ],
    },
    {
        id: "hnd-002", fromPhase: "Development", toPhase: "Code Review", taskId: "tsk-013", sprintId: "spr-014", completionRate: 100,
        entryCriteria: [
            { id: "ec-006", label: "All acceptance criteria implemented", met: true },
            { id: "ec-007", label: "Self-review completed", met: true },
            { id: "ec-008", label: "No console errors or warnings", met: true },
            { id: "ec-009", label: "Edge cases handled", met: true },
        ],
        exitCriteria: [
            { id: "xc-004", label: "Code review approved by 2 reviewers", met: true },
            { id: "xc-005", label: "Review comments addressed", met: true },
            { id: "xc-006", label: "No critical issues remaining", met: true },
        ],
    },
    {
        id: "hnd-003", fromPhase: "Code Review", toPhase: "QA", taskId: "tsk-016", sprintId: "spr-014", completionRate: 75,
        entryCriteria: [
            { id: "ec-010", label: "PR merged to development branch", met: true },
            { id: "ec-011", label: "Test documentation provided", met: false },
            { id: "ec-012", label: "QA environment updated", met: false },
            { id: "ec-013", label: "Test data available", met: true },
        ],
        exitCriteria: [
            { id: "xc-007", label: "All test cases passed", met: false },
            { id: "xc-008", label: "No critical bugs found", met: true },
            { id: "xc-009", label: "Performance acceptable", met: true },
        ],
    },
    {
        id: "hnd-004", fromPhase: "Product", toPhase: "Design", taskId: "tsk-001", sprintId: "spr-014", completionRate: 60,
        entryCriteria: [
            { id: "ec-014", label: "User stories written with acceptance criteria", met: true },
            { id: "ec-015", label: "Business rules documented", met: false },
            { id: "ec-016", label: "User flow defined", met: true },
            { id: "ec-017", label: "Edge cases identified", met: false },
            { id: "ec-018", label: "Priority and timeline confirmed", met: true },
        ],
        exitCriteria: [
            { id: "xc-010", label: "Wireframes approved", met: false },
            { id: "xc-011", label: "High-fidelity designs completed", met: false },
        ],
    },
    {
        id: "hnd-005", fromPhase: "Development", toPhase: "Code Review", taskId: "tsk-014", sprintId: "spr-014", completionRate: 100, completedAt: "2026-04-03",
        entryCriteria: [
            { id: "ec-019", label: "All acceptance criteria implemented", met: true },
            { id: "ec-020", label: "Self-review completed", met: true },
            { id: "ec-021", label: "Architecture notes followed", met: true },
        ],
        exitCriteria: [
            { id: "xc-012", label: "Code review approved", met: true },
            { id: "xc-013", label: "All comments resolved", met: true },
        ],
    },
    {
        id: "hnd-006", fromPhase: "QA", toPhase: "Done", taskId: "tsk-018", sprintId: "spr-014", completionRate: 100, completedAt: "2026-03-26",
        entryCriteria: [
            { id: "ec-022", label: "All test cases executed", met: true },
            { id: "ec-023", label: "No open bugs", met: true },
            { id: "ec-024", label: "Regression tests passed", met: true },
        ],
        exitCriteria: [
            { id: "xc-014", label: "Product owner sign-off", met: true },
            { id: "xc-015", label: "Release notes updated", met: true },
        ],
    },
];
