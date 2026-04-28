import type { CreateRedFlagPayloadInterface, RedFlagFormStateInterface } from "@/interfaces/red-flags";

export const buildRedFlagPayload = (form: RedFlagFormStateInterface): CreateRedFlagPayloadInterface => {
    const description = form.description.trim();
    return {
        title:       form.title.trim(),
        description: description || undefined,
        severity:    form.severity,
    };
};
