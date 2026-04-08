import { TaskPhase, TaskPriority } from "@/enums";
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
const xlsData = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,UEsDBBQ=`; // minimal fake PDF
const att = (id: string, name: string, size: number, type: string, dataUrl: string, uploadedAt: string): TaskAttachmentInterface =>
    ({ id, name, size, type, dataUrl, uploadedAt });

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

export const seedTasks: TaskInterface[] = [
    // ── Backlog ─────────────────────────────────────────────────
    {
        id: "tsk-001", title: "Implement user preferences panel",
        description: "Build frontend React form for user dashboard preferences — layout customization, notification toggles, and timezone selector.",
        assigneeId: "usr-002", // Basel — Frontend Engineer
        phase: TaskPhase.Backlog, priority: TaskPriority.Medium, storyPoints: 5, sprintId: "spr-014",
        readinessScore: 43, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: false, edgeCasesIdentified: false, dependenciesMapped: true, designAvailable: false, apiContractReady: false, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-23", updatedAt: "2026-03-23", tags: ["settings", "ux", "frontend"],
    },
    {
        id: "tsk-002", title: "Build AI-powered candidate screening module",
        description: "Train and deploy ML model comparing candidate CVs against role requirement vectors. Build inference API endpoint and scoring algorithm.",
        assigneeId: "usr-010", // Ahmed Eldairy — AI Engineer
        phase: TaskPhase.Backlog, priority: TaskPriority.Medium, storyPoints: 13, sprintId: "spr-014",
        readinessScore: 57, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: false, dependenciesMapped: true, designAvailable: false, apiContractReady: true, estimationDone: false },
        hasBlocker: false, createdAt: "2026-03-24", updatedAt: "2026-03-24", tags: ["ai", "hiring", "ml-pipeline"],
    },
    {
        id: "tsk-003", title: "Define sprint metrics data collection strategy",
        description: "Identify data sources, define collection frequency, and map raw data to the 17 platform KPIs. Document formulas and thresholds.",
        assigneeId: "usr-011", // Walaa — Data Analyst
        phase: TaskPhase.Backlog, priority: TaskPriority.Low, storyPoints: 5, sprintId: "spr-014",
        readinessScore: 29, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: false, edgeCasesIdentified: false, dependenciesMapped: false, designAvailable: false, apiContractReady: false, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-23", updatedAt: "2026-03-23", tags: ["data", "metrics", "analysis"],
    },

    // ── Ready ───────────────────────────────────────────────────
    {
        id: "tsk-004", title: "Redesign settings page UI",
        description: "Overhaul settings page with new tabbed layout, form validation, and responsive design. Implement according to Mohamed Ahmed's Figma designs.",
        assigneeId: "usr-001", // Mohamed Elhawary — Sr. Frontend Engineer
        phase: TaskPhase.Ready, priority: TaskPriority.High, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 86, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: false, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-23", updatedAt: "2026-03-25", tags: ["settings", "redesign", "frontend"],
        attachments: [
            att("att-004-1", "settings-mockup.png",      48200, "image/png",        svgBlue,  "2026-03-25T10:00:00Z"),
            att("att-004-2", "requirements.pdf",          92400, "application/pdf",  pdfData,  "2026-03-25T10:05:00Z"),
            att("att-004-3", "walkthrough-demo.mp4",    3200000, "video/mp4",        videoData,"2026-03-25T10:10:00Z"),
            att("att-004-4", "spec-document.docx",        54000, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", docData, "2026-03-25T10:15:00Z"),
        ],
    },
    {
        id: "tsk-005", title: "Design executive report template",
        description: "Create Figma high-fidelity designs for the executive summary and friction analysis report pages. Print-friendly, CEO-readable.",
        assigneeId: "usr-012", // Mohamed Ahmed — UI/UX Designer
        phase: TaskPhase.Ready, priority: TaskPriority.Medium, storyPoints: 5, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-23", updatedAt: "2026-03-26", tags: ["design", "figma", "reports"],
        attachments: [
            att("att-005-1", "executive-report-v2.png", 61000, "image/png",       svgGreen, "2026-03-26T09:00:00Z"),
            att("att-005-2", "report-wireframe.png",    38500, "image/png",       svgGray,  "2026-03-26T09:10:00Z"),
            att("att-005-3", "design-notes.pdf",        24000, "application/pdf", pdfData,  "2026-03-26T09:15:00Z"),
        ],
    },
    {
        id: "tsk-006", title: "Implement RBAC API endpoints",
        description: "Build REST API for role-based access control: CRUD for roles, permission assignment, middleware for route protection. PostgreSQL + Node.js.",
        assigneeId: "usr-003", // Ahmed Heikal — Sr. Backend Engineer
        phase: TaskPhase.Ready, priority: TaskPriority.High, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-24", updatedAt: "2026-03-26", tags: ["auth", "rbac", "backend"],
    },
    {
        id: "tsk-024", title: "Set up onboarding tracking workflow",
        description: "Define onboarding checklist, track knowledge transfer sessions, and measure ramp-up time for new hires joining mid-project.",
        assigneeId: "usr-007", // Sarah Elseadawy — HR Manager
        phase: TaskPhase.Ready, priority: TaskPriority.Low, storyPoints: 3, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-27", updatedAt: "2026-03-29", tags: ["hr", "onboarding", "process"],
    },

    // ── In Progress ─────────────────────────────────────────────
    {
        id: "tsk-007", title: "Build sprint health dashboard widgets",
        description: "Create health score gauge, friction area cards, and metrics overview components using React, Tailwind CSS, and CSS-only chart visualizations.",
        assigneeId: "usr-001", // Mohamed Elhawary — Sr. Frontend Engineer
        phase: TaskPhase.InProgress, priority: TaskPriority.Critical, storyPoints: 13, sprintId: "spr-014",
        readinessScore: 86, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: false, estimationDone: true },
        hasBlocker: true, blockerId: "blk-001", createdAt: "2026-03-23", updatedAt: "2026-03-31", tags: ["dashboard", "widgets", "frontend"],
        attachments: [
            att("att-007-1", "dashboard-spec.pdf",   55000, "application/pdf", pdfData,  "2026-03-28T11:00:00Z"),
            att("att-007-2", "gauge-component.png",  29000, "image/png",       svgBlue,  "2026-03-29T14:00:00Z"),
        ],
    },
    {
        id: "tsk-008", title: "Implement blocker tracking UI",
        description: "Build blocker creation form, management table with filtering, impact-by-type bar chart, and status badges using React components.",
        assigneeId: "usr-002", // Basel Sherif — Frontend Engineer
        phase: TaskPhase.InProgress, priority: TaskPriority.High, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-24", updatedAt: "2026-04-01", tags: ["blockers", "frontend"],
    },
    {
        id: "tsk-009", title: "Build metrics aggregation API",
        description: "Create backend REST endpoints for sprint metrics calculation, historical queries, and cross-sprint trend analysis. Node.js + PostgreSQL.",
        assigneeId: "usr-003", // Ahmed Heikal — Sr. Backend Engineer
        phase: TaskPhase.InProgress, priority: TaskPriority.High, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 71, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: false, dependenciesMapped: true, designAvailable: false, apiContractReady: true, estimationDone: true },
        hasBlocker: true, blockerId: "blk-003", createdAt: "2026-03-25", updatedAt: "2026-04-02", tags: ["backend", "api", "metrics"],
    },
    {
        id: "tsk-010", title: "Build report generation engine",
        description: "Create executive summary and friction analysis report views with print-friendly layouts, plain-English descriptions, and green/yellow/red indicators.",
        assigneeId: "usr-001", // Mohamed Elhawary — Sr. Frontend Engineer
        phase: TaskPhase.InProgress, priority: TaskPriority.Critical, storyPoints: 13, sprintId: "spr-014",
        readinessScore: 86, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: false, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-24", updatedAt: "2026-04-01", tags: ["reports", "frontend"],
    },
    {
        id: "tsk-011", title: "Implement task readiness gate system",
        description: "Build readiness checklist dialog, scoring algorithm, drag-and-drop phase transitions, and localStorage persistence for the kanban board.",
        assigneeId: "usr-002", // Basel Sherif — Frontend Engineer
        phase: TaskPhase.InProgress, priority: TaskPriority.Critical, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-23", updatedAt: "2026-04-02", tags: ["readiness", "frontend", "core"],
    },
    {
        id: "tsk-012", title: "Design decision log database schema",
        description: "Design PostgreSQL schema for decisions table: participants, outcomes, audit trail, categories. Write migration scripts and seed data.",
        assigneeId: "usr-004", // Ahmed Bashier — Sr. Backend Engineer
        phase: TaskPhase.InProgress, priority: TaskPriority.High, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 71, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: false, dependenciesMapped: true, designAvailable: false, apiContractReady: true, estimationDone: true },
        hasBlocker: true, blockerId: "blk-002", createdAt: "2026-03-25", updatedAt: "2026-04-01", tags: ["backend", "database", "decisions"],
    },
    {
        id: "tsk-023", title: "Build sprint performance data pipeline",
        description: "Create data aggregation pipeline for sprint metrics. Statistical analysis of trends, anomaly detection, and threshold calculations.",
        assigneeId: "usr-011", // Walaa Sherif — Data Analyst
        phase: TaskPhase.InProgress, priority: TaskPriority.Medium, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 86, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: false, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-26", updatedAt: "2026-04-02", tags: ["data", "analytics", "pipeline"],
    },
    {
        id: "tsk-025", title: "Write sprint grooming checklist and risk review template",
        description: "Create standardized templates for pre-sprint grooming checklist and risk review. Document entry/exit criteria for each workflow phase.",
        assigneeId: "usr-008", // Karim Sayed — Project Manager
        phase: TaskPhase.InProgress, priority: TaskPriority.Medium, storyPoints: 3, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-26", updatedAt: "2026-04-02", tags: ["process", "grooming", "pm"],
    },

    // ── Review ──────────────────────────────────────────────────
    {
        id: "tsk-013", title: "Team workload visualization components",
        description: "Workload distribution bars, context switching chart, and capacity overview. CSS-only visualizations matching design system.",
        assigneeId: "usr-002", // Basel Sherif — Frontend Engineer
        phase: TaskPhase.Review, priority: TaskPriority.Medium, storyPoints: 5, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-24", updatedAt: "2026-04-02", tags: ["workload", "charts", "frontend"],
    },
    {
        id: "tsk-014", title: "Communication response time tracker UI",
        description: "Build frontend view for tracking response times across Slack, email, meetings. Includes SLA indicators and channel-by-channel analytics.",
        assigneeId: "usr-001", // Mohamed Elhawary — Sr. Frontend Engineer
        phase: TaskPhase.Review, priority: TaskPriority.Medium, storyPoints: 5, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-25", updatedAt: "2026-04-03", tags: ["communication", "sla", "frontend"],
    },
    {
        id: "tsk-015", title: "Dark mode implementation",
        description: "Full dark mode with CSS custom properties, smooth transitions, and system preference detection. All 11 views tested.",
        assigneeId: "usr-002", // Basel Sherif — Frontend Engineer
        phase: TaskPhase.Review, priority: TaskPriority.Medium, storyPoints: 3, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-23", updatedAt: "2026-04-03", tags: ["ui", "theme", "frontend"],
    },

    // ── QA ───────────────────────────────────────────────────────
    {
        id: "tsk-016", title: "QA: Sprint analytics multi-sprint comparison",
        description: "Test data accuracy across all 17 metrics for 3 sprints. Verify trend calculations, health score formula, and edge cases for empty data.",
        assigneeId: "usr-009", // Rashad Abdallah — Quality Control
        phase: TaskPhase.QA, priority: TaskPriority.High, storyPoints: 5, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: true, blockerId: "blk-004", createdAt: "2026-03-24", updatedAt: "2026-04-03", tags: ["qa", "analytics", "testing"],
    },
    {
        id: "tsk-017", title: "QA: Ownership map and conflict detection",
        description: "Verify conflict detection logic, ownership assignment accuracy, and review gate enforcement. Test with various conflict scenarios.",
        assigneeId: "usr-009", // Rashad Abdallah — Quality Control
        phase: TaskPhase.QA, priority: TaskPriority.Medium, storyPoints: 5, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-25", updatedAt: "2026-04-03", tags: ["qa", "ownership", "testing"],
    },

    // ── Done ────────────────────────────────────────────────────
    {
        id: "tsk-018", title: "Authentication and login flow",
        description: "Login page with form validation, dummy auth via localStorage, session persistence, and protected/public route guards.",
        assigneeId: "usr-001", // Mohamed Elhawary — Sr. Frontend Engineer
        phase: TaskPhase.Done, priority: TaskPriority.Critical, storyPoints: 5, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-23", updatedAt: "2026-03-26", tags: ["auth", "frontend"],
    },
    {
        id: "tsk-019", title: "App layout and navigation shell",
        description: "Collapsible sidebar, topbar with sprint selector and avatar dropdown, responsive dashboard layout with outlet.",
        assigneeId: "usr-002", // Basel Sherif — Frontend Engineer
        phase: TaskPhase.Done, priority: TaskPriority.Critical, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-23", updatedAt: "2026-03-27", tags: ["layout", "navigation", "frontend"],
    },
    {
        id: "tsk-020", title: "Design system and component library",
        description: "Atoms (Button, Badge, Card, Input), Radix UI wrappers, theme tokens, light/dark mode CSS system, shared components.",
        assigneeId: "usr-001", // Mohamed Elhawary — Sr. Frontend Engineer
        phase: TaskPhase.Done, priority: TaskPriority.High, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-23", updatedAt: "2026-03-28", tags: ["design-system", "components", "frontend"],
    },
    {
        id: "tsk-021", title: "Kanban board with drag-and-drop",
        description: "Task board with 6 phase columns, draggable cards (HTML5 DnD), phase transition gates, readiness enforcement, toast notifications.",
        assigneeId: "usr-001", // Mohamed Elhawary — Sr. Frontend Engineer
        phase: TaskPhase.Done, priority: TaskPriority.High, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-24", updatedAt: "2026-03-30", tags: ["tasks", "kanban", "frontend"],
    },
    {
        id: "tsk-022", title: "UI/UX design for dashboard and kanban",
        description: "Figma high-fidelity mockups for sprint dashboard, task board, and blocker tracker. Design tokens, responsive breakpoints, and interaction states.",
        assigneeId: "usr-012", // Mohamed Ahmed — UI/UX Designer
        phase: TaskPhase.Done, priority: TaskPriority.High, storyPoints: 5, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-23", updatedAt: "2026-03-27", tags: ["design", "figma", "ux"],
    },
    {
        id: "tsk-026", title: "Backend auth service and JWT implementation",
        description: "JWT token generation, refresh flow, password hashing, and auth middleware. PostgreSQL user table with roles.",
        assigneeId: "usr-004", // Ahmed Bashier — Sr. Backend Engineer
        phase: TaskPhase.Done, priority: TaskPriority.Critical, storyPoints: 8, sprintId: "spr-014",
        readinessScore: 100, readinessChecklist: { acceptanceCriteriaDefined: true, businessRulesClear: true, edgeCasesIdentified: true, dependenciesMapped: true, designAvailable: true, apiContractReady: true, estimationDone: true },
        hasBlocker: false, createdAt: "2026-03-23", updatedAt: "2026-03-28", tags: ["auth", "jwt", "backend"],
    },
];
