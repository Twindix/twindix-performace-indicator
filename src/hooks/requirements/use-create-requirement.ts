import { useState } from "react";
import { toast } from "sonner";

import { requirementsConstants } from "@/constants";
import type { CreateRequirementPayloadInterface, RequirementItemInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { requirementsService } from "@/services";

export const useCreateRequirement = () => {
    const [isLoading, setIsLoading] = useState(false);

    const createHandler = async (taskId: string, payload: CreateRequirementPayloadInterface): Promise<RequirementItemInterface | null> => {
        if (!navigator.onLine) throw new Error(requirementsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await requirementsService.createHandler(taskId, payload);
            toast.success(requirementsConstants.messages.createSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, requirementsConstants.errors.createFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { createHandler, isLoading };
};
