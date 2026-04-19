import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { teamsConstants } from "@/constants/teams";
import type { TeamInterface, TeamsContextInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { teamsService } from "@/services";

const TeamsContext = createContext<TeamsContextInterface | null>(null);

export const TeamsProvider = ({ children }: { children: ReactNode }) => {
    const [teams, setTeams] = useState<TeamInterface[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const refetch = useCallback(async (): Promise<void> => {
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

    useEffect(() => { refetch(); }, [refetch]);

    const patchTeamLocal = useCallback((team: TeamInterface) => {
        setTeams((prev) => {
            const exists = prev.some((t) => t.id === team.id);
            return exists ? prev.map((t) => t.id === team.id ? team : t) : [...prev, team];
        });
    }, []);

    const value = useMemo<TeamsContextInterface>(() => ({
        teams,
        isLoading,
        refetch,
        patchTeamLocal,
    }), [teams, isLoading, refetch, patchTeamLocal]);

    return <TeamsContext.Provider value={value}>{children}</TeamsContext.Provider>;
};

export const useTeams = (): TeamsContextInterface => {
    const ctx = useContext(TeamsContext);
    if (!ctx) throw new Error("useTeams must be used within TeamsProvider");
    return ctx;
};
