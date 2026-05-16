import { useState } from "react";

import { meetingsConstants } from "@/constants";
import { runAction } from "@/lib/handle-action";
import { meetingsService } from "@/services";

export const useDeleteMeeting = () => {
    const [isLoading, setIsLoading] = useState(false);

    const deleteHandler = async (meetingId: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const ok = await runAction(async () => {
                await meetingsService.deleteHandler(meetingId);
                return true;
            }, {
                errorFallback: meetingsConstants.errors.deleteFailed,
                successMessage: meetingsConstants.messages.deleteSuccess,
                context: "meetings.delete",
            });
            return ok ?? false;
        } finally {
            setIsLoading(false);
        }
    };

    return { deleteHandler, isLoading };
};
