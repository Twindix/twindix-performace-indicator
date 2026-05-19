import { useState } from "react";

import { meetingsConstants } from "@/constants";
import { runAction } from "@/lib/handle-action";
import { meetingsService } from "@/services";
import type { MeetingDetailInterface, UpdateMeetingPayloadInterface } from "@/interfaces";

export const useUpdateMeeting = () => {
    const [isLoading, setIsLoading] = useState(false);

    const updateHandler = async (meetingId: string, payload: UpdateMeetingPayloadInterface): Promise<MeetingDetailInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(
                () => meetingsService.updateHandler(meetingId, payload),
                {
                    errorFallback: meetingsConstants.errors.updateFailed ?? "Failed to update meeting",
                    successMessage: meetingsConstants.messages.updateSuccess ?? "Meeting updated",
                    context: "meetings.update",
                },
            ) ?? null;
        } finally {
            setIsLoading(false);
        }
    };

    return { updateHandler, isLoading };
};
