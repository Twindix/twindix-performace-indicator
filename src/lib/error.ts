export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public data?: unknown,
        public fieldErrors?: Record<string, string[]>,
        public code?: string,
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export const getErrorMessage = (error: unknown, fallback?: string): string => {
    if (error instanceof ApiError && error.message) return error.message;
    if (error instanceof Error && error.message) return error.message;
    return fallback ?? "Something went wrong. Please try again.";
};
