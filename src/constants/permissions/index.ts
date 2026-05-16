export const ROLE_TIERS = ["owner", "admin", "manager", "tester", "member", "viewer"] as const;
export type RoleTier = typeof ROLE_TIERS[number];

export const ROLE_TIER_LABELS: Record<RoleTier, string> = {
    owner: "Owner",
    admin: "Admin",
    manager: "Manager",
    tester: "Tester",
    member: "Member",
    viewer: "Viewer",
};

export const PERMISSION_MESSAGES = {
    forbidden: "You don't have permission to do this.",
    viewerReadOnly: "Viewers have read-only access.",
    ownerOnly: "Only the company owner can do this.",
} as const;

export const permissionsConstants = {
    roleTiers: ROLE_TIERS,
    roleTierLabels: ROLE_TIER_LABELS,
    messages: PERMISSION_MESSAGES,
} as const;

export const roleTierOptions = (include?: readonly RoleTier[]): readonly RoleTier[] =>
    include && include.length > 0 ? ROLE_TIERS.filter((r) => include.includes(r)) : ROLE_TIERS;

/**
 * Which role tiers a given actor is allowed to assign when creating or editing a user.
 *
 * Per V0.85 spec:
 *   - owner can assign admin, manager, tester, member, viewer (NOT owner — owner is set once)
 *   - admin can assign manager, tester, member, viewer (NOT owner, NOT admin)
 *   - everyone else cannot assign roles at all
 */
export const assignableRolesFor = (actor: RoleTier): readonly RoleTier[] => {
    if (actor === "owner") return ["admin", "manager", "tester", "member", "viewer"];
    if (actor === "admin") return ["manager", "tester", "member", "viewer"];
    return [];
};
