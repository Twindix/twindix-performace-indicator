import { ShieldAlert } from "lucide-react";

import { Badge } from "@/atoms";
import { EmptyState } from "@/components/shared";
import { t } from "@/hooks";
import type { BlockersListPropsInterface } from "@/interfaces";
import { cn } from "@/utils";

import { BlockerCard } from "./BlockerCard";

export const BlockersList = ({ blockers, compact, onSelect }: BlockersListPropsInterface) => (
    <div>
        <div className={cn("flex flex-col", compact ? "gap-2" : "gap-4")}>
            <h2 className="text-lg font-semibold text-text-dark">
                {t("Blockers")}
                <Badge className="ms-2" variant="secondary">{blockers.length}</Badge>
            </h2>

            {blockers.length === 0 ? (
                <EmptyState icon={ShieldAlert} title={t("No blockers found")} description={t("No blockers match the current filters")} />
            ) : (
                blockers.map((blocker) => (
                    <BlockerCard
                        key={blocker.id}
                        blocker={blocker}
                        compact={compact}
                        onClick={() => onSelect(blocker)}
                    />
                ))
            )}
        </div>
    </div>
);
