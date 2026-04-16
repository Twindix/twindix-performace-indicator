export const checkIsNetworkErrorHandler = (error: unknown): boolean => {
    if (!(error instanceof Error)) return false;
    const msg = error.message.toLowerCase();
    return (
        msg.includes("network") ||
        msg.includes("fetch") ||
        msg.includes("failed to load") ||
        msg.includes("chunk")
    );
};

export const getErrorMessageHandler = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "An unexpected error occurred";
};
