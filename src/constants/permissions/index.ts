export const ROLE_TIERS = ["admin", "manager", "tester", "member", "viewer"] as const;
export type RoleTier = typeof ROLE_TIERS[number];

export const ROLE_TIER_LABELS: Record<RoleTier, string> = {
    admin: "Admin",
    manager: "Manager",
    tester: "Tester",
    member: "Member",
    viewer: "Viewer",
};

export const PERMISSION_MESSAGES = {
    forbidden: "You don't have permission to do this.",
    viewerReadOnly: "Viewers have read-only access.",
} as const;

export const permissionsConstants = {
    roleTiers: ROLE_TIERS,
    roleTierLabels: ROLE_TIER_LABELS,
    messages: PERMISSION_MESSAGES,
} as const;

export const roleTierOptions = (include?: readonly RoleTier[]): readonly RoleTier[] =>
    include && include.length > 0 ? ROLE_TIERS.filter((r) => include.includes(r)) : ROLE_TIERS;
