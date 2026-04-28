import { MessageCircle } from "lucide-react";

import { EmptyState } from "@/components/shared";
import { t } from "@/hooks";
import type { CommentsListPropsInterface } from "@/interfaces";

import { CommentCard } from "./CommentCard";

export const CommentsList = ({ comments, permissions, callbacks }: CommentsListPropsInterface) => {
    if (comments.length === 0) {
        return <EmptyState icon={MessageCircle} title={t("No Results")} description={t("No comments match the selected filters")} />;
    }
    return (
        <div className="flex flex-col gap-3">
            {comments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} permissions={permissions} callbacks={callbacks} />
            ))}
        </div>
    );
};
