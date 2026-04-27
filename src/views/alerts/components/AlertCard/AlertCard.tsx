import { Card, CardContent } from "@/atoms";
import { alertsConstants } from "@/constants";
import type { AlertCardPropsInterface } from "@/interfaces";

import { AlertCardActionsPanel } from "./AlertCardActionsPanel";
import { AlertCardFooter } from "./AlertCardFooter";
import { AlertCardHeader } from "./AlertCardHeader";
import { AlertCardMentions } from "./AlertCardMentions";
import { AlertCardMeta } from "./AlertCardMeta";

export const AlertCard = ({ alert, permissions, busy, actions }: AlertCardPropsInterface) => {
    const isReviewTitle = alert.title === alertsConstants.titles.taskCompletionReviewRequired;

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <AlertCardHeader
                        type={alert.type}
                        title={alert.title}
                        body={alert.body}
                        sourceTask={alert.source_task}
                        onOpenTask={actions.onOpenTask}
                    />
                    <AlertCardActionsPanel
                        canEdit={permissions.edit}
                        canDelete={permissions.delete}
                        onEdit={actions.onEdit}
                        onDelete={actions.onDelete}
                    />
                </div>

                <AlertCardMeta
                    creator={alert.creator}
                    target={alert.target}
                    createdAt={alert.created_at}
                />

                <AlertCardMentions users={alert.mentioned_users} />

                <AlertCardFooter
                    isReviewTitle={isReviewTitle}
                    sourceTaskId={alert.source_task?.id ?? null}
                    counts={{ acknowledged: alert.acknowledgment_count, total: alert.total_targets }}
                    permissions={permissions}
                    busy={busy}
                    actions={{
                        onAcknowledge: actions.onAcknowledge,
                        onMarkDone: actions.onMarkDone,
                        onOpenTask: actions.onOpenTask,
                    }}
                />
            </CardContent>
        </Card>
    );
};
