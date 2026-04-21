import { useState, useRef } from "react";
import { MessageCircle, Send, Trash2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/ui";
import { t } from "@/hooks";
import type { TaskInterface, TaskCommentInterface, UserInterface } from "@/interfaces";
import { commentsService } from "@/services";
import { useAuthStore } from "@/store";
import { tasksConstants } from "@/constants/tasks";

interface Props {
    task: TaskInterface;
    currentUserId: string;
    members: UserInterface[];
    onUpdateComments?: (taskId: string, comments: TaskCommentInterface[]) => void;
}

export const TaskComments = ({ task, members, onUpdateComments }: Props) => {
    const { user: authUser } = useAuthStore();
    const currentUserId = authUser?.id ?? "";

    const [comments, setComments] = useState<TaskCommentInterface[]>(task.comments ?? []);
    const [commentText, setCommentText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const getMember = (id: string) => members.find((m) => m.id === id);

    const submit = async () => {
        if (!commentText.trim() || isSending) return;
        setIsSending(true);
        try {
            const created = await commentsService.createHandler(task.id, { body: commentText.trim() });
            const next = [...comments, created];
            setComments(next);
            onUpdateComments?.(task.id, next);
            setCommentText("");
        } catch {
            toast.error(t(tasksConstants.errors.commentAddFailed));
        } finally {
            setIsSending(false);
        }
    };

    const startEdit = (comment: TaskCommentInterface) => {
        setEditingId(comment.id);
        setEditText(comment.body);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditText("");
    };

    const saveEdit = async (id: string) => {
        if (!editText.trim() || isSavingEdit) return;
        setIsSavingEdit(true);
        try {
            const updated = await commentsService.updateHandler(id, { body: editText.trim() });
            const next = comments.map((c) => (c.id === id ? updated : c));
            setComments(next);
            onUpdateComments?.(task.id, next);
            setEditingId(null);
            setEditText("");
        } catch {
            toast.error(t(tasksConstants.errors.commentUpdateFailed));
        } finally {
            setIsSavingEdit(false);
        }
    };

    const deleteComment = async (id: string) => {
        try {
            await commentsService.deleteHandler(id);
            const next = comments.filter((c) => c.id !== id);
            setComments(next);
            onUpdateComments?.(task.id, next);
        } catch {
            toast.error(t(tasksConstants.errors.commentDeleteFailed));
        }
    };

    return (
        <div className="mt-4">
            <p className="text-xs font-semibold text-text-muted flex items-center gap-1.5 mb-3">
                <MessageCircle className="h-3.5 w-3.5" />
                {t("Comments")}
                {comments.length > 0 && (
                    <span className="bg-muted rounded-full px-1.5 py-0.5 text-[10px] font-bold">{comments.length}</span>
                )}
            </p>

            {comments.length > 0 && (
                <div className="flex flex-col gap-3 mb-4">
                    {comments.map((c) => {
                        const author = getMember(c.author.id);
                        const isAuthor = c.author.id === currentUserId;
                        const isEditing = editingId === c.id;
                        return (
                            <div key={c.id} className="flex gap-2.5 group">
                                <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                                    <AvatarFallback className="text-[9px]">{c.author.avatar_initials ?? author?.avatar_initials ?? "?"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold text-text-dark">{c.author.full_name ?? author?.full_name ?? t("Unknown")}</span>
                                        <span className="text-[10px] text-text-muted ms-auto">
                                            {new Date(c.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                        {isAuthor && !isEditing && (
                                            <>
                                                <button
                                                    onClick={() => startEdit(c)}
                                                    className="p-1.5 rounded text-text-muted hover:text-primary hover:bg-primary-lighter opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={() => deleteComment(c.id)}
                                                    className="p-1.5 rounded text-text-muted hover:text-error hover:bg-error-light opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="relative">
                                            <textarea
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(c.id); }
                                                    if (e.key === "Escape") cancelEdit();
                                                }}
                                                rows={2}
                                                className="w-full rounded-xl border border-input bg-surface px-3 py-2 pe-16 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-colors"
                                                autoFocus
                                            />
                                            <div className="absolute bottom-2 end-2 flex gap-1">
                                                <button
                                                    onClick={() => saveEdit(c.id)}
                                                    disabled={!editText.trim() || isSavingEdit}
                                                    className="p-1.5 rounded-md text-primary hover:bg-primary-lighter disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="p-1.5 rounded-md text-text-muted hover:bg-muted transition-colors cursor-pointer"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-text-secondary bg-muted rounded-lg px-3 py-2">{c.body}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {comments.length === 0 && (
                <p className="text-xs text-text-muted italic mb-3">{t("No comments yet")}</p>
            )}

            <div className="relative">
                <textarea
                    ref={textareaRef}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
                    placeholder={t("Write a comment…")}
                    rows={2}
                    className="w-full rounded-xl border border-input bg-surface px-3 py-2 pe-10 text-sm text-text-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-colors"
                />
                <button
                    onClick={submit}
                    disabled={!commentText.trim() || isSending}
                    className="absolute bottom-2 end-2 p-1.5 rounded-md text-primary hover:bg-primary-lighter disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    <Send className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};
