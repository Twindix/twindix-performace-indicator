import { useState } from "react";

import { meetingsConstants } from "@/constants";
import type { MeetingDetailInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { meetingsService } from "@/services";

export const useVoteMeetingSlot = () => {
    const [isLoading, setIsLoading] = useState(false);

    const voteHandler = async (meetingId: string, slotId: string): Promise<MeetingDetailInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => meetingsService.voteHandler(meetingId, slotId), {
                errorFallback: meetingsConstants.errors.voteFailed,
                context: "meetings.vote",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { voteHandler, isLoading };
};
