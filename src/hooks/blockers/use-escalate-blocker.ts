import { useState } from "react";
import { toast } from "sonner";

import { blockersConstants } from "@/constants";
import type { BlockerInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { blockersService } from "@/services";

export const useEscalateBlocker = () => {
    const [isLoading, setIsLoading] = useState(false);

    const escalateHandler = async (id: string): Promise<BlockerInterface | null> => {
        if (!navigator.onLine) throw new Error(blockersConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await blockersService.escalateHandler(id);
            toast.success(blockersConstants.messages.escalateSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.escalateFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { escalateHandler, isLoading };
};
