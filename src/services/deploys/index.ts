import { apisData } from "@/data";
import type {
    DeployInterface,
    DeploysListFiltersInterface,
    DeploysListResponseInterface,
    UpdateDeployStatusPayloadInterface,
    UploadDeployPayloadInterface,
} from "@/interfaces";
import { apiClient } from "@/lib/axios";

const unwrap = <T,>(payload: unknown): T => {
    if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
        return (payload as { data: T }).data;
    }
    return payload as T;
};

const parseFilename = (contentDisposition: string | undefined, fallback: string): string => {
    if (!contentDisposition) return fallback;
    const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(contentDisposition);
    return match?.[1] ? decodeURIComponent(match[1]) : fallback;
};

export const deploysService = {
    listHandler: async (filters?: DeploysListFiltersInterface): Promise<DeploysListResponseInterface> => {
        const { data } = await apiClient.get<DeploysListResponseInterface>(apisData.deploys.list, { params: filters });
        return data;
    },

    detailHandler: async (id: string): Promise<DeployInterface> => {
        const { data } = await apiClient.get(apisData.deploys.detail(id));
        return unwrap<DeployInterface>(data);
    },

    createHandler: async (payload: UploadDeployPayloadInterface): Promise<DeployInterface> => {
        const form = new FormData();
        form.append("file", payload.file);
        form.append("title", payload.title);
        form.append("environment", payload.environment);
        if (payload.version) form.append("version", payload.version);
        if (payload.project_id) form.append("project_id", payload.project_id);
        payload.changes.forEach((c, i) => form.append(`changes[${i}]`, c));
        const { data } = await apiClient.post(apisData.deploys.create, form, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return unwrap<DeployInterface>(data);
    },

    downloadHandler: async (id: string, fallbackFilename: string): Promise<{ blob: Blob; filename: string }> => {
        const res = await apiClient.get(apisData.deploys.download(id), { responseType: "blob" });
        const filename = parseFilename(res.headers?.["content-disposition"], fallbackFilename);
        return { blob: res.data as Blob, filename };
    },

    updateStatusHandler: async (id: string, payload: UpdateDeployStatusPayloadInterface): Promise<DeployInterface> => {
        const { data } = await apiClient.patch(apisData.deploys.updateStatus(id), payload);
        return unwrap<DeployInterface>(data);
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.deploys.delete(id));
    },
};
