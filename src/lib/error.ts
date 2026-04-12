export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public data?: unknown,
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export const handleApiError = (error: unknown): ApiError => {
    if (error instanceof ApiError) {
        return error;
    }

    if (error instanceof Error) {
        return new ApiError(500, error.message);
    }

    return new ApiError(500, "An unexpected error occurred");
};
