import { useState } from "react";
import { toast } from "sonner";

import { requirementsConstants } from "@/constants/requirements";
import type { RequirementInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { requirementsService } from "@/services";

export const useToggleRequirement = () => {
    const [isLoading, setIsLoading] = useState(false);

    const toggleHandler = async (id: string): Promise<RequirementInterface | null> => {
        setIsLoading(true);
        try {
            const res = await requirementsService.toggleHandler(id);
            toast.success(requirementsConstants.messages.toggleSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, requirementsConstants.errors.toggleFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { toggleHandler, isLoading };
};