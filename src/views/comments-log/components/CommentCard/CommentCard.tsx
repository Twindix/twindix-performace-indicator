import { Card, CardContent } from "@/atoms";
import type { CommentCardPropsInterface } from "@/interfaces";

import { CommentCardBody } from "./CommentCardBody";
import { CommentCardHeader } from "./CommentCardHeader";
import { CommentCardMeta } from "./CommentCardMeta";

export const CommentCard = ({ comment, permissions, callbacks }: CommentCardPropsInterface) => {
    const hasResponse = !!comment.responded_at;
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <CommentCardHeader
                    taskTitle={comment.task_title}
                    hasResponse={hasResponse}
                    actions={{
                        canRespond: permissions.canRespond(comment),
                        canEdit: permissions.canEdit(comment),
                        canDelete: permissions.canDelete(comment),
                        onRespond: () => callbacks.onRespond(comment.id),
                        onEdit: () => callbacks.onEdit(comment),
                        onDelete: () => callbacks.onDelete(comment),
                    }}
                />
                <CommentCardBody body={comment.body} onClick={() => callbacks.onView(comment)} />
                <CommentCardMeta comment={comment} />
            </CardContent>
        </Card>
    );
};
