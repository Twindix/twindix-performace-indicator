import { useCallback, useState } from "react";

import { runAction, type RunActionOptions } from "@/lib/handle-action";

export const useMutationAction = <TArgs extends unknown[], TResult>(
    fn: (...args: TArgs) => Promise<TResult>,
    options: RunActionOptions = {},
) => {
    const [isLoading, setIsLoading] = useState(false);

    const mutate = useCallback(
        async (...args: TArgs): Promise<TResult | null> => {
            setIsLoading(true);
            try {
                return await runAction(() => fn(...args), options);
            } finally {
                setIsLoading(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [fn, options.successMessage, options.errorFallback, options.silent, options.rethrow, options.context, options.onFieldErrors],
    );

    return { mutate, isLoading };
};
