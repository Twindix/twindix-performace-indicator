import { alertsConstants } from "@/constants";
import type { AlertInterface, UpdateAlertPayloadInterface } from "@/interfaces";
import { alertsService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseUpdateAlertOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useUpdateAlert = ({ onFieldErrors }: UseUpdateAlertOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async (id: string, payload: UpdateAlertPayloadInterface): Promise<AlertInterface> => {
            const res = await alertsService.updateHandler(id, payload);
            return res.data;
        },
        {
            successMessage: alertsConstants.messages.updateSuccess,
            errorFallback: alertsConstants.errors.updateFailed,
            onFieldErrors,
            context: "alerts.update",
        },
    );

    return { updateHandler: mutate, isLoading };
};
