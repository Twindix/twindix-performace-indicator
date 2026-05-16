import { useCallback } from "react";

import { deploysConstants } from "@/constants";
import type { DeployInterface, DeploysListFiltersInterface } from "@/interfaces";
import { deploysService } from "@/services";

import { usePaginatedQuery } from "../shared";

export const useDeploysList = (filters?: DeploysListFiltersInterface) => {
    const { environment, status, uploaded_by, search, project_id } = filters ?? {};
    const { items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, setItems } = usePaginatedQuery<DeployInterface>(
        ({ page, per_page }) => deploysService.listHandler({ environment, status, uploaded_by, search, project_id, page, per_page }),
        [environment, status, uploaded_by, search, project_id],
        {
            errorFallback: deploysConstants.errors.fetchFailed,
            context: "deploys.list",
        },
    );

    const prependDeployLocal = useCallback((deploy: DeployInterface) => {
        setItems((prev) => [deploy, ...prev]);
    }, [setItems]);

    const patchDeployLocal = useCallback((deploy: DeployInterface) => {
        setItems((prev) => prev.map((d) => (d.id === deploy.id ? deploy : d)));
    }, [setItems]);

    const removeDeployLocal = useCallback((id: string) => {
        setItems((prev) => prev.filter((d) => d.id !== id));
    }, [setItems]);

    return { items, meta, page, perPage, isLoading, setPage, setPerPage, refetch, prependDeployLocal, patchDeployLocal, removeDeployLocal };
};
