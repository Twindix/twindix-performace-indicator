import type { AddUserFormStateInterface, CreateUserPayloadInterface } from "@/interfaces/users";

import { deriveInitials } from "./derive-initials";

export const buildCreateUserPayload = (form: AddUserFormStateInterface): CreateUserPayloadInterface => ({
    full_name:       form.full_name.trim(),
    email:           form.email.trim(),
    password:        form.password,
    role_label:      form.role_label.trim(),
    role_tier:       form.role_tier,
    team_id:         form.team_id,
    avatar_initials: deriveInitials(form.full_name, form.avatar_initials),
});
