import { t } from "@/hooks";
import type { SprintSelectorPropsInterface } from "@/interfaces";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";

export const SprintSelector = ({ sprints, value, onChange }: SprintSelectorPropsInterface) => (
    <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[140px] sm:w-[200px] h-9 text-xs sm:text-sm">
            <SelectValue placeholder={t("Select Sprint")} />
        </SelectTrigger>
        <SelectContent>
            {sprints.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                    <span className="flex items-center gap-1.5">
                        {s.status === "active" && (
                            <span className="h-2 w-2 rounded-full bg-success shrink-0" />
                        )}
                        {s.name}
                    </span>
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);
