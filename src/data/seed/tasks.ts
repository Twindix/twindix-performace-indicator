import { TaskPhase, TaskPriority, TaskStatus } from "@/enums";
import type { TaskAttachmentInterface, TaskInterface } from "@/interfaces";

/*
Team reference:
  usr-001: Mohamed Elhawary  — Senior Frontend Engineer
  usr-002: Basel Sherif       — Frontend Engineer
  usr-003: Ahmed Heikal       — Senior Backend Engineer
  usr-004: Ahmed Bashier      — Senior Backend Engineer
  usr-005: Hazem Hassanien    — CTO
  usr-006: Mohamed Ismail     — CEO
  usr-007: Sarah Elseadawy    — HR Manager
  usr-008: Karim Sayed        — Project Manager
  usr-009: Rashad Abdallah    — Quality Control
  usr-010: Ahmed Eldairy      — AI Engineer
  usr-011: Walaa Sherif       — Data Analyst
  usr-012: Mohamed Ahmed      — UI/UX Product Designer
*/

// Tiny inline SVG placeholders so dummy attachments work offline
const svgBlue = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="#3b82f6"/><text x="60" y="45" font-size="12" fill="white" text-anchor="middle">Mockup</text></svg>')}`;
const svgGreen = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="#22c55e"/><text x="60" y="45" font-size="12" fill="white" text-anchor="middle">Diagram</text></svg>')}`;
const svgGray = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="#6b7280"/><text x="60" y="45" font-size="11" fill="white" text-anchor="middle">Screenshot</text></svg>')}`;
const pdfData = `data:application/pdf;base64,JVBERi0=`;
const videoData = `data:video/mp4;base64,AAAAAA==`;
const docData = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDBBQ=`;
const att = (id: string, name: string, size: number, type: string, dataUrl: string, uploadedAt: string): TaskAttachmentInterface =>
    ({ id, name, size, type, url: dataUrl, dataUrl, uploaded_at: uploadedAt, uploadedAt });

export const seedTasks: TaskInterface[] = [
    {
        id: "tsk-001",
        title: "Implement user preferences panel",
        description: "Build frontend React form for user dashboard preferences.",
        assigneeIds: ["usr-002"],
        phase: TaskPhase.Backlog,
        priority: TaskPriority.Medium,
        storyPoints: 5,
        sprintId: "spr-014",
        readinessScore: 43,
        readinessChecklist: {
            acceptanceCriteriaDefined: true,
            businessRulesClear: false,
            edgeCasesIdentified: false,
            dependenciesMapped: true,
            designAvailable: false,
            apiContractReady: false,
            estimationDone: true
        },
        hasBlocker: false,
        createdAt: "2026-03-23",
        updatedAt: "2026-03-23",
        tags: ["settings", "ux", "frontend"],
        workType: "Frontend",
        status: TaskStatus.OnTrack,
        requirements: [
            { id: "req-001-1", content: "Figma design approved by product team", is_done: false, completed_at: null, sort_order: "1" },
            { id: "req-001-2", content: "API contract defined for preferences endpoint", is_done: false, completed_at: null, sort_order: "2" },
            { id: "req-001-3", content: "Acceptance criteria documented in Jira", is_done: true, completed_at: "2026-03-23T10:00:00Z", sort_order: "3" },
            { id: "req-001-4", content: "Edge cases for empty/default state identified", is_done: false, completed_at: null, sort_order: "4" },
        ],
    },
    {
        id: "tsk-002",
        title: "Build AI-powered candidate screening module",
        description: "Train and deploy ML model comparing candidate CVs.",
        assigneeIds: ["usr-010"],
        phase: TaskPhase.Backlog,
        priority: TaskPriority.Medium,
        storyPoints: 13,
        sprintId: "spr-014",
        readinessScore: 57,
        readinessChecklist: {
            acceptanceCriteriaDefined: true,
            businessRulesClear: true,
            edgeCasesIdentified: false,
            dependenciesMapped: true,
            designAvailable: false,
            apiContractReady: true,
            estimationDone: false
        },
        hasBlocker: false,
        createdAt: "2026-03-24",
        updatedAt: "2026-03-24",
        tags: ["ai", "hiring", "ml-pipeline"],
        workType: "Backend",
    },
    {
        id: "tsk-003",
        title: "Define sprint metrics data collection strategy",
        description: "Identify data sources and define collection frequency.",
        assigneeIds: ["usr-011"],
        phase: TaskPhase.Backlog,
        priority: TaskPriority.Low,
        storyPoints: 5,
        sprintId: "spr-014",
        readinessScore: 29,
        readinessChecklist: {
            acceptanceCriteriaDefined: true,
            businessRulesClear: false,
            edgeCasesIdentified: false,
            dependenciesMapped: false,
            designAvailable: false,
            apiContractReady: false,
            estimationDone: true
        },
        hasBlocker: false,
        createdAt: "2026-03-23",
        updatedAt: "2026-03-23",
        tags: ["data", "metrics", "analysis"],
        workType: "Backend",
    },
    {
        id: "tsk-004", title: "Redesign settings page UI",
        description: "Overhaul settings page with new tabbed layout.",
        assigneeIds: ["usr-001"],
        phase: TaskPhase.Ready, priority: TaskPriority.High, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 86, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: false, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-23", updatedAt: "2026-03-25", tags: ["settings", "redesign", "frontend"],
        workType: "Frontend", status: TaskStatus.OnTrack,
        requirements: [
            { id: "req-004-1", content: "High-fidelity Figma mockup completed", is_done: true, completed_at: "2026-03-25T09:00:00Z", sort_order: "1" },
            { id: "req-004-2", content: "Responsive breakpoints defined for mobile and tablet", is_done: true, completed_at: "2026-03-25T09:30:00Z", sort_order: "2" },
            { id: "req-004-3", content: "Accessibility (WCAG 2.1) requirements reviewed", is_done: true, completed_at: "2026-03-25T10:00:00Z", sort_order: "3" },
            { id: "req-004-4", content: "REST API contract finalized with backend team", is_done: false, completed_at: null, sort_order: "4" },
            { id: "req-004-5", content: "Unit tests written for all form validations", is_done: false, completed_at: null, sort_order: "5" },
        ],
        attachments: [
            att("att-004-1", "settings-mockup.png",      48200, "image/png",        svgBlue,  "2026-03-25T10:00:00Z"),
            att("att-004-2", "requirements.pdf",          92400, "application/pdf",  pdfData,  "2026-03-25T10:05:00Z"),
            att("att-004-3", "walkthrough-demo.mp4",    3200000, "video/mp4",        videoData,"2026-03-25T10:10:00Z"),
            att("att-004-4", "spec-document.docx",        54000, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", docData, "2026-03-25T10:15:00Z"),
        ],
    },
    {
        id: "tsk-005", title: "Design executive report template",
        description: "Create Figma high-fidelity designs.",
        assigneeIds: ["usr-012"],
        phase: TaskPhase.Ready, priority: TaskPriority.Medium, storyPoints: 5, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-23", updatedAt: "2026-03-26", tags: ["design", "figma", "reports"],
        attachments: [
            att("att-005-1", "executive-report-v2.png", 61000, "image/png",       svgGreen, "2026-03-26T09:00:00Z"),
            att("att-005-2", "report-wireframe.png",    38500, "image/png",       svgGray,  "2026-03-26T09:10:00Z"),
            att("att-005-3", "design-notes.pdf",        24000, "application/pdf", pdfData,  "2026-03-26T09:15:00Z"),
        ],
        workType: "Design",
    },
    {
        id: "tsk-006", title: "Implement RBAC API endpoints",
        description: "Build REST API for role-based access control.",
        assigneeIds: ["usr-003"],
        phase: TaskPhase.Ready, priority: TaskPriority.High, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-24", updatedAt: "2026-03-26", tags: ["auth", "rbac", "backend"],
        workType: "Backend",
    },
    {
        id: "tsk-007", title: "Build sprint health dashboard widgets",
        description: "Create health score gauge and friction area cards.",
        assigneeIds: ["usr-001"],
        phase: TaskPhase.InProgress, priority: TaskPriority.Critical, storyPoints: 13, sprintId: "spr-014",
        readinessScore: 86, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: false, estimationDone: true },
        hasBlocker: true, blockerId: "blk-001", createdAt: "2026-03-23", updatedAt: "2026-03-31", tags: ["dashboard", "widgets", "frontend"],
        workType: "Frontend", status: TaskStatus.AtRisk,
        requirements: [
            { id: "req-007-1", content: "Health score algorithm approved by CTO", is_done: true, completed_at: "2026-03-28T10:00:00Z", sort_order: "1" },
            { id: "req-007-2", content: "Gauge chart library selected and integrated", is_done: true, completed_at: "2026-03-28T11:00:00Z", sort_order: "2" },
            { id: "req-007-3", content: "Real-time data polling interval confirmed", is_done: false, completed_at: null, sort_order: "3" },
            { id: "req-007-4", content: "Blocker dependency on metrics API resolved", is_done: false, completed_at: null, sort_order: "4" },
            { id: "req-007-5", content: "Cross-browser testing on Chrome, Firefox, Safari", is_done: false, completed_at: null, sort_order: "5" },
        ],
        attachments: [
            att("att-007-1", "dashboard-spec.pdf",   55000, "application/pdf", pdfData,  "2026-03-28T11:00:00Z"),
            att("att-007-2", "gauge-component.png",  29000, "image/png",       svgBlue,  "2026-03-29T14:00:00Z"),
        ],
    },
    {
        id: "tsk-008", title: "Implement blocker tracking UI",
        description: "Build blocker creation form and management table.",
        assigneeIds: ["usr-002"],
        phase: TaskPhase.InProgress, priority: TaskPriority.High, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-24", updatedAt: "2026-04-01", tags: ["blockers", "frontend"],
        workType: "Frontend",
    },
    {
        id: "tsk-009", title: "Build metrics aggregation API",
        description: "Create backend REST endpoints for sprint metrics.",
        assigneeIds: ["usr-003"],
        phase: TaskPhase.InProgress, priority: TaskPriority.High, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 71, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: false, dependenciesMapped: true, designAvailable: false, apiContractReady: true, estimationDone: true },
        hasBlocker: true, blockerId: "blk-003", createdAt: "2026-03-25", updatedAt: "2026-04-02", tags: ["backend", "api", "metrics"],
        workType: "Backend",
    },
    {
        id: "tsk-010", title: "Build report generation engine",
        description: "Create executive summary and friction analysis report views.",
        assigneeIds: ["usr-001"],
        phase: TaskPhase.InProgress, priority: TaskPriority.Critical, storyPoints: 13, sprintId: "spr-014",
        readinessScore: 86, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: false, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-24", updatedAt: "2026-04-01", tags: ["reports", "frontend"],
        workType: "Frontend",
    },
    {
        id: "tsk-011", title: "Implement task readiness gate system",
        description: "Build readiness checklist dialog and scoring algorithm.",
        assigneeIds: ["usr-002"],
        phase: TaskPhase.InProgress, priority: TaskPriority.Critical, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-23", updatedAt: "2026-04-02", tags: ["readiness", "frontend", "core"],
        workType: "Frontend", status: TaskStatus.OnTrack,
        requirements: [
            { id: "req-011-1", content: "Readiness scoring formula agreed with PM", is_done: true, completed_at: "2026-03-30T10:00:00Z", sort_order: "1" },
            { id: "req-011-2", content: "All 7 checklist items mapped to business rules", is_done: true, completed_at: "2026-03-30T11:00:00Z", sort_order: "2" },
            { id: "req-011-3", content: "Transition gate blocks implemented for each phase", is_done: true, completed_at: "2026-03-31T09:00:00Z", sort_order: "3" },
            { id: "req-011-4", content: "Dialog UI matches approved Figma design", is_done: true, completed_at: "2026-03-31T10:00:00Z", sort_order: "4" },
            { id: "req-011-5", content: "Self-review completed by developer", is_done: false, completed_at: null, sort_order: "5" },
        ],
    },
    {
        id: "tsk-012", title: "Design decision log database schema",
        description: "Design PostgreSQL schema for decisions table.",
        assigneeIds: ["usr-004"],
        phase: TaskPhase.InProgress, priority: TaskPriority.High, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 71, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: false, dependenciesMapped: true, designAvailable: false, apiContractReady: true, estimationDone: true },
        hasBlocker: true, blockerId: "blk-002", createdAt: "2026-03-25", updatedAt: "2026-04-01", tags: ["backend", "database", "decisions"],
        workType: "Backend",
    },
    {
        id: "tsk-013", title: "Team workload visualization components",
        description: "Build workload distribution bars and capacity overview.",
        assigneeIds: ["usr-002"],
        phase: TaskPhase.Review, priority: TaskPriority.Medium, storyPoints: 5, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-24", updatedAt: "2026-04-02", tags: ["workload", "charts", "frontend"],
        workType: "Frontend",
    },
    {
        id: "tsk-014", title: "Communication response time tracker UI",
        description: "Build frontend view for tracking response times.",
        assigneeIds: ["usr-001"],
        phase: TaskPhase.Review, priority: TaskPriority.Medium, storyPoints: 5, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-25", updatedAt: "2026-04-03", tags: ["communication", "sla", "frontend"],
        workType: "Frontend",
    },
    {
        id: "tsk-015", title: "Dark mode implementation",
        description: "Full dark mode with CSS custom properties.",
        assigneeIds: ["usr-002"],
        phase: TaskPhase.Review, priority: TaskPriority.Medium, storyPoints: 3, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-23", updatedAt: "2026-04-03", tags: ["ui", "theme", "frontend"],
        workType: "Frontend",
    },
    {
        id: "tsk-016", title: "QA: Sprint analytics multi-sprint comparison",
        description: "Test data accuracy across all 17 metrics.",
        assigneeIds: ["usr-009"],
        phase: TaskPhase.QA, priority: TaskPriority.High, storyPoints: 5, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: true, blockerId: "blk-004", createdAt: "2026-03-24", updatedAt: "2026-04-03", tags: ["qa", "analytics", "testing"],
        workType: "QA", status: TaskStatus.Delayed,
        requirements: [
            { id: "req-016-1", content: "All 17 metric calculations verified against source data", is_done: false, completed_at: null, sort_order: "1" },
            { id: "req-016-2", content: "Multi-sprint comparison tested with ≥3 sprints", is_done: false, completed_at: null, sort_order: "2" },
            { id: "req-016-3", content: "Edge case: sprint with zero tasks handled correctly", is_done: true, completed_at: "2026-04-02T10:00:00Z", sort_order: "3" },
            { id: "req-016-4", content: "Performance test: page load under 2s with full dataset", is_done: false, completed_at: null, sort_order: "4" },
            { id: "req-016-5", content: "Product owner sign-off on displayed metrics", is_done: false, completed_at: null, sort_order: "5" },
        ],
    },
    {
        id: "tsk-017", title: "QA: Ownership map and conflict detection",
        description: "Verify conflict detection logic and accuracy.",
        assigneeIds: ["usr-009"],
        phase: TaskPhase.QA, priority: TaskPriority.Medium, storyPoints: 5, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-25", updatedAt: "2026-04-03", tags: ["qa", "ownership", "testing"],
        workType: "QA",
    },
    {
        id: "tsk-018", title: "Authentication and login flow",
        description: "Login page with form validation and dummy auth.",
        assigneeIds: ["usr-001"],
        phase: TaskPhase.Done, priority: TaskPriority.Critical, storyPoints: 5, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-23", updatedAt: "2026-03-26", tags: ["auth", "frontend"],
        workType: "Backend",
    },
    {
        id: "tsk-019", title: "App layout and navigation shell",
        description: "Collapsible sidebar and topbar with sprint selector.",
        assigneeIds: ["usr-002"],
        phase: TaskPhase.Done, priority: TaskPriority.Critical, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-23", updatedAt: "2026-03-27", tags: ["layout", "navigation", "frontend"],
        workType: "Frontend",
    },
    {
        id: "tsk-020", title: "Design system and component library",
        description: "Atoms, Radix UI wrappers, and theme tokens.",
        assigneeIds: ["usr-001"],
        phase: TaskPhase.Done, priority: TaskPriority.High, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-23", updatedAt: "2026-03-28", tags: ["design-system", "components", "frontend"],
        workType: "Frontend",
    },
    {
        id: "tsk-021", title: "Kanban board with drag-and-drop",
        description: "Task board with 6 phase columns and draggable cards.",
        assigneeIds: ["usr-001"],
        phase: TaskPhase.Done, priority: TaskPriority.High, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-24", updatedAt: "2026-03-30", tags: ["tasks", "kanban", "frontend"],
        workType: "Frontend",
    },
    {
        id: "tsk-022", title: "UI/UX design for dashboard and kanban",
        description: "Figma mockups for sprint dashboard and task board.",
        assigneeIds: ["usr-012"],
        phase: TaskPhase.Done, priority: TaskPriority.High, storyPoints: 5, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-23", updatedAt: "2026-03-27", tags: ["design", "figma", "ux"],
        workType: "Design",
    },
    {
        id: "tsk-023", title: "Build sprint performance data pipeline",
        description: "Create data aggregation pipeline for sprint metrics.",
        assigneeIds: ["usr-011"],
        phase: TaskPhase.InProgress, priority: TaskPriority.Medium, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 86, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: false, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-26", updatedAt: "2026-04-02", tags: ["data", "analytics", "pipeline"],
        workType: "Backend",
    },
    {
        id: "tsk-024", title: "Set up onboarding tracking workflow",
        description: "Define onboarding checklist and track knowledge transfer.",
        assigneeIds: ["usr-007"],
        phase: TaskPhase.Ready, priority: TaskPriority.Low, storyPoints: 3, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-27", updatedAt: "2026-03-29", tags: ["hr", "onboarding", "process"],
        workType: "QA",
    },
    {
        id: "tsk-025", title: "Write sprint grooming checklist",
        description: "Create standardized templates for pre-sprint grooming.",
        assigneeIds: ["usr-008"],
        phase: TaskPhase.InProgress, priority: TaskPriority.Medium, storyPoints: 3, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-26", updatedAt: "2026-04-02", tags: ["process", "grooming", "pm"],
        workType: "QA",
    },
    {
        id: "tsk-026", title: "Backend auth service",
        description: "JWT token generation and refresh flow.",
        assigneeIds: ["usr-004"],
        phase: TaskPhase.Done, priority: TaskPriority.Critical, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-23", updatedAt: "2026-03-28", tags: ["auth", "jwt", "backend"],
        workType: "Backend",
    },
];

