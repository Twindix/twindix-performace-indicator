import { Clock } from "lucide-react";

import { Input } from "@/atoms";
import { t } from "@/hooks";
import type { TransitionTimeInputPropsInterface } from "@/interfaces";

export const TransitionTimeInput = ({ hours, onHoursChange, note, onNoteChange }: TransitionTimeInputPropsInterface) => (
    <div className="mt-4 p-4 rounded-xl bg-muted border border-border space-y-3">
        <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-text-muted" />
            <p className="text-sm font-semibold text-text-dark">{t("Log Time Spent")}</p>
        </div>
        <p className="text-xs text-text-muted">{t("How many hours did you work on this phase?")}</p>
        <div className="flex gap-2">
            <Input
                type="number"
                min="0.5"
                step="0.5"
                placeholder={t("e.g. 4.5")}
                value={hours}
                onChange={(e) => onHoursChange(e.target.value)}
                className="w-28 bg-surface"
            />
            <Input
                placeholder={t("Note (optional)")}
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                className="flex-1 bg-surface"
            />
        </div>
    </div>
);
