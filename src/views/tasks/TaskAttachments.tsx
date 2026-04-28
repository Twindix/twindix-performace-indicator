import { Paperclip, Trash2 } from "lucide-react";

import { t } from "@/utils";
import { useGetTask, usePermissions, useTaskAttachments } from "@/hooks";
import type { TaskInterface } from "@/interfaces";

interface Props {
    task: TaskInterface;
    patchTaskLocal: (id: string, updates: Partial<TaskInterface>) => void;
}

const formatSize = (bytes: number) =>
    bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

export const TaskAttachments = ({ task, patchTaskLocal }: Props) => {
    const p = usePermissions();
    const canManage = p.tasks.manageAttachment(task);
    const { uploadHandler, deleteHandler } = useTaskAttachments();
    const { getHandler: getTaskHandler } = useGetTask();
    const attachments = task.attachments ?? [];

    const refreshAttachments = async () => {
        const fresh = await getTaskHandler(task.id);
        if (fresh) patchTaskLocal(task.id, { attachments: fresh.attachments ?? [] });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = "";
        for (const file of files) {
            const ok = await uploadHandler(task.id, file);
            if (ok !== null) await refreshAttachments();
        }
    };

    const handleDelete = async (attachmentId: string) => {
        const ok = await deleteHandler(task.id, attachmentId);
        if (ok) await refreshAttachments();
    };

    return (
        <div className="mt-4 pb-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                    <Paperclip className="h-3.5 w-3.5" />
                    {t("Attachments")}
                    {attachments.length > 0 && (
                        <span className="bg-muted rounded-full px-1.5 py-0.5 text-[10px] font-bold">{attachments.length}</span>
                    )}
                </p>
                {canManage && (
                    <label className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark font-medium cursor-pointer transition-colors">
                        <Paperclip className="h-3.5 w-3.5" />
                        {t("Upload")}
                        <input type="file" multiple className="hidden" onChange={handleFileChange} />
                    </label>
                )}
            </div>

            {attachments.length === 0 ? (
                canManage ? (
                    <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-5 cursor-pointer hover:border-primary hover:bg-primary-lighter/10 transition-colors">
                        <Paperclip className="h-5 w-5 text-text-muted" />
                        <p className="text-xs text-text-muted">{t("Click to upload files")}</p>
                        <input type="file" multiple className="hidden" onChange={handleFileChange} />
                    </label>
                ) : (
                    <p className="text-xs text-text-muted italic">{t("No attachments")}</p>
                )
            ) : (
                <div className="flex flex-col gap-2">
                    {attachments.map((att) => (
                        <div key={att.id} className="flex items-center gap-3 rounded-lg bg-muted p-2.5 group">
                            {att.type?.startsWith("image/") ? (
                                <img src={att.url ?? att.dataUrl} alt={att.name} className="h-10 w-10 rounded object-cover shrink-0" />
                            ) : (
                                <div className="h-10 w-10 rounded bg-primary-lighter flex items-center justify-center shrink-0">
                                    <Paperclip className="h-4 w-4 text-primary" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <a href={att.url ?? att.dataUrl} download={att.name} className="text-xs font-medium text-text-dark hover:text-primary truncate block transition-colors">{att.name}</a>
                                <p className="text-[10px] text-text-muted">{formatSize(att.size)}</p>
                            </div>
                            {canManage && (
                                <button onClick={() => handleDelete(att.id)} className="p-1 rounded text-text-muted hover:text-error hover:bg-error-light transition-colors cursor-pointer">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
