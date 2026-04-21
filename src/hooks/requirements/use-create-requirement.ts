import { useState } from "react";
import { toast } from "sonner";

import { requirementsConstants } from "@/constants/requirements";
import type { CreateRequirementPayloadInterface, RequirementInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { requirementsService } from "@/services";

export const useCreateRequirement = () => {
    const [isLoading, setIsLoading] = useState(false);

    const createHandler = async (taskId: string, payload: CreateRequirementPayloadInterface): Promise<RequirementInterface | null> => {
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