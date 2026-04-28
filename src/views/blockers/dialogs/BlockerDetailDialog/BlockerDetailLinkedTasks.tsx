import { Layers } from "lucide-react";

import { t } from "@/hooks";
import type { BlockerDetailLinkedTasksPropsInterface } from "@/interfaces";

export const BlockerDetailLinkedTasks = ({ tasks }: BlockerDetailLinkedTasksPropsInterface) => (
    <div className="mt-4 pb-4 border-b border-border">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide flex items-center gap-1.5 mb-2">
            <Layers className="h-3.5 w-3.5" />
            {t("Linked Tasks")} ({tasks.length})
        </p>
        {tasks.length === 0 ? (
            <p className="text-xs text-text-muted italic">{t("No tasks linked")}</p>
        ) : (
            <div className="space-y-1.5">
                {tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                        <span className="text-sm text-text-dark truncate">{task.title}</span>
                    </div>
                ))}
            </div>
        )}
    </div>
);
