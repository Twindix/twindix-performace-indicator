import { useState } from "react";
import { toast } from "sonner";

import { blockersConstants } from "@/constants";
import type { BlockerInterface, CreateBlockerPayloadInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { blockersService } from "@/services";

export const useCreateBlocker = () => {
    const [isLoading, setIsLoading] = useState(false);

    const createHandler = async (sprintId: string, payload: CreateBlockerPayloadInterface): Promise<BlockerInterface | null> => {
        if (!navigator.onLine) throw new Error(blockersConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await blockersService.createHandler(sprintId, payload);
            toast.success(blockersConstants.messages.createSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, blockersConstants.errors.createFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { createHandler, isLoading };
};
