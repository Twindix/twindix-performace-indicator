import { useState } from "react";
import { toast } from "sonner";

import { blockersConstants } from "@/constants";
import type { BlockerInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { blockersService } from "@/services";

export const useResolveBlocker = () => {
    const [isLoading, setIsLoading] = useState(false);

    const resolveHandler = async (id: string): Promise<BlockerInterface | null> => {
        if (!navigator.onLine) throw new Error(blockersConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await blockersService.resolveHandler(id);
            toast.success(blockersConstants.messages.resolveSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.resolveFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { resolveHandler, isLoading };
};
