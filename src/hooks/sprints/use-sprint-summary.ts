import { useState } from "react";
import { toast } from "sonner";

import { sprintsConstants } from "@/constants";
import type { SprintSummaryInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { sprintsService } from "@/services";

export const useSprintSummary = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getHandler = async (id: string): Promise<SprintSummaryInterface | null> => {
        if (!navigator.onLine) throw new Error(sprintsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await sprintsService.summaryHandler(id);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, sprintsConstants.errors.summaryFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { getHandler, isLoading };
};
