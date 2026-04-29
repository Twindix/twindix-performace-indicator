import { Check } from "lucide-react";

import { t } from "@/hooks";
import type { UserOptionListPropsInterface } from "@/interfaces";
import { Avatar, AvatarFallback } from "@/ui";

export const UserOptionList = ({ users, selected, onToggle }: UserOptionListPropsInterface) => (
    <div className="max-h-44 overflow-y-auto border border-border rounded-lg divide-y divide-border">
        {users.length === 0 ? (
            <p className="text-xs text-text-muted p-3 text-center">{t("No users found")}</p>
        ) : (
            users.map((u) => {
                const isSelected = selected.includes(u.id);
                return (
                    <button
                        key={u.id}
                        type="button"
                        onClick={() => onToggle(u.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted transition-colors cursor-pointer ${isSelected ? "bg-primary/5" : ""}`}
                    >
                        <Avatar className="h-6 w-6 shrink-0">
                            <AvatarFallback className="text-[9px]">{u.avatar_initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs flex-1 text-text-dark">{u.full_name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </button>
                );
            })
        )}
    </div>
);
