import { useState } from "react";
import { toast } from "sonner";

import { redFlagsConstants } from "@/constants";
import type { RedFlagInterface, RedFlagsCountInterface, RedFlagsListFiltersInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { redFlagsService } from "@/services";

export const useGetRedFlag = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getHandler = async (id: string): Promise<RedFlagInterface | null> => {
        if (!navigator.onLine) throw new Error(redFlagsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await redFlagsService.detailHandler(id);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, redFlagsConstants.errors.fetchDetailFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const getAllHandler = async (sprintId: string, filters?: RedFlagsListFiltersInterface): Promise<RedFlagInterface[] | null> => {
        if (!navigator.onLine) throw new Error(redFlagsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await redFlagsService.listHandler(sprintId, filters);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, redFlagsConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const getCountHandler = async (sprintId: string): Promise<RedFlagsCountInterface | null> => {
        if (!navigator.onLine) throw new Error(redFlagsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await redFlagsService.countHandler(sprintId);
            return res;
        } catch (err) {
            toast.error(getErrorMessage(err, redFlagsConstants.errors.countFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { getHandler, getAllHandler, getCountHandler, isLoading };
};
