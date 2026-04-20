import { useCallback, useState } from "react";
import { toast } from "sonner";

import { sprintsConstants } from "@/constants";
import type { SprintInterface, UpdateSprintPayloadInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { sprintsService } from "@/services";

export const useUpdateSprint = () => {
    const [isLoading, setIsLoading] = useState(false);

    const updateHandler = useCallback(async (id: string, payload: UpdateSprintPayloadInterface): Promise<SprintInterface | null> => {
        setIsLoading(true);
        try {
            const res = await sprintsService.updateHandler(id, payload);
            toast.success(sprintsConstants.messages.updateSuccess);
            return res.data;
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err, sprintsConstants.errors.updateFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { updateHandler, isLoading };
};
