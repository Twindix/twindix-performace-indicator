import { AtSign, CheckCircle2, MessageCircle } from "lucide-react";

import { Badge } from "@/atoms";
import { t } from "@/hooks";
import type { CommentDetailDialogPropsInterface } from "@/interfaces";
import { Avatar, AvatarFallback, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui";
import { formatDate, formatDateTime } from "@/utils";

export const CommentDetailDialog = ({ comment, onClose }: CommentDetailDialogPropsInterface) => (
    <Dialog open={!!comment} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    {t("Comment Details")}
                </DialogTitle>
            </DialogHeader>
            {comment && (
                <div className="flex flex-col gap-4 py-2">
                    {comment.task_title && (
                        <div>
                            <p className="text-xs font-medium text-text-muted mb-1">{t("Task")}</p>
                            <Badge variant="outline" className="text-xs font-normal">{comment.task_title}</Badge>
                        </div>
                    )}

                    <div>
                        <p className="text-xs font-medium text-text-muted mb-1">{t("Comment")}</p>
                        <p className="text-sm text-text-dark">{comment.body}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-medium text-text-muted mb-1.5">{t("Written by")}</p>
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6"><AvatarFallback className="text-[9px]">{comment.author.avatar_initials}</AvatarFallback></Avatar>
                                <span className="text-sm text-text-secondary">{comment.author.full_name}</span>
                            </div>
                        </div>
                        {comment.mentioned_users.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-text-muted mb-1.5">{t("Mentioned")}</p>
                                <div className="flex flex-col gap-1">
                                    {comment.mentioned_users.map((m) => (
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
                            <p className="text-sm text-text-secondary">{formatDateTime(comment.created_at)}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-text-muted mb-1">{t("Response")}</p>
                            {comment.responded_at ? (
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1 text-success">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span className="text-xs font-medium">{t("Responded")}</span>
                                    </div>
                                    <span className="text-xs text-text-muted">{formatDate(comment.responded_at)}</span>
                                </div>
                            ) : (
                                <Badge variant="warning" className="text-xs">{t("No Response")}</Badge>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DialogContent>
    </Dialog>
);
