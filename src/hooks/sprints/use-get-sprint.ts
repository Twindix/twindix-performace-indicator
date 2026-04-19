import { useState } from "react";
import { toast } from "sonner";

import { sprintsConstants } from "@/constants";
import type { SprintInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { sprintsService } from "@/services";

export const useGetSprint = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getHandler = async (id: string): Promise<SprintInterface | null> => {
        if (!navigator.onLine) throw new Error(sprintsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await sprintsService.detailHandler(id);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, sprintsConstants.errors.fetchDetailFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const getAllHandler = async (): Promise<SprintInterface[] | null> => {
        if (!navigator.onLine) throw new Error(sprintsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await sprintsService.listHandler();
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, sprintsConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { getHandler, getAllHandler, isLoading };
};
