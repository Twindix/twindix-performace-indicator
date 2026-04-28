import type { AlertCardMentionsPropsInterface } from "@/interfaces";
import { Avatar, AvatarFallback } from "@/ui";

export const AlertMentions = ({ users }: AlertCardMentionsPropsInterface) => {
    if (users.length === 0) return null;

    return (
        <div className="mt-2 flex flex-wrap gap-1.5">
            {users.map((u) => (
                <span
                    key={u.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs text-text-dark"
                >
                    <Avatar className="h-4 w-4">
                        <AvatarFallback className="text-[8px]">{u.avatar_initials}</AvatarFallback>
                    </Avatar>
                    {u.full_name}
                </span>
            ))}
        </div>
    );
};
