import { Input, Label } from "@/atoms";
import { usersConstants } from "@/constants";
import { t } from "@/hooks";
import type { AddUserFormFieldsPropsInterface } from "@/interfaces/users";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";

const ROLE_TIERS = usersConstants.roleTiers;
const ROLE_TIER_LABELS = usersConstants.roleTierLabels;

export const AddUserFormFields = ({ form, errors, teams, onChange }: AddUserFormFieldsPropsInterface) => (
    <div className="flex flex-col gap-4 py-2">
        <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="u-name">{t("Full Name")}</Label>
                <Input
                    id="u-name"
                    value={form.full_name}
                    onChange={(e) => onChange("full_name", e.target.value)}
                    placeholder="John Doe"
                    className={errors.full_name ? "border-error" : ""}
                />
                {errors.full_name && <p className="text-xs text-error">{errors.full_name}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="u-email">{t("Email")}</Label>
                <Input
                    id="u-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => onChange("email", e.target.value)}
                    placeholder="john@company.com"
                    className={errors.email ? "border-error" : ""}
                />
                {errors.email && <p className="text-xs text-error">{errors.email}</p>}
            </div>
        </div>

        <div className="flex flex-col gap-1.5">
            <Label htmlFor="u-password">{t("Password")}</Label>
            <Input
                id="u-password"
                type="password"
                value={form.password}
                onChange={(e) => onChange("password", e.target.value)}
                placeholder="••••••••"
                className={errors.password ? "border-error" : ""}
            />
            {errors.password && <p className="text-xs text-error">{errors.password}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="u-role-label">{t("Role Title")}</Label>
                <Input
                    id="u-role-label"
                    value={form.role_label}
                    onChange={(e) => onChange("role_label", e.target.value)}
                    placeholder="Frontend Engineer"
                    className={errors.role_label ? "border-error" : ""}
                />
                {errors.role_label && <p className="text-xs text-error">{errors.role_label}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
                <Label>{t("Role Tier")}</Label>
                <Select value={form.role_tier} onValueChange={(v) => onChange("role_tier", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {ROLE_TIERS.map((r) => <SelectItem key={r} value={r}>{t(ROLE_TIER_LABELS[r])}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
                <Label>{t("Team")}</Label>
                <Select value={form.team_id} onValueChange={(v) => onChange("team_id", v)}>
                    <SelectTrigger className={errors.team_id ? "border-error" : ""}>
                        <SelectValue placeholder={t("Select team")} />
                    </SelectTrigger>
                    <SelectContent>
                        {teams.map((tm) => <SelectItem key={tm.id} value={tm.id}>{tm.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                {errors.team_id && <p className="text-xs text-error">{errors.team_id}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="u-avatar">
                    {t("Avatar Initials")} <span className="text-text-muted text-xs">({t("optional")})</span>
                </Label>
                <Input
                    id="u-avatar"
                    value={form.avatar_initials}
                    onChange={(e) => onChange("avatar_initials", e.target.value.toUpperCase().slice(0, 2))}
                    placeholder="JD"
                    maxLength={2}
                />
            </div>
        </div>
    </div>
);
