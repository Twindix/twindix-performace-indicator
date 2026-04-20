export interface AlertInterface {
    id: string;
    title: string;
    description: string;
    createdById: string;
    mentionedIds: string[]; // empty = mention all
    resolvedByIds: string[]; // ids of mentioned who marked resolved
    createdAt: string;
    updatedAt: string;
    sprintId: string;
}
