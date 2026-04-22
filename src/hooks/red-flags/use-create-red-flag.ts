import { useCallback, useState } from "react";
import { toast } from "sonner";

import { redFlagsConstants } from "@/constants";
import type { CreateRedFlagPayloadInterface, RedFlagInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { redFlagsService } from "@/services";

export const useCreateRedFlag = () => {
    const [isLoading, setIsLoading] = useState(false);

    const createHandler = useCallback(async (sprintId: string, payload: CreateRedFlagPayloadInterface): Promise<RedFlagInterface | null> => {
        setIsLoading(true);
        try {
            const res = await redFlagsService.createHandler(sprintId, payload);
            toast.success(redFlagsConstants.messages.createSuccess);
            return (res as unknown as { data?: RedFlagInterface }).data ?? (res as unknown as RedFlagInterface);
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err, redFlagsConstants.errors.createFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { createHandler, isLoading };
};
