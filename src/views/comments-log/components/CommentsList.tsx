import { MessageCircle } from "lucide-react";

import { EntityCard } from "@/components/shared";
import { EmptyState } from "@/components/shared";
import { t } from "@/hooks";
import type { CommentsListPropsInterface } from "@/interfaces";

import { CommentBody } from "./CommentBody";
import { CommentHeader } from "./CommentHeader";
import { CommentMeta } from "./CommentMeta";

export const CommentsList = ({ comments, permissions, callbacks }: CommentsListPropsInterface) => {
    if (comments.length === 0) {
        return <EmptyState icon={MessageCircle} title={t("No Results")} description={t("No comments match the selected filters")} />;
    }
    return (
        <div className="flex flex-col gap-3">
            {comments.map((comment) => (
                <EntityCard key={comment.id}>
                    <CommentHeader
                        taskTitle={comment.task_title}
                        hasResponse={!!comment.responded_at}
                        actions={{
                            canRespond: permissions.canRespond(comment),
                            canEdit: permissions.canEdit(comment),
                            canDelete: permissions.canDelete(comment),
                            onRespond: () => callbacks.onRespond(comment.id),
                            onEdit: () => callbacks.onEdit(comment),
                            onDelete: () => callbacks.onDelete(comment),
                        }}
                    />
                    <CommentBody body={comment.body} onClick={() => callbacks.onView(comment)} />
                    <CommentMeta comment={comment} />
                </EntityCard>
            ))}
        </div>
    );
};
