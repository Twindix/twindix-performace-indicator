import { Filter } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/atoms";
import { t } from "@/hooks";
import { cn } from "@/utils";

interface FiltersBarProps {
    children: ReactNode;
    count: number;
    countLabel: string;
    hasFilters: boolean;
    onClear: () => void;
    compact?: boolean;
    showIcon?: boolean;
}

export const FiltersBar = ({ children, count, countLabel, hasFilters, onClear, compact, showIcon }: FiltersBarProps) => (
    <Card className={cn(compact ? "mb-3" : "mb-6")}>
        <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
                {showIcon && <Filter className="h-4 w-4 text-text-muted hidden sm:block" />}
                {children}
                {hasFilters && (
                    <button onClick={onClear} className="text-xs text-text-muted hover:text-text-dark underline cursor-pointer">
                        {t("Clear filters")}
                    </button>
                )}
                <span className="ms-auto text-xs text-text-muted">{count} {countLabel}</span>
            </div>
        </CardContent>
    </Card>
);
