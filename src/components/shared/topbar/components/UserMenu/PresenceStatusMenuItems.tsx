import { authConstants } from "@/constants";
import { t } from "@/hooks";
import type { PresenceStatus } from "@/interfaces";
import type { PresenceStatusMenuItemsPropsInterface } from "@/interfaces";
import { DropdownMenuItem } from "@/ui";

const presenceOptions: PresenceStatus[] = ["active", "offline"];

export const PresenceStatusMenuItems = ({
    visible,
    currentStatus,
    onChange,
}: PresenceStatusMenuItemsPropsInterface) => {
    if (!visible) return null;

    return (
        <>
            {presenceOptions.map((s) => {
                const config = authConstants.presence[s];
                return (
                    <DropdownMenuItem key={s} onClick={() => onChange(s)} className="gap-2 cursor-pointer">
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${config.dot}`} />
                        {t(config.label)}
                        {currentStatus === s && <span className="ms-auto text-[10px] text-text-muted">✓</span>}
                    </DropdownMenuItem>
                );
            })}
        </>
    );
};
