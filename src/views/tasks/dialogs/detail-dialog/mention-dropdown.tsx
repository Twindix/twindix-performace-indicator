import type { MentionDropdownPropsInterface } from "@/interfaces";
import { Avatar, AvatarFallback } from "@/ui";

export const MentionDropdown = ({ members, activeIndex, onSelect }: MentionDropdownPropsInterface) => (
    <div className="absolute bottom-full mb-1 left-0 right-0 bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden">
        {members.map((m, i) => (
            <button
                key={m.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); onSelect(m); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors cursor-pointer ${i === activeIndex ? "bg-primary-lighter" : "hover:bg-muted"}`}
            >
                <Avatar className="h-6 w-6 shrink-0">
                    <AvatarFallback className="text-[8px]">{m.avatar_initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className={`text-xs font-medium truncate ${i === activeIndex ? "text-primary" : "text-text-dark"}`}>
                        {m.full_name}
                    </p>
                    {m.role_label && <p className="text-[10px] text-text-muted truncate">{m.role_label}</p>}
                </div>
            </button>
        ))}
    </div>
);
