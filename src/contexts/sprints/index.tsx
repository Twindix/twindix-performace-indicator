import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { sprintsConstants } from "@/constants/sprints";
import type { CreateSprintPayloadInterface, SprintInterface, SprintsContextInterface, UpdateSprintPayloadInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { sprintsService } from "@/services";

const SprintsContext = createContext<SprintsContextInterface | null>(null);

export const SprintsProvider = ({ children }: { children: ReactNode }) => {
    const [sprints, setSprints] = useState<SprintInterface[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const refetch = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        try {
            const res = await sprintsService.listHandler();
            setSprints(res.data);
        } catch (err) {
            toast.error(getErrorMessage(err, sprintsConstants.errors.fetchFailed));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { refetch(); }, [refetch]);

    const fetchSprintDetail = useCallback(async (id: string): Promise<SprintInterface | null> => {
        try {
            const res = await sprintsService.detailHandler(id);
            setSprints((prev) => prev.map((s) => s.id === id ? res.data : s));
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, sprintsConstants.errors.fetchDetailFailed));
            return null;
        }
    }, []);

    const createSprint = useCallback(async (payload: CreateSprintPayloadInterface): Promise<SprintInterface | null> => {
        try {
            const res = await sprintsService.createHandler(payload);
            setSprints((prev) => [...prev, res.data]);
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, sprintsConstants.errors.createFailed));
            return null;
        }
    }, []);

    const updateSprint = useCallback(async (id: string, payload: UpdateSprintPayloadInterface): Promise<SprintInterface | null> => {
        try {
            const res = await sprintsService.updateHandler(id, payload);
            setSprints((prev) => prev.map((s) => s.id === id ? res.data : s));
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, sprintsConstants.errors.updateFailed));
            return null;
        }
    }, []);

    const deleteSprint = useCallback(async (id: string): Promise<boolean> => {
        try {
            await sprintsService.deleteHandler(id);
            setSprints((prev) => prev.filter((s) => s.id !== id));
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, sprintsConstants.errors.deleteFailed));
            return false;
        }
    }, []);

    const activateSprint = useCallback(async (id: string): Promise<SprintInterface | null> => {
        try {
            const res = await sprintsService.activateHandler(id);
            setSprints((prev) => prev.map((s) => s.id === id ? res.data : s));
            return res.data;
        } catch (err) {
            toast.error(getErrorMessage(err, sprintsConstants.errors.activateFailed));
            return null;
        }
    }, []);

    const value = useMemo<SprintsContextInterface>(() => ({
        sprints,
        isLoading,
        refetch,
        fetchSprintDetail,
        createSprint,
        updateSprint,
        deleteSprint,
        activateSprint,
    }), [sprints, isLoading, refetch, fetchSprintDetail, createSprint, updateSprint, deleteSprint, activateSprint]);

    return <SprintsContext.Provider value={value}>{children}</SprintsContext.Provider>;
};

export const useSprints = (): SprintsContextInterface => {
    const ctx = useContext(SprintsContext);
    if (!ctx) throw new Error("useSprints must be used within SprintsProvider");
    return ctx;
};
