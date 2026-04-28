import { Paperclip, X } from "lucide-react";

import { Label } from "@/atoms";
import { t } from "@/hooks";
import type { AddTaskAttachmentsSectionPropsInterface } from "@/interfaces";

export const AddTaskAttachmentsSection = ({
    files,
    onFileAdd,
    onRemove,
}: AddTaskAttachmentsSectionPropsInterface) => (
    <div className="space-y-2">
        <Label className="flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-text-muted" />
            {t("Attachments")}
        </Label>
        <label className="flex items-center gap-2 w-fit text-xs text-primary font-medium cursor-pointer hover:underline">
            <Paperclip className="h-4 w-4" />
            {t("Choose files")}
            <input type="file" multiple className="hidden" onChange={onFileAdd} />
        </label>
        {files.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-1">
                {files.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-3 rounded-lg border border-border bg-muted px-3 py-2">
                        <Paperclip className="h-3.5 w-3.5 text-text-muted shrink-0" />
                        <span className="flex-1 text-sm text-text-dark truncate">{file.name}</span>
                        <span className="text-[10px] text-text-muted shrink-0">{(file.size / 1024).toFixed(1)} KB</span>
                        <button
                            type="button"
                            onClick={() => onRemove(idx)}
                            className="p-1 rounded-full hover:bg-surface text-text-muted hover:text-error transition-colors shrink-0"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
);
