import { ShieldAlert } from "lucide-react";

import { Badge } from "@/atoms";
import { EntityCard } from "@/components/shared";
import { EmptyState } from "@/components/shared";
import { t } from "@/hooks";
import type { BlockersListPropsInterface } from "@/interfaces";
import { cn } from "@/utils";

import { BlockerHeader } from "./BlockerHeader";
import { BlockerMeta } from "./BlockerMeta";

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
                    <EntityCard
                        key={blocker.id}
                        className="overflow-hidden cursor-pointer"
                        contentClassName={compact ? "p-3" : "p-5"}
                        onClick={() => onSelect(blocker)}
                    >
                        <BlockerHeader
                            type={blocker.type}
                            title={blocker.title}
                            description={blocker.description}
                            status={blocker.status}
                            severity={blocker.severity}
                        />
                        <BlockerMeta
                            reporter={blocker.reporter}
                            owner={blocker.owner}
                            durationDays={blocker.duration_days}
                            createdAt={blocker.created_at}
                            tasksAffected={blocker.tasks_affected}
                        />
                    </EntityCard>
                ))
            )}
        </div>
    </div>
);
