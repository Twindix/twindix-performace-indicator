import { useState } from "react";
import { toast } from "sonner";

import { teamsConstants } from "@/constants";
import type { TeamInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { teamsService } from "@/services";

export const useGetTeams = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getAllHandler = async (): Promise<TeamInterface[] | null> => {
        if (!navigator.onLine) throw new Error(teamsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await teamsService.listHandler();
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, teamsConstants.errors.fetchFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { getAllHandler, isLoading };
};
