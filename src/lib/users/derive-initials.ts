export const deriveInitials = (fullName: string, override?: string): string => {
    const trimmed = override?.trim();
    if (trimmed) return trimmed;
    return fullName
        .trim()
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};
