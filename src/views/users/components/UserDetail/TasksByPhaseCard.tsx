import { ListChecks } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { t } from "@/hooks";
import type { TasksByPhaseCardPropsInterface } from "@/interfaces/users";
import { buildPhaseRows } from "@/lib/users";

import { Bar } from "../Bar";

export const TasksByPhaseCard = ({ tasksByPhase }: TasksByPhaseCardPropsInterface) => {
    const phaseRows = buildPhaseRows(tasksByPhase);
    const maxPhaseCount = Math.max(...phaseRows.map((row) => row.count), 1);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <ListChecks className="h-4 w-4" />{t("Tasks by Phase")}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {phaseRows.map(({ phase, count, label }) => (
                    <div key={phase}>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-text-secondary">{t(label)}</span>
                            <span className="font-semibold text-text-dark">{count}</span>
                        </div>
                        <Bar
                            value={count}
                            max={maxPhaseCount}
                            color={phase === "done" ? "bg-success" : phase === "in_progress" ? "bg-warning" : "bg-primary"}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};
