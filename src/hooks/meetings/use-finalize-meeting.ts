import { useState } from "react";

import { meetingsConstants } from "@/constants";
import type { MeetingDetailInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { meetingsService } from "@/services";

export const useFinalizeMeeting = () => {
    const [isLoading, setIsLoading] = useState(false);

    const finalizeHandler = async (meetingId: string): Promise<MeetingDetailInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => meetingsService.finalizeHandler(meetingId), {
                errorFallback: meetingsConstants.errors.finalizeFailed,
                successMessage: meetingsConstants.messages.finalizeSuccess,
                context: "meetings.finalize",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { finalizeHandler, isLoading };
};
