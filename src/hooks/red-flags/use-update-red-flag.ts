import { useState } from "react";
import { toast } from "sonner";

import { redFlagsConstants } from "@/constants";
import type { RedFlagInterface, UpdateRedFlagPayloadInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { redFlagsService } from "@/services";

export const useUpdateRedFlag = () => {
    const [isLoading, setIsLoading] = useState(false);

    const updateHandler = async (id: string, payload: UpdateRedFlagPayloadInterface): Promise<RedFlagInterface | null> => {
        if (!navigator.onLine) throw new Error(redFlagsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await redFlagsService.updateHandler(id, payload);
            toast.success(redFlagsConstants.messages.updateSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, redFlagsConstants.errors.updateFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { updateHandler, isLoading };
};
