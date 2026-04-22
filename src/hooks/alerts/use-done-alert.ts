import { alertsConstants } from "@/constants";
import type { AlertInterface } from "@/interfaces";
import { alertsService } from "@/services";

import { useMutationAction } from "../shared";

export const useDoneAlert = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<AlertInterface> => {
            const res = await alertsService.doneHandler(id);
            return res.data;
        },
        {
            successMessage: alertsConstants.messages.doneSuccess,
            errorFallback: alertsConstants.errors.doneFailed,
            context: "alerts.done",
        },
    );

    return { doneHandler: mutate, isLoading };
};
