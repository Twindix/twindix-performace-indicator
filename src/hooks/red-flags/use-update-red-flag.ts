import { useCallback, useState } from "react";
import { toast } from "sonner";

import { redFlagsConstants } from "@/constants";
import type { RedFlagInterface, UpdateRedFlagPayloadInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { redFlagsService } from "@/services";

export const useUpdateRedFlag = () => {
    const [isLoading, setIsLoading] = useState(false);

    const updateHandler = useCallback(async (id: string, payload: UpdateRedFlagPayloadInterface): Promise<RedFlagInterface | null> => {
        setIsLoading(true);
        try {
            const res = await redFlagsService.updateHandler(id, payload);
            toast.success(redFlagsConstants.messages.updateSuccess);
            return (res as unknown as { data?: RedFlagInterface }).data ?? (res as unknown as RedFlagInterface);
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err, redFlagsConstants.errors.updateFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { updateHandler, isLoading };
};
