import { useState } from "react";

import { remindersConstants } from "@/constants";
import type { CreateReminderPayloadInterface, ReminderInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { remindersService } from "@/services";

export const useCreateReminder = (options?: { onFieldErrors?: (errors: Record<string, string[]>) => void }) => {
    const [isLoading, setIsLoading] = useState(false);

    const createHandler = async (payload: CreateReminderPayloadInterface): Promise<ReminderInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => remindersService.createHandler(payload), {
                errorFallback: remindersConstants.errors.createFailed,
                successMessage: remindersConstants.messages.createSuccess,
                onFieldErrors: options?.onFieldErrors,
                context: "reminders.create",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { createHandler, isLoading };
};
