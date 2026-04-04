import type { OwnershipEntryInterface } from "@/interfaces";

export const seedOwnership: OwnershipEntryInterface[] = [
    { id: "own-001", componentName: "Authentication Module", ownerId: "usr-001", backupOwnerId: "usr-002", lastModified: "2026-03-26", changeCount: 3, hasConflict: false },
    { id: "own-002", componentName: "Dashboard Widgets", ownerId: "usr-001", backupOwnerId: "usr-002", lastModified: "2026-04-02", changeCount: 8, hasConflict: false },
    { id: "own-003", componentName: "Form Validation Utilities", ownerId: "usr-001", lastModified: "2026-03-31", changeCount: 5, hasConflict: true, conflictDescription: "Ahmed Bashier (Backend) modified shared validation rules without frontend review from Mohamed Elhawary" },
    { id: "own-004", componentName: "Report Generation Engine", ownerId: "usr-001", backupOwnerId: "usr-002", lastModified: "2026-04-01", changeCount: 4, hasConflict: false },
    { id: "own-005", componentName: "Notification Service", ownerId: "usr-003", backupOwnerId: "usr-004", lastModified: "2026-03-28", changeCount: 2, hasConflict: false },
    { id: "own-006", componentName: "Shared UI Components", ownerId: "usr-001", backupOwnerId: "usr-002", lastModified: "2026-04-03", changeCount: 12, hasConflict: true, conflictDescription: "Basel Sherif and Mohamed Elhawary both modified button component styles without coordinating" },
    { id: "own-007", componentName: "API Client Layer", ownerId: "usr-003", backupOwnerId: "usr-004", lastModified: "2026-03-30", changeCount: 6, hasConflict: false },
    { id: "own-008", componentName: "State Management (Zustand)", ownerId: "usr-001", lastModified: "2026-03-29", changeCount: 3, hasConflict: false },
    { id: "own-009", componentName: "Payment Flow", ownerId: "usr-003", backupOwnerId: "usr-001", lastModified: "2026-03-27", changeCount: 4, hasConflict: true, conflictDescription: "Frontend changed payment form validation without notifying Ahmed Heikal (Backend owner)" },
    { id: "own-010", componentName: "User Settings Module", ownerId: "usr-002", lastModified: "2026-04-02", changeCount: 7, hasConflict: false },
    { id: "own-011", componentName: "Test Utilities", ownerId: "usr-009", backupOwnerId: "usr-001", lastModified: "2026-03-28", changeCount: 2, hasConflict: false },
    { id: "own-012", componentName: "AI Screening Pipeline", ownerId: "usr-010", backupOwnerId: "usr-003", lastModified: "2026-03-25", changeCount: 1, hasConflict: false },
];
