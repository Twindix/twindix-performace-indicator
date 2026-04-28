import { Plus } from "lucide-react";

import { Badge, Button } from "@/atoms";
import { PageHeader } from "@/components/shared";
import { t } from "@/hooks";
import type { TasksHeaderPropsInterface } from "@/interfaces";

export const TasksHeader = ({ actions }: TasksHeaderPropsInterface) => (
    <PageHeader
        title={t("Task Management")}
        description={t("Use the task detail dialog to move tasks between phases.")}
    >
        <PageHeader.Actions>
            {!actions.hasFiltersOrTasks ? (
                actions.canCreate ? (
                    <Button size="sm" className="gap-1.5" onClick={actions.onCreate}>
                        <Plus className="h-4 w-4" />
                        {t("Add Task")}
                    </Button>
                ) : null
            ) : (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <span><strong className="text-text-dark">{actions.stats.total}</strong> {t("tasks")}</span>
                    <span className="text-border">|</span>
                    <span><strong className="text-text-dark">{actions.stats.donePoints}</strong>/{actions.stats.totalPoints} {t("pts")}</span>
                    {actions.stats.blocked > 0 && (
                        <>
                            <span className="text-border">|</span>
                            <Badge variant="error">{actions.stats.blocked} {t("blocked")}</Badge>
                        </>
                    )}
                </div>
            )}
        </PageHeader.Actions>
    </PageHeader>
);
