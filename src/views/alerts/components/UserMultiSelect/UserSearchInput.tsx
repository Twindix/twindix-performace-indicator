import { Search } from "lucide-react";

import { Input } from "@/atoms";
import { t } from "@/hooks";
import type { UserSearchInputPropsInterface } from "@/interfaces";

export const UserSearchInput = ({ value, onChange }: UserSearchInputPropsInterface) => (
    <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t("Search users...")}
            className="pl-8 h-8 text-xs"
        />
    </div>
);
