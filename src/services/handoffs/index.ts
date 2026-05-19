import { apisData } from "@/data";
import type {
    CreateHandoffCriteriaPayloadInterface,
    HandoffCheckPayloadInterface,
    HandoffCriteriaSeedInterface,
    HandoffStatusResponseInterface,
    UpdateHandoffCriteriaPayloadInterface,
} from "@/interfaces";
import { apiClient } from "@/lib/axios";

const unwrap = <T,>(payload: unknown): T => {
    if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
        return (payload as { data: T }).data;
    }
    return payload as T;
};

const normalizeCriteria = (raw: any): HandoffCriteriaSeedInterface => ({
    id: raw.id,
    project_id: raw.project_id,
    from_phase: raw.from_phase,
    to_phase: raw.to_phase,
    title: raw.title,
    description: raw.description ?? null,
    is_required: raw.is_required,
    is_checked: Array.isArray(raw.checks) ? raw.checks.length > 0 : (raw.is_checked ?? false),
    created_at: raw.created_at,
    updated_at: raw.updated_at,
});

export const handoffsService = {
    sprintStatusHandler: async (projectId: string, sprintId: string): Promise<HandoffStatusResponseInterface> => {
        if (!projectId || !sprintId) {
            throw new Error('Project ID and Sprint ID are required');
        }
        const { data } = await apiClient.get<{ data: any }>(
            apisData.handoffs.sprintStatus(projectId, sprintId),
        );
        const raw = data.data;
        return {
            total_criteria: raw.total_criteria,
            required_criteria: raw.required_criteria,
            checked_count: raw.checked_count,
            required_checked_count: raw.required_checked_count,
            ready_for_handoff: raw.ready_for_handoff,
            criteria: (raw.criteria ?? []).map(normalizeCriteria),
        };
    },

    criteriaListHandler: async (projectId: string): Promise<HandoffCriteriaSeedInterface[]> => {
        if (!projectId) {
            throw new Error('Project ID is required');
        }
        const { data } = await apiClient.get<any>(apisData.handoffs.criteriaList(projectId));
        const items = Array.isArray(data) ? data : (data.data ?? []);
        return items.map(normalizeCriteria);
    },

    criteriaCreateHandler: async (projectId: string, payload: CreateHandoffCriteriaPayloadInterface): Promise<HandoffCriteriaSeedInterface> => {
        if (!projectId) {
            throw new Error('Project ID is required');
        }
        const { data } = await apiClient.post(apisData.handoffs.criteriaCreate(projectId), payload);
        return unwrap<HandoffCriteriaSeedInterface>(data);
    },

    criteriaUpdateHandler: async (id: string, payload: UpdateHandoffCriteriaPayloadInterface): Promise<HandoffCriteriaSeedInterface> => {
        if (!id) {
            throw new Error('Criteria ID is required');
        }
        const { data } = await apiClient.put(apisData.handoffs.criteriaUpdate(id), payload);
        return unwrap<HandoffCriteriaSeedInterface>(data);
    },

    criteriaDeleteHandler: async (id: string): Promise<void> => {
        if (!id) {
            throw new Error('Criteria ID is required');
        }
        await apiClient.delete(apisData.handoffs.criteriaDelete(id));
    },

    checkHandler: async (criteriaId: string, sprintId: string): Promise<void> => {
        if (!criteriaId || !sprintId) {
            throw new Error('Criteria ID and Sprint ID are required');
        }
        const payload: HandoffCheckPayloadInterface = { sprint_id: sprintId };
        await apiClient.post(apisData.handoffs.check(criteriaId), payload);
    },

    uncheckHandler: async (criteriaId: string, sprintId: string): Promise<void> => {
        if (!criteriaId || !sprintId) {
            throw new Error('Criteria ID and Sprint ID are required');
        }
        await apiClient.delete(apisData.handoffs.uncheck(criteriaId, sprintId));
    },
};
