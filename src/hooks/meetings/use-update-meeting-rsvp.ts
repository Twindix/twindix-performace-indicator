import { useState } from "react";

import { meetingsConstants } from "@/constants";
import type { MeetingDetailInterface, RsvpStatus } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { meetingsService } from "@/services";

export const useUpdateMeetingRsvp = () => {
    const [isLoading, setIsLoading] = useState(false);

    const updateRsvpHandler = async (meetingId: string, userId: string, rsvpStatus: RsvpStatus): Promise<MeetingDetailInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => meetingsService.updateRsvpHandler(meetingId, userId, { rsvp_status: rsvpStatus }), {
                errorFallback: meetingsConstants.errors.rsvpFailed,
                successMessage: meetingsConstants.messages.rsvpSuccess,
                context: "meetings.rsvp",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { updateRsvpHandler, isLoading };
};
