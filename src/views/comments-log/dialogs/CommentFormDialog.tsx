import { Button, Input, Label, Textarea } from "@/atoms";
import { t } from "@/hooks";
import type { CommentFormDialogPropsInterface } from "@/interfaces";
import { Avatar, AvatarFallback, Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/ui";

export const CommentFormDialog = ({ open, editTarget, form, users, handlers, busy }: CommentFormDialogPropsInterface) => (
    <Dialog open={open || !!editTarget} onOpenChange={(o) => { if (!o) handlers.onClose(); }}>
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle>{editTarget ? t("Edit Comment") : t("Add Comment")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-3">
                {!editTarget && (
                    <div className="space-y-2">
                        <Label>{t("Task Title")}</Label>
                        <Input value={form.task_title} onChange={(e) => handlers.onTaskTitleChange(e.target.value)} placeholder={t("Optional task title")} />
                    </div>
                )}
                <div className="space-y-2">
                    <Label>{t("Body")} <span className="text-error">*</span></Label>
                    <Textarea rows={4} value={form.body} onChange={(e) => handlers.onBodyChange(e.target.value)} placeholder={t("Write a comment...")} />
                </div>
                <div className="space-y-2">
                    <Label>{t("Mention Users")}</Label>
                    <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-2 space-y-1">
                        {users.map((u) => (
                            <label key={u.id} className="flex items-center gap-2 cursor-pointer rounded px-2 py-1 hover:bg-muted">
                                <input
                                    type="checkbox"
                                    checked={form.mentioned_user_ids.includes(u.id)}
                                    onChange={(e) => handlers.onMentionToggle(u.id, e.target.checked)}
                                />
                                <Avatar className="h-5 w-5">
                                    <AvatarFallback className="text-[8px]">{u.avatar_initials}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs">{u.full_name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <DialogClose asChild><Button variant="outline">{t("Cancel")}</Button></DialogClose>
                <Button onClick={handlers.onSubmit} loading={busy} disabled={!form.body.trim()}>
                    {editTarget ? t("Save") : t("Create")}
                </Button>
            </div>
        </DialogContent>
    </Dialog>
);
