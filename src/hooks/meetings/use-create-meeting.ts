import { useState } from "react";

import { meetingsConstants } from "@/constants";
import type { CreateMeetingPayloadInterface, MeetingDetailInterface } from "@/interfaces";
import { runAction } from "@/lib/handle-action";
import { meetingsService } from "@/services";

export const useCreateMeeting = (projectId: string, options?: { onFieldErrors?: (errors: Record<string, string[]>) => void }) => {
    const [isLoading, setIsLoading] = useState(false);

    const createHandler = async (payload: CreateMeetingPayloadInterface): Promise<MeetingDetailInterface | null> => {
        setIsLoading(true);
        try {
            return await runAction(() => meetingsService.createHandler(projectId, payload), {
                errorFallback: meetingsConstants.errors.createFailed,
                successMessage: meetingsConstants.messages.createSuccess,
                onFieldErrors: options?.onFieldErrors,
                context: "meetings.create",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { createHandler, isLoading };
};
