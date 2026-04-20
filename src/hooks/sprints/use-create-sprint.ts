import { useCallback, useState } from "react";
import { toast } from "sonner";

import { sprintsConstants } from "@/constants";
import type { CreateSprintPayloadInterface, SprintInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { sprintsService } from "@/services";

export const useCreateSprint = () => {
    const [isLoading, setIsLoading] = useState(false);

    const createHandler = useCallback(async (payload: CreateSprintPayloadInterface): Promise<SprintInterface | null> => {
        setIsLoading(true);
        try {
            const res = await sprintsService.createHandler(payload);
            toast.success(sprintsConstants.messages.createSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, sprintsConstants.errors.createFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { createHandler, isLoading };
};
