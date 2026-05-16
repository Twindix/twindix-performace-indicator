import { useState } from "react";

import { remindersConstants } from "@/constants";
import type { ReminderInterface, UpdateReminderPayloadInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { remindersService } from "@/services";

export const useUpdateReminder = (options?: { onFieldErrors?: (errors: Record<string, string[]>) => void }) => {
    const [isLoading, setIsLoading] = useState(false);

    const updateHandler = async (id: string, payload: UpdateReminderPayloadInterface): Promise<ReminderInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => remindersService.updateHandler(id, payload), {
                errorFallback: remindersConstants.errors.updateFailed,
                successMessage: remindersConstants.messages.updateSuccess,
                onFieldErrors: options?.onFieldErrors,
                context: "reminders.update",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { updateHandler, isLoading };
};
