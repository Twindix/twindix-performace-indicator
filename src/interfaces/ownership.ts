export interface OwnershipEntryInterface {
    id: string;
    componentName: string;
    ownerId: string;
    backupOwnerId?: string;
    lastModified: string;
    changeCount: number;
    hasConflict: boolean;
    conflictDescription?: string;
}
