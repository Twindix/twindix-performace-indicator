import { useState } from "react";
import { toast } from "sonner";

import { teamsConstants } from "@/constants";
import type { CreateTeamPayloadInterface, TeamInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { teamsService } from "@/services";

export const useCreateTeam = () => {
    const [isLoading, setIsLoading] = useState(false);

    const createHandler = async (payload: CreateTeamPayloadInterface): Promise<TeamInterface | null> => {
        if (!navigator.onLine) throw new Error(teamsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await teamsService.createHandler(payload);
            toast.success(teamsConstants.messages.createSuccess);
            return (res as unknown as { data?: TeamInterface }).data ?? (res as unknown as TeamInterface);
        } catch (err) {
            toast.error(getErrorMessage(err, teamsConstants.errors.createFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { createHandler, isLoading };
};
