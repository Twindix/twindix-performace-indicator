export const formatJoinedDate = (createdAt: string | null | undefined): string => {
    if (!createdAt) return "";
    return new Date(createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
};
