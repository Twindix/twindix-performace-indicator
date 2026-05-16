import { useState } from "react";

import { meetingsConstants } from "@/constants";
import type { ApiMeetingTimeSlotInterface, CreateMeetingTimeSlotPayloadInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { meetingsService } from "@/services";

export const useAddMeetingSlot = () => {
    const [isLoading, setIsLoading] = useState(false);

    const addHandler = async (meetingId: string, payload: CreateMeetingTimeSlotPayloadInterface): Promise<ApiMeetingTimeSlotInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => meetingsService.addSlotHandler(meetingId, payload), {
                errorFallback: meetingsConstants.errors.updateFailed,
                context: "meetings.slot.add",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { addHandler, isLoading };
};

export const useRemoveMeetingSlot = () => {
    const [isLoading, setIsLoading] = useState(false);

    const removeHandler = async (meetingId: string, slotId: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const ok = await runAction(async () => {
                await meetingsService.removeSlotHandler(meetingId, slotId);
                return true;
            }, {
                errorFallback: meetingsConstants.errors.updateFailed,
                context: "meetings.slot.remove",
            });
            return ok ?? false;
        } finally {
            setIsLoading(false);
        }
    };

    return { removeHandler, isLoading };
};
