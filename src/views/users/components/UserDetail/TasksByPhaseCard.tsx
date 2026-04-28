import { ListChecks } from "lucide-react";

import { CardContent } from "@/atoms";
import { t } from "@/hooks";
import type { TasksByPhaseCardPropsInterface } from "@/interfaces/users";
import { buildPhaseRows } from "@/lib/users";

import { Bar } from "../Bar";
import { ActivityCard } from "./ActivityCard";

export const TasksByPhaseCard = ({ tasksByPhase }: TasksByPhaseCardPropsInterface) => {
    const phaseRows = buildPhaseRows(tasksByPhase);
    const maxPhaseCount = Math.max(...phaseRows.map((row) => row.count), 1);

    return (
        <ActivityCard icon={ListChecks} title={t("Tasks by Phase")}>
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
        </ActivityCard>
    );
};
