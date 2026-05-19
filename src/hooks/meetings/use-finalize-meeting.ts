import { useState } from "react";

import { meetingsConstants } from "@/constants";
import type { MeetingDetailInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { meetingsService } from "@/services";

export const useFinalizeMeeting = () => {
    const [isLoading, setIsLoading] = useState(false);

    const selectSlotHandler = async (meetingId: string, slotId: string): Promise<MeetingDetailInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => meetingsService.selectSlotHandler(meetingId, slotId), {
                errorFallback: meetingsConstants.errors.finalizeFailed,
                successMessage: meetingsConstants.messages.finalizeSuccess,
                context: "meetings.selectSlot",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { selectSlotHandler, isLoading };
};
