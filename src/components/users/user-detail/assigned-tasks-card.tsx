import { ListChecks } from "lucide-react";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import { usersConstants } from "@/constants";
import { t } from "@/hooks";
import type { AssignedTasksCardPropsInterface } from "@/interfaces/users";

export const AssignedTasksCard = ({ tasks }: AssignedTasksCardPropsInterface) => {
    if (tasks.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <ListChecks className="h-4 w-4" />{t("Assigned Tasks")}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                {tasks.map((task) => {
                    const label = usersConstants.phaseLabels[task.status] ?? task.status;
                    return (
                        <div key={task.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted p-2.5">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-text-dark truncate">{task.title}</p>
                                <p className="text-[10px] text-text-muted">
                                    {task.story_points} pts · {t("Readiness")}: {task.readiness_percent}%
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                {task.is_blocked && <Badge variant="error" className="text-[10px]">{t("Blocked")}</Badge>}
                                <Badge variant="outline" className="text-[10px]">{t(label)}</Badge>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};
