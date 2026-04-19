import { useState } from "react";
import { toast } from "sonner";

import { requirementsConstants } from "@/constants";
import type { RequirementItemInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { requirementsService } from "@/services";

export const useGetRequirement = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getAllHandler = async (taskId: string): Promise<RequirementItemInterface[] | null> => {
        if (!navigator.onLine) throw new Error(requirementsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await requirementsService.listHandler(taskId);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, requirementsConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { getAllHandler, isLoading };
};
