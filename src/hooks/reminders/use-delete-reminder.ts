import { useState } from "react";

import { remindersConstants } from "@/constants";
import { runAction } from "@/lib/handle-action";
import { remindersService } from "@/services";

export const useDeleteReminder = () => {
    const [isLoading, setIsLoading] = useState(false);

    const deleteHandler = async (id: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const ok = await runAction(async () => {
                await remindersService.deleteHandler(id);
                return true;
            }, {
                errorFallback: remindersConstants.errors.deleteFailed,
                successMessage: remindersConstants.messages.deleteSuccess,
                context: "reminders.delete",
            });
            return ok ?? false;
        } finally {
            setIsLoading(false);
        }
    };

    return { deleteHandler, isLoading };
};
