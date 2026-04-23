import { ROLE_TIERS, ROLE_TIER_LABELS } from "../permissions";

export const usersConstants = {
    defaultPerPage: 20,
    roleTiers: ROLE_TIERS,
    roleTierLabels: ROLE_TIER_LABELS,
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
    },
} as const;
