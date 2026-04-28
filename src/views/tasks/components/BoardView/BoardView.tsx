import { tasksConstants } from "@/constants";
import type { BoardViewPropsInterface } from "@/interfaces";

import { BoardColumn } from "./BoardColumn";

export const BoardView = ({ kanban, onSelectTask }: BoardViewPropsInterface) => (
    <div className="flex flex-1 gap-4 pb-4 overflow-x-auto min-h-[calc(100vh-14rem)]">
        {tasksConstants.columns.map(({ phase, label }) => (
            <BoardColumn
                key={phase}
                status={phase}
                label={label}
                tasks={kanban[phase] ?? []}
                onSelectTask={onSelectTask}
            />
        ))}
    </div>
);
