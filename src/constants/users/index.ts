import { ROLE_TIERS, ROLE_TIER_LABELS } from "../permissions";

import type { RoleTier } from "../permissions";

export const usersConstants = {
    defaultPerPage: 20,
    roleTiers: ROLE_TIERS,
    roleTierLabels: ROLE_TIER_LABELS,
    phaseLabels: {
        backlog: "Backlog",
        ready: "Ready",
        in_progress: "In Progress",
        review: "Review",
        qa: "QA",
        done: "Done",
    } as Record<string, string>,
    emptyAddUserForm: {
        full_name: "",
        email: "",
        password: "",
        role_label: "",
        role_tier: "member" as RoleTier,
        team_id: "",
        avatar_initials: "",
    },
    errors: {
        fetchFailed: "Failed to load users.",
        detailFetchFailed: "Failed to load user.",
        createFailed: "Failed to create user.",
        updateFailed: "Failed to update user.",
        deleteFailed: "Failed to delete user.",
    },
    messages: {
        createSuccess: "User created.",
        updateSuccess: "User updated.",
        deleteSuccess: "User deleted.",
        activated: "User activated",
        deactivated: "User deactivated",
    },
} as const;
