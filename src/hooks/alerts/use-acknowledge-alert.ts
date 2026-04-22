import { alertsConstants } from "@/constants";
import type { AlertInterface } from "@/interfaces";
import { alertsService } from "@/services";

import { useMutationAction } from "../shared";

export const useAcknowledgeAlert = () => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string): Promise<AlertInterface> => {
            const res = await alertsService.acknowledgeHandler(id);
            return res.data;
        },
        {
            successMessage: alertsConstants.messages.acknowledgeSuccess,
            errorFallback: alertsConstants.errors.acknowledgeFailed,
            context: "alerts.acknowledge",
        },
    );

    return { acknowledgeHandler: mutate, isLoading };
};
