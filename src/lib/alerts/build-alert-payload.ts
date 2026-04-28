import { alertsConstants } from "@/constants";
import type { AlertFormStateInterface, CreateAlertPayloadInterface } from "@/interfaces";

export const buildAlertPayload = (form: AlertFormStateInterface): CreateAlertPayloadInterface => ({
    title: form.title.trim(),
    body: form.body.trim() || undefined,
    target: form.mentioned_user_ids.length > 0 ? alertsConstants.targets.specific : alertsConstants.targets.all,
    mentioned_user_ids: form.mentioned_user_ids.length > 0 ? form.mentioned_user_ids : undefined,
});
