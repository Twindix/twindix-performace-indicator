import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { teamsConstants } from "@/constants";
import type { TeamInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { teamsService } from "@/services";

export const useGetTeams = () => {
    const [teams, setTeams] = useState<TeamInterface[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetch = useCallback(async () => {
        if (!navigator.onLine) {
            toast.error(teamsConstants.errors.genericError);
            return;
        }
        setIsLoading(true);
        try {
            const res = await teamsService.listHandler();
            setTeams(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, teamsConstants.errors.fetchFailed));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const patchTeamLocal = useCallback((team: TeamInterface) => {
        setTeams((prev) => {
            const exists = prev.some((t) => t.id === team.id);
            return exists ? prev.map((t) => t.id === team.id ? team : t) : [...prev, team];
        });
    }, []);

    return { teams, isLoading, refetch: fetch, patchTeamLocal };
};
