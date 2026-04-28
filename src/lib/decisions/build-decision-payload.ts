import { DecisionStatus } from "@/enums";
import type { CreateDecisionPayloadInterface, DecisionFormStateInterface } from "@/interfaces/decisions";

export const buildDecisionPayload = (form: DecisionFormStateInterface): CreateDecisionPayloadInterface => ({
    title:       form.title.trim(),
    description: form.description.trim(),
    category:    form.category,
    status:      DecisionStatus.Pending,
});
