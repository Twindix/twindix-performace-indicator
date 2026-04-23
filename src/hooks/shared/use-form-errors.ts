import { useCallback, useState } from "react";

export type FieldErrors = Record<string, string[]>;

export const useFormErrors = () => {
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const clearError = useCallback((field: string) => {
        setFieldErrors((prev) => {
            if (!(field in prev)) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    const clear = useCallback(() => setFieldErrors({}), []);

    const getError = useCallback(
        (field: string): string | undefined => fieldErrors[field]?.[0],
        [fieldErrors],
    );

    return { fieldErrors, setFieldErrors, clearError, clear, getError };
};
