import { useState } from "react";
import { toast } from "sonner";

import { blockersConstants } from "@/constants";
import type { BlockerInterface, UpdateBlockerPayloadInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { blockersService } from "@/services";

export const useUpdateBlocker = () => {
    const [isLoading, setIsLoading] = useState(false);

    const updateHandler = async (id: string, payload: UpdateBlockerPayloadInterface): Promise<BlockerInterface | null> => {
        if (!navigator.onLine) throw new Error(blockersConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await blockersService.updateHandler(id, payload);
            toast.success(blockersConstants.messages.updateSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.updateFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { updateHandler, isLoading };
};
