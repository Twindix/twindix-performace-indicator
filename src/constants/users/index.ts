export const usersConstants = {
    defaultPerPage: 20,
    roleTiers: ["admin", "manager", "member"] as const,
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
