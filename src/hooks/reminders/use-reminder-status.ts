import { useState } from "react";

import { remindersConstants } from "@/constants";
import type { ReminderInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { remindersService } from "@/services";

export const useDismissReminder = () => {
    const [isLoading, setIsLoading] = useState(false);
    const dismissHandler = async (id: string): Promise<ReminderInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => remindersService.dismissHandler(id), {
                errorFallback: remindersConstants.errors.dismissFailed,
                successMessage: remindersConstants.messages.dismissSuccess,
                context: "reminders.dismiss",
            });
        } finally {
            setIsLoading(false);
        }
    };
    return { dismissHandler, isLoading };
};

export const useReactivateReminder = () => {
    const [isLoading, setIsLoading] = useState(false);
    const reactivateHandler = async (id: string): Promise<ReminderInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => remindersService.reactivateHandler(id), {
                errorFallback: remindersConstants.errors.reactivateFailed,
                successMessage: remindersConstants.messages.reactivateSuccess,
                context: "reminders.reactivate",
            });
        } finally {
            setIsLoading(false);
        }
    };
    return { reactivateHandler, isLoading };
};
