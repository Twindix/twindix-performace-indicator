/** Convert a status enum value (e.g. "in_progress") to a human-readable label ("In Progress"). */
export const statusLabel = (status: string): string =>
    status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
