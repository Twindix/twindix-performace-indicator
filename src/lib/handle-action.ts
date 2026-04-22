import { toast } from "sonner";

import { useNetworkErrorStore } from "@/store/network-error";

import { ApiError, getErrorMessage } from "./error";

export interface RunActionOptions {
    successMessage?: string;
    errorFallback?: string;
    onFieldErrors?: (errors: Record<string, string[]>) => void;
    silent?: boolean;
    rethrow?: boolean;
    context?: string;
}

const FORBIDDEN_MESSAGE = "You don't have permission to do this.";
const NETWORK_MESSAGE = "Network issue — please try again.";
const RATE_LIMIT_MESSAGE = "You're going too fast — try again in a moment.";
const GENERIC_MESSAGE = "Something went wrong. Please try again.";

const isNetworkError = (err: unknown): boolean => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
    if (err instanceof ApiError) {
        const msg = err.message.toLowerCase();
        return (
            msg.includes("network") ||
            msg.includes("timeout") ||
            msg.includes("econnaborted") ||
            msg.includes("failed to fetch")
        );
    }
    return false;
};

const devLog = (context: string | undefined, err: unknown) => {
    if (import.meta.env.DEV) console.error(`[${context ?? "action"}]`, err);
};

export const runAction = async <T>(
    fn: () => Promise<T>,
    options: RunActionOptions = {},
): Promise<T | null> => {
    const {
        successMessage,
        errorFallback,
        onFieldErrors,
        silent = false,
        rethrow = false,
        context,
    } = options;

    try {
        const result = await fn();
        if (successMessage && !silent) toast.success(successMessage);
        return result;
    } catch (err) {
        const apiError = err instanceof ApiError ? err : null;
        const status = apiError?.statusCode;

        if (status === 401) {
            if (rethrow) throw err;
            return null;
        }

        if (isNetworkError(err)) {
            useNetworkErrorStore.getState().onSetNetworkError();
            if (!silent) toast.error(NETWORK_MESSAGE);
            devLog(context, err);
            if (rethrow) throw err;
            return null;
        }

        if (status === 422 && apiError?.fieldErrors && onFieldErrors) {
            onFieldErrors(apiError.fieldErrors);
            devLog(context, err);
            if (rethrow) throw err;
            return null;
        }

        if (!silent) {
            let message: string;
            if (status === 403) message = FORBIDDEN_MESSAGE;
            else if (status === 429) message = RATE_LIMIT_MESSAGE;
            else if (status !== undefined && status >= 500) message = errorFallback ?? GENERIC_MESSAGE;
            else message = getErrorMessage(err, errorFallback);
            toast.error(message);
        }

        devLog(context, err);

        if (rethrow) throw err;
        return null;
    }
};
