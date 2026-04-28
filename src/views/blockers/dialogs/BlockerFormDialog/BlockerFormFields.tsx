import { Input, Label, Textarea } from "@/atoms";
import { blockersConstants } from "@/constants";
import { t } from "@/hooks";
import type { BlockerFormFieldsPropsInterface } from "@/interfaces";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";

export const BlockerFormFields = ({ value, onChange, users }: BlockerFormFieldsPropsInterface) => (
    <div className="space-y-4 mt-3">
        <div className="space-y-2">
            <Label htmlFor="b-title">{t("Title")} <span className="text-error">*</span></Label>
            <Input
                id="b-title"
                value={value.title}
                onChange={(e) => onChange({ ...value, title: e.target.value })}
                placeholder={t("Short summary")}
            />
        </div>

        <div className="space-y-2">
            <Label htmlFor="b-description">{t("Description")}</Label>
            <Textarea
                id="b-description"
                rows={3}
                value={value.description}
                onChange={(e) => onChange({ ...value, description: e.target.value })}
                placeholder={t("Details...")}
            />
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
                <Label>{t("Type")} <span className="text-error">*</span></Label>
                <Select value={value.type} onValueChange={(v) => onChange({ ...value, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {blockersConstants.typeOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{t(o.label)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>{t("Severity")} <span className="text-error">*</span></Label>
                <Select value={value.severity} onValueChange={(v) => onChange({ ...value, severity: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {blockersConstants.severityOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{t(o.label)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="space-y-2">
            <Label>{t("Owned By")} <span className="text-error">*</span></Label>
            <Select value={value.ownedBy} onValueChange={(v) => onChange({ ...value, ownedBy: v })}>
                <SelectTrigger><SelectValue placeholder={t("Select owner")} /></SelectTrigger>
                <SelectContent>
                    {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    </div>
);
