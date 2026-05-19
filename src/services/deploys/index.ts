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

const normalizeDeploy = (raw: any): DeployInterface => ({
    id: raw.id,
    project_id: raw.project_id ?? raw.project?.id ?? null,
    title: raw.title,
    version: raw.version ?? null,
    file_name: raw.file_name,
    file_size: raw.file_size,
    file_type: raw.file_type,
    changes: Array.isArray(raw.changes) ? raw.changes : (raw.changes ? String(raw.changes).split("\n").filter(Boolean) : []),
    environment: raw.environment,
    status: raw.status,
    uploaded_by: raw.uploader
        ? { id: raw.uploader.id, full_name: raw.uploader.full_name ?? "", avatar_initials: raw.uploader.avatar_initials ?? "", role_label: raw.uploader.role_label ?? null }
        : (typeof raw.uploaded_by === "object" && raw.uploaded_by ? raw.uploaded_by : { id: raw.uploaded_by ?? "", full_name: "", avatar_initials: "", role_label: null }),
    uploaded_at: raw.uploaded_at,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
});

export const deploysService = {
    listHandler: async (filters?: DeploysListFiltersInterface): Promise<DeploysListResponseInterface> => {
        const { data } = await apiClient.get<any>(apisData.deploys.list, { params: filters });
        const meta = data.meta ?? {
            current_page: data.current_page ?? 1,
            last_page: data.last_page ?? 1,
            per_page: data.per_page ?? 20,
            total: data.total ?? 0,
            from: data.from ?? null,
            to: data.to ?? null,
        };
        return { ...data, data: (data.data ?? []).map(normalizeDeploy), meta };
    },

    detailHandler: async (id: string): Promise<DeployInterface> => {
        const { data } = await apiClient.get(apisData.deploys.detail(id));
        return normalizeDeploy(unwrap<any>(data));
    },

    createHandler: async (payload: UploadDeployPayloadInterface): Promise<DeployInterface> => {
        const form = new FormData();
        form.append("file", payload.file);
        form.append("title", payload.title);
        if (payload.environment) form.append("environment", payload.environment);
        if (payload.version) form.append("version", payload.version);
        if (payload.project_id) form.append("project_id", payload.project_id);
        if (payload.changes.length > 0) form.append("changes", payload.changes.join("\n"));
        const { data } = await apiClient.post(apisData.deploys.create, form, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return normalizeDeploy(unwrap<any>(data));
    },

    downloadHandler: async (id: string, fallbackFilename: string): Promise<{ blob: Blob; filename: string }> => {
        const res = await apiClient.get(apisData.deploys.download(id), { responseType: "blob" });
        const filename = parseFilename(res.headers?.["content-disposition"], fallbackFilename);
        return { blob: res.data as Blob, filename };
    },

    updateStatusHandler: async (id: string, payload: UpdateDeployStatusPayloadInterface): Promise<DeployInterface> => {
        const { data } = await apiClient.patch(apisData.deploys.updateStatus(id), payload);
        return normalizeDeploy(unwrap<any>(data));
    },

    deleteHandler: async (id: string): Promise<void> => {
        await apiClient.delete(apisData.deploys.delete(id));
    },
};
