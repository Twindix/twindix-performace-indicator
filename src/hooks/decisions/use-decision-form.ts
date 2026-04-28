import { useCallback, useState } from "react";

import { decisionsConstants } from "@/constants";
import type { DecisionFormErrorsInterface, DecisionFormStateInterface, UseDecisionFormReturnInterface } from "@/interfaces/decisions";
import { buildDecisionPayload, validateDecisionForm } from "@/lib/decisions";
import { useSprintStore } from "@/store";

import { useCreateDecision } from "./use-create-decision";

export const useDecisionForm = (): UseDecisionFormReturnInterface => {
    const { activeSprintId } = useSprintStore();
    const { createHandler, isLoading: isSubmitting } = useCreateDecision();

    const [form, setForm] = useState<DecisionFormStateInterface>({ ...decisionsConstants.emptyForm });
    const [errors, setErrors] = useState<DecisionFormErrorsInterface>({});

    const setField = useCallback(<K extends keyof DecisionFormStateInterface>(field: K, value: DecisionFormStateInterface[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => {
            if (!(field in prev)) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    const reset = useCallback(() => {
        setForm({ ...decisionsConstants.emptyForm });
        setErrors({});
    }, []);

    const submit = useCallback(async () => {
        const validation = validateDecisionForm(form);
        if (Object.keys(validation).length) {
            setErrors(validation);
            return null;
        }
        if (!activeSprintId) return null;
        return createHandler(activeSprintId, buildDecisionPayload(form));
    }, [form, activeSprintId, createHandler]);

    return { form, errors, isSubmitting, setField, reset, submit };
};
