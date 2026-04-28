import { useState } from "react";
import { AtSign, MessageCircle, CheckCircle2, Clock, User, Plus, Pencil, Trash2, Reply } from "lucide-react";

import { Badge, Button, Card, CardContent, Input, Label, Textarea } from "@/atoms";
import { EmptyState, PageHeader } from "@/components/shared";
import { CommentsLogSkeleton } from "@/components/skeletons";
import { t, useCommentsList, useSettings, usePageLoader, useCreateComment, useUpdateComment, useDeleteComment, usePermissions, useRespondComment, useUsersList } from "@/hooks";
import type { CommentInterface } from "@/interfaces";
import { useSprintStore } from "@/store";
import { Avatar, AvatarFallback, Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui";
import { formatDate, formatDateTime } from "@/utils";
import { CommentsLogSkeleton } from "@/components/skeletons";
import { useCommentsView } from "@/hooks/comments/use-comments-view";

import { CommentsFilters, CommentsHeader, CommentsList, CommentsStatsGrid } from "./components";
import { CommentDetailDialog, CommentFormDialog, DeleteCommentDialog } from "./dialogs";

export const CommentsLogView = () => {
    const pageLoading = usePageLoader();
    const [settings] = useSettings();
    const p = usePermissions();
    const { activeSprintId } = useSprintStore();
    const compact = settings.compactView;

    const [mentionFilter, setMentionFilter] = useState<string>("all");
    const [responseFilter, setResponseFilter] = useState<string>("all");

    const { comments, analytics, isLoading: isFetching, patchCommentLocal, removeCommentLocal, refetchAnalytics } = useCommentsList(activeSprintId, {
        status: responseFilter === "all" ? undefined : responseFilter,
        mention: mentionFilter === "all" ? undefined : mentionFilter,
    });
    const { users } = useUsersList();
    const { createHandler: createCommentHandler, isLoading: isCreating } = useCreateComment();
    const { updateHandler: updateCommentHandler, isLoading: isUpdating } = useUpdateComment();
    const { deleteHandler: deleteCommentHandler } = useDeleteComment();
    const { respondHandler: respondCommentHandler } = useRespondComment();

    const [viewTarget, setViewTarget] = useState<CommentInterface | null>(null);
    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<CommentInterface | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CommentInterface | null>(null);
    const [form, setForm] = useState(emptyForm);

    const openEdit = (c: CommentInterface) => {
        setForm({
            body: c.body,
            task_title: c.task_title ?? "",
            mentioned_user_ids: c.mentioned_users.map((m) => m.id),
        });
        setEditTarget(c);
    };

    const handleAdd = async () => {
        if (!form.body.trim() || !activeSprintId) return;
        const res = await createCommentHandler(activeSprintId, {
            body: form.body.trim(),
            task_title: form.task_title.trim() || undefined,
            mentioned_user_ids: form.mentioned_user_ids.length ? form.mentioned_user_ids : undefined,
        });
        if (res) {
            patchCommentLocal(res);
            refetchAnalytics();
            setAddOpen(false);
            setForm(emptyForm);
        }
    };

    const handleEdit = async () => {
        if (!editTarget) return;
        const res = await updateCommentHandler(editTarget.id, {
            body: form.body.trim(),
            mentioned_user_ids: form.mentioned_user_ids.length ? form.mentioned_user_ids : undefined,
        });
        if (res) {
            patchCommentLocal(res);
            setEditTarget(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const ok = await deleteCommentHandler(deleteTarget.id);
        if (ok) {
            removeCommentLocal(deleteTarget.id);
            refetchAnalytics();
            setDeleteTarget(null);
        }
    };

    const handleRespond = async (id: string) => {
        const res = await respondCommentHandler(id);
        if (res) { patchCommentLocal(res); refetchAnalytics(); }
    };

    const stats = {
        total: analytics?.total_comments ?? comments.length,
        withMention: analytics?.with_mention ?? comments.filter((c) => c.mentioned_users.length > 0).length,
        withResponse: analytics?.responded ?? comments.filter((c) => !!c.responded_at).length,
        noResponse: analytics?.no_response ?? comments.filter((c) => !c.responded_at).length,
    };

    if (pageLoading || isFetching) return <CommentsLogSkeleton />;

    const renderFormDialog = () => (
        <Dialog open={addOpen || !!editTarget} onOpenChange={(open) => { if (!open) { setAddOpen(false); setEditTarget(null); setForm(emptyForm); } }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editTarget ? t("Edit Comment") : t("Add Comment")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-3">
                    {!editTarget && (
                        <div className="space-y-2">
                            <Label>{t("Task Title")}</Label>
                            <Input value={form.task_title} onChange={(e) => setForm({ ...form, task_title: e.target.value })} placeholder={t("Optional task title")} />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label>{t("Body")} <span className="text-error">*</span></Label>
                        <Textarea rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder={t("Write a comment...")} />
                    </div>
                    <div className="space-y-2">
                        <Label>{t("Mention Users")}</Label>
                        <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-2 space-y-1">
                            {users.map((u) => {
                                const checked = form.mentioned_user_ids.includes(u.id);
                                return (
                                    <label key={u.id} className="flex items-center gap-2 cursor-pointer rounded px-2 py-1 hover:bg-muted">
                                        <input type="checkbox" checked={checked} onChange={(e) => {
                                            setForm((prev) => ({
                                                ...prev,
                                                mentioned_user_ids: e.target.checked
                                                    ? [...prev.mentioned_user_ids, u.id]
                                                    : prev.mentioned_user_ids.filter((i) => i !== u.id),
                                            }));
                                        }} />
                                        <Avatar className="h-5 w-5">
                                            <AvatarFallback className="text-[8px]">{u.avatar_initials}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs">{u.full_name}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <DialogClose asChild><Button variant="outline">{t("Cancel")}</Button></DialogClose>
                    <Button onClick={editTarget ? handleEdit : handleAdd} loading={isCreating || isUpdating} disabled={!form.body.trim()}>
                        {editTarget ? t("Save") : t("Create")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );

    if (comments.length === 0 && mentionFilter === "all" && responseFilter === "all") {
        return (
            <div>
                <PageHeader title={t("Comments Log")} description={t("Track all task comments, mentions, and responses")}>
                    {p.comments.add() && (
                        <PageHeader.Actions>
                            <Button onClick={() => { setForm(emptyForm); setAddOpen(true); }} className="gap-2" disabled={!activeSprintId}>
                                <Plus className="h-4 w-4" />
                                {t("Add Comment")}
                            </Button>
                        </PageHeader.Actions>
                    )}
                    <PageHeader.Analytics items={[
                        { icon: MessageCircle, value: stats.total, label: "Total Comments", iconWrapperClassName: "bg-primary-lighter", iconClassName: "text-primary" },
                        { icon: AtSign, value: stats.withMention, label: "With Mention", iconWrapperClassName: "bg-primary-lighter", iconClassName: "text-primary" },
                        { icon: CheckCircle2, value: stats.withResponse, label: "Responded", iconWrapperClassName: "bg-success-light", iconClassName: "text-success", valueClassName: "text-success" },
                        { icon: Clock, value: stats.noResponse, label: "No Response", iconWrapperClassName: "bg-warning-light", iconClassName: "text-warning", valueClassName: "text-warning" },
                    ]} />
                </PageHeader>
                <EmptyState icon={MessageCircle} title={t("No Comments")} description={t("No comments found for the current sprint")} />
                {renderFormDialog()}
            </div>
        );
    }

    return (
        <div>
            <PageHeader title={t("Comments Log")} description={t("Track all task comments, mentions, and responses")}>
                {p.comments.add() && (
                    <PageHeader.Actions>
                        <Button onClick={() => { setForm(emptyForm); setAddOpen(true); }} className="gap-2" disabled={!activeSprintId}>
                            <Plus className="h-4 w-4" />
                            {t("Add Comment")}
                        </Button>
                    </PageHeader.Actions>
                )}
                <PageHeader.Analytics items={[
                    { icon: MessageCircle, value: stats.total, label: "Total Comments", iconWrapperClassName: "bg-primary-lighter", iconClassName: "text-primary" },
                    { icon: AtSign, value: stats.withMention, label: "With Mention", iconWrapperClassName: "bg-primary-lighter", iconClassName: "text-primary" },
                    { icon: CheckCircle2, value: stats.withResponse, label: "Responded", iconWrapperClassName: "bg-success-light", iconClassName: "text-success", valueClassName: "text-success" },
                    { icon: Clock, value: stats.noResponse, label: "No Response", iconWrapperClassName: "bg-warning-light", iconClassName: "text-warning", valueClassName: "text-warning" },
                ]} />
            </PageHeader>

            {/* Filters */}
            <Card className={compact ? "mb-3" : "mb-6"}>
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Mention filter */}
                        <Select value={mentionFilter} onValueChange={setMentionFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t("Filter by mention")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("All Mentions")}</SelectItem>
                                {users.map((u) => (
                                    <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Response status filter */}
                        <Select value={responseFilter} onValueChange={setResponseFilter}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder={t("Response status")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("All Statuses")}</SelectItem>
                                <SelectItem value="responded">{t("Responded")}</SelectItem>
                                <SelectItem value="no_response">{t("No Response")}</SelectItem>
                            </SelectContent>
                        </Select>

                        {(mentionFilter !== "all" || responseFilter !== "all") && (
                            <button
                                onClick={() => { setMentionFilter("all"); setResponseFilter("all"); }}
                                className="text-xs text-text-muted hover:text-text-dark underline"
                            >
                                {t("Clear filters")}
                            </button>
                        )}

                        <span className="ms-auto text-xs text-text-muted">
                            {comments.length} {t("comments")}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Comments list */}
            {comments.length === 0 ? (
                <EmptyState icon={MessageCircle} title={t("No Results")} description={t("No comments match the selected filters")} />
            ) : (
                <div className="flex flex-col gap-3">
                    {comments.map((comment) => {
                        const hasResponse = !!comment.responded_at;

                        return (
                            <Card key={comment.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    {/* Task label + actions */}
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        {comment.task_title ? (
                                            <Badge variant="outline" className="text-xs font-normal">
                                                {comment.task_title}
                                            </Badge>
                                        ) : <span />}
                                        <div className="flex items-center gap-1 shrink-0">
                                            {!hasResponse && p.comments.respond() && (
                                                <button onClick={() => handleRespond(comment.id)} className="p-1.5 rounded hover:bg-success-light text-text-muted hover:text-success cursor-pointer" title={t("Respond")}>
                                                    <Reply className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            {p.comments.edit(comment) && (
                                                <button onClick={() => openEdit(comment)} className="p-1.5 rounded hover:bg-muted text-text-muted hover:text-primary cursor-pointer" title={t("Edit")}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            {p.comments.delete(comment) && (
                                                <button onClick={() => setDeleteTarget(comment)} className="p-1.5 rounded hover:bg-error-light text-text-muted hover:text-error cursor-pointer" title={t("Delete")}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Comment content */}
                                    <p className="text-sm text-text-dark mb-3 cursor-pointer" onClick={() => setViewTarget(comment)}>{comment.body}</p>

                                    {/* Meta row */}
                                    <div className="flex flex-wrap items-center gap-3">
                                        {/* Author */}
                                        <div className="flex items-center gap-1.5">
                                            <User className="h-3.5 w-3.5 text-text-muted" />
                                            <Avatar className="h-5 w-5">
                                                <AvatarFallback className="text-[8px]">{comment.author.avatar_initials}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs text-text-secondary">{comment.author.full_name}</span>
                                        </div>

                                        {/* Mentions */}
                                        {comment.mentioned_users.length > 0 && (
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <AtSign className="h-3.5 w-3.5 text-primary" />
                                                {comment.mentioned_users.map((m) => (
                                                    <div key={m.id} className="flex items-center gap-1">
                                                        <Avatar className="h-5 w-5">
                                                            <AvatarFallback className="text-[8px]">{m.avatar_initials}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs text-primary font-medium">{m.full_name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Time */}
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5 text-text-muted" />
                                            <span className="text-xs text-text-muted">{formatDateTime(comment.created_at)}</span>
                                        </div>

                                        {/* Response status */}
                                        {hasResponse ? (
                                            <div className="flex items-center gap-1.5 ms-auto">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                                <span className="text-xs text-success font-medium">{t("Responded")}</span>
                                                <span className="text-xs text-text-muted">· {formatDate(comment.responded_at!)}</span>
                                            </div>
                                        ) : (
                                            <Badge variant="warning" className="ms-auto text-xs">
                                                {t("No Response")}
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Details Dialog */}
            <Dialog open={!!viewTarget} onOpenChange={(o) => !o && setViewTarget(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-primary" />
                            {t("Comment Details")}
                        </DialogTitle>
                    </DialogHeader>
                    {viewTarget && (() => {
                        const author = viewTarget.author;
                        const hasResponse = !!viewTarget.responded_at;
                        return (
                            <div className="flex flex-col gap-4 py-2">
                                {viewTarget.task_title && (
                                    <div>
                                        <p className="text-xs font-medium text-text-muted mb-1">{t("Task")}</p>
                                        <Badge variant="outline" className="text-xs font-normal">{viewTarget.task_title}</Badge>
                                    </div>
                                )}

                                <div>
                                    <p className="text-xs font-medium text-text-muted mb-1">{t("Comment")}</p>
                                    <p className="text-sm text-text-dark">{viewTarget.body}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-medium text-text-muted mb-1.5">{t("Written by")}</p>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6"><AvatarFallback className="text-[9px]">{author.avatar_initials}</AvatarFallback></Avatar>
                                            <span className="text-sm text-text-secondary">{author.full_name}</span>
                                        </div>
                                    </div>
                                    {viewTarget.mentioned_users.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium text-text-muted mb-1.5">{t("Mentioned")}</p>
                                            <div className="flex flex-col gap-1">
                                                {viewTarget.mentioned_users.map((m) => (
                                                    <div key={m.id} className="flex items-center gap-2">
                                                        <AtSign className="h-4 w-4 text-primary" />
                                                        <Avatar className="h-6 w-6"><AvatarFallback className="text-[9px]">{m.avatar_initials}</AvatarFallback></Avatar>
                                                        <span className="text-sm text-primary font-medium">{m.full_name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-border pt-3">
                                    <div>
                                        <p className="text-xs font-medium text-text-muted mb-1">{t("Posted")}</p>
                                        <p className="text-sm text-text-secondary">{formatDateTime(viewTarget.created_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-text-muted mb-1">{t("Response")}</p>
                                        {hasResponse ? (
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1 text-success">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    <span className="text-xs font-medium">{t("Responded")}</span>
                                                </div>
                                                {viewTarget.responded_at && <span className="text-xs text-text-muted">{formatDate(viewTarget.responded_at)}</span>}
                                            </div>
                                        ) : (
                                            <Badge variant="warning" className="text-xs">{t("No Response")}</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {renderFormDialog()}

            {/* Delete confirm */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>{t("Delete Comment")}</DialogTitle></DialogHeader>
                    <p className="text-sm text-text-secondary py-2">{t("Are you sure?")}</p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t("Cancel")}</Button>
                        <Button variant="destructive" onClick={handleDelete}>{t("Delete")}</Button>
                    </div>
                </DialogContent>
            </Dialog>
    const {
        comments, stats, users, isLoading, compact,
        mentionFilter, responseFilter, filterHandlers,
        viewTarget, addOpen, editTarget, deleteTarget,
        form, formHandlers,
        canAdd, permissions, callbacks,
        onAddOpen, onViewClose, onDeleteClose, onDeleteConfirm,
        busy,
    } = useCommentsView();

    if (isLoading) return <CommentsLogSkeleton />;

    return (
        <div>
            <CommentsHeader canAdd={canAdd} onAdd={onAddOpen} />

            <CommentsStatsGrid stats={stats} compact={compact} />

            <CommentsFilters
                mentionFilter={mentionFilter}
                responseFilter={responseFilter}
                users={users}
                count={comments.length}
                compact={compact}
                handlers={filterHandlers}
            />

            <CommentsList comments={comments} permissions={permissions} callbacks={callbacks} />

            <CommentFormDialog
                open={addOpen}
                editTarget={editTarget}
                form={form}
                users={users}
                handlers={formHandlers}
                busy={busy}
            />

            <CommentDetailDialog comment={viewTarget} onClose={onViewClose} />

            <DeleteCommentDialog
                open={!!deleteTarget}
                onConfirm={onDeleteConfirm}
                onClose={onDeleteClose}
            />
        </div>
    );
};
