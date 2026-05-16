import { meetingsConstants } from "@/constants";
import type { MeetingDetailInterface } from "@/interfaces";
import { meetingsService } from "@/services";

import { useQueryAction } from "../shared";

export const useMeetingDetail = (meetingId: string) => {
    const { data, isLoading, refetch, setData } = useQueryAction<MeetingDetailInterface | null>(
        () => meetingsService.detailHandler(meetingId),
        [meetingId],
        {
            enabled: !!meetingId,
            errorFallback: meetingsConstants.errors.detailFailed,
            context: "meetings.detail",
            initialData: null,
        },
    );
    return { meeting: data ?? null, isLoading, refetch, setMeeting: setData };
};
