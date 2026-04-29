import { authConstants } from "@/constants";
import { t } from "@/hooks";
import type { UserMenuTriggerPropsInterface } from "@/interfaces";
import { Avatar, AvatarFallback } from "@/ui";

export const UserMenuTrigger = ({ user, presenceStatus }: UserMenuTriggerPropsInterface) => {
    const presence = authConstants.presence[presenceStatus];

    return (
        <button className="flex items-center gap-2 rounded-full p-1 pe-3 hover:bg-accent transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="relative">
                <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-[10px]">{user?.avatar_initials}</AvatarFallback>
                </Avatar>
                <span className={`absolute bottom-0 end-0 h-2.5 w-2.5 rounded-full border-2 border-surface ${presence.dot}`} />
            </div>
            <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-text-dark leading-tight">{user?.full_name}</span>
                <span className="text-[10px] text-text-muted leading-tight flex items-center gap-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${presence.dot}`} />
                    {t(presence.label)}
                </span>
            </div>
        </button>
    );
};
