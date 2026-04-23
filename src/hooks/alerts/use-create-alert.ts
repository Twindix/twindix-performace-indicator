import { alertsConstants } from "@/constants";
import type { AlertInterface, CreateAlertPayloadInterface } from "@/interfaces";
import { alertsService } from "@/services";

import { useMutationAction, type FieldErrors } from "../shared";

export interface UseCreateAlertOptions {
    onFieldErrors?: (errors: FieldErrors) => void;
}

export const useCreateAlert = ({ onFieldErrors }: UseCreateAlertOptions = {}) => {
    const { mutate, isLoading } = useMutationAction(
        async (sprintId: string, payload: CreateAlertPayloadInterface): Promise<AlertInterface> => {
            const res = await alertsService.createHandler(sprintId, payload);
            return res.data;
        },
        {
            successMessage: alertsConstants.messages.createSuccess,
            errorFallback: alertsConstants.errors.createFailed,
            onFieldErrors,
            context: "alerts.create",
        },
    );

    return { createHandler: mutate, isLoading };
};
