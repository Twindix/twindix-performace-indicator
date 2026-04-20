import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { sprintsConstants } from "@/constants";
import type { SprintInterface } from "@/interfaces";
import { getErrorMessage } from "@/lib/error";
import { sprintsService } from "@/services";

export const useSprintsList = () => {
    const [sprints, setSprints] = useState<SprintInterface[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetch = useCallback(async () => {
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

    useEffect(() => { fetch(); }, [fetch]);

    const patchSprintLocal = useCallback((sprint: SprintInterface) => {
        setSprints((prev) => {
            const exists = prev.some((s) => s.id === sprint.id);
            return exists ? prev.map((s) => s.id === sprint.id ? sprint : s) : [...prev, sprint];
        });
    }, []);

    const removeSprintLocal = useCallback((id: string) => {
        setSprints((prev) => prev.filter((s) => s.id !== id));
    }, []);

    return { sprints, isLoading, refetch: fetch, patchSprintLocal, removeSprintLocal };
};
