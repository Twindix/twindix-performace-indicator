import { useCallback, useRef, useState } from "react";

import { runAction, type RunActionOptions } from "@/lib/handle-action";

export const useMutationAction = <TArgs extends unknown[], TResult>(
    fn: (...args: TArgs) => Promise<TResult>,
    options: RunActionOptions = {},
) => {
    const [isLoading, setIsLoading] = useState(false);
    const fnRef = useRef(fn);
    const optionsRef = useRef(options);
    fnRef.current = fn;
    optionsRef.current = options;

    const mutate = useCallback(async (...args: TArgs): Promise<TResult | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => fnRef.current(...args), optionsRef.current);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { mutate, isLoading };
};
