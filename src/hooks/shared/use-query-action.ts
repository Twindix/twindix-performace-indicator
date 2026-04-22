import { useCallback, useEffect, useRef, useState } from "react";

import { runAction, type RunActionOptions } from "@/lib/handle-action";

export interface UseQueryActionOptions<T> extends RunActionOptions {
    enabled?: boolean;
    initialData?: T;
}

export const useQueryAction = <T>(
    fn: () => Promise<T>,
    deps: ReadonlyArray<unknown>,
    options: UseQueryActionOptions<T> = {},
) => {
    const { enabled = true, initialData, ...runOptions } = options;
    const [data, setData] = useState<T | undefined>(initialData);
    const [isLoading, setIsLoading] = useState(enabled);
    const fnRef = useRef(fn);
    fnRef.current = fn;

    const refetch = useCallback(async (): Promise<T | null> => {
        if (!enabled) {
            setIsLoading(false);
            return null;
        }
        setIsLoading(true);
        try {
            const result = await runAction(() => fnRef.current(), runOptions);
            if (result !== null) setData(result);
            return result;
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, runOptions.errorFallback, runOptions.silent, runOptions.context]);

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { data, isLoading, refetch, setData };
};
