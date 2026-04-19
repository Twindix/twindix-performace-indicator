import { useState } from "react";
import { toast } from "sonner";

import { sprintsConstants } from "@/constants";
import type { SprintInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { sprintsService } from "@/services";

export const useActivateSprint = () => {
    const [isLoading, setIsLoading] = useState(false);

    const activateHandler = async (id: string): Promise<SprintInterface | null> => {
        if (!navigator.onLine) throw new Error(sprintsConstants.errors.genericError);
        setIsLoading(true);
        try {
            const res = await sprintsService.activateHandler(id);
            toast.success(sprintsConstants.messages.activateSuccess);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, sprintsConstants.errors.activateFailed));
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { activateHandler, isLoading };
};
