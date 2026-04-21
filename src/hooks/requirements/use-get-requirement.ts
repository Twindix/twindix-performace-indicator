import { useCallback, useState } from "react";
import { toast } from "sonner";

import { requirementsConstants } from "@/constants/requirements";
import type { RequirementInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { requirementsService } from "@/services";

export const useGetRequirement = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getAllHandler = useCallback(async (taskId: string): Promise<RequirementInterface[] | null> => {
        setIsLoading(true);
        try {
            const res = await requirementsService.getAllHandler(taskId);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, requirementsConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { getAllHandler, isLoading };
};