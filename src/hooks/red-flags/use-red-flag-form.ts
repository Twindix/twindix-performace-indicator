import { useCallback, useEffect, useState } from "react";

import { redFlagsConstants } from "@/constants";
import type { RedFlagFormStateInterface, RedFlagInterface, RedFlagSeverity, UseRedFlagFormReturnInterface } from "@/interfaces/red-flags";
import { buildRedFlagPayload } from "@/lib/red-flags";
import { useSprintStore } from "@/store";

import { useCreateRedFlag } from "./use-create-red-flag";
import { useUpdateRedFlag } from "./use-update-red-flag";

const seedForm = (target: RedFlagInterface | null): RedFlagFormStateInterface => {
    if (!target) return { ...redFlagsConstants.emptyForm };
    return {
        title:       target.title,
        description: target.description ?? "",
        severity:    target.severity as RedFlagSeverity,
    };
};

export const useRedFlagForm = (target: RedFlagInterface | null): UseRedFlagFormReturnInterface => {
    const { activeSprintId } = useSprintStore();
    const { createHandler, isLoading: isCreating } = useCreateRedFlag();
    const { updateHandler, isLoading: isUpdating } = useUpdateRedFlag();

    const [form, setForm] = useState<RedFlagFormStateInterface>(() => seedForm(target));

    useEffect(() => {
        setForm(seedForm(target));
    }, [target]);

    const setField = useCallback(<K extends keyof RedFlagFormStateInterface>(field: K, value: RedFlagFormStateInterface[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const reset = useCallback(() => {
        setForm({ ...redFlagsConstants.emptyForm });
    }, []);

    const submit = useCallback(async () => {
        if (!form.title.trim()) return null;
        const payload = buildRedFlagPayload(form);

        if (target) {
            return updateHandler(target.id, payload);
        }
        if (!activeSprintId) return null;
        return createHandler(activeSprintId, payload);
    }, [form, target, activeSprintId, createHandler, updateHandler]);

    return { form, isSubmitting: isCreating || isUpdating, setField, reset, submit };
};
