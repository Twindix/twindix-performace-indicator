import { ClipboardList } from "lucide-react";

import { EmptyState } from "@/components/shared";
import { t } from "@/hooks";
import type { TasksContentPropsInterface } from "@/interfaces";

import { BoardView } from "./BoardView";
import { PipelineView } from "./PipelineView";

export const TasksContent = ({
    viewMode,
    kanban,
    pipeline,
    isEmpty,
    onSelectTask,
}: TasksContentPropsInterface) => {
    if (isEmpty) {
        return (
            <EmptyState
                icon={ClipboardList}
                title={t("No tasks found")}
                description={t("Try adjusting your filters or search query.")}
            />
        );
    }

    if (viewMode === "board") {
        return <BoardView kanban={kanban} onSelectTask={onSelectTask} />;
    }

    return <PipelineView pipeline={pipeline} onSelectTask={onSelectTask} />;
};
