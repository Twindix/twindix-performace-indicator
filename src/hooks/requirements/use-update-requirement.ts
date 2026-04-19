import { useState } from "react";
import { toast } from "sonner";

import { requirementsConstants } from "@/constants";
import type { RequirementItemInterface, UpdateRequirementPayloadInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { requirementsService } from "@/services";

export const useUpdateRequirement = () => {
    const [isLoading, setIsLoading] = useState(false);

    const updateHandler = async (id: string, payload: UpdateRequirementPayloadInterface): Promise<RequirementItemInterface | null> => {
        if (!navigator.onLine) throw new Error(requirementsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await requirementsService.updateHandler(id, payload);
            toast.success(requirementsConstants.messages.updateSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, requirementsConstants.errors.updateFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { updateHandler, isLoading };
};
