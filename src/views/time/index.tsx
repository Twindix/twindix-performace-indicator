import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Button, Combobox } from "@/atoms";
import { Header } from "@/components/shared";
import {
    t,
    useAuth,
    useSprintsList,
    useTimeTrackingBySprint,
    useTimeTrackingByTask,
    useTimeTrackingByUser,
    useUsersListLite,
} from "@/hooks";
import { tasksService } from "@/services";
import { useSprintStore } from "@/store";
import { cn } from "@/utils";

import { TIME_TABS, type TimeTabId } from "./constants";
import { LogTimeDialog } from "./LogTimeDialog";

const StatTile = ({ label, value }: { label: string; value: string | number }) => (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
        <p className="text-[11px] uppercase tracking-wide text-text-muted">{label}</p>
        <p className="text-xl font-bold text-text-dark mt-1">{value}</p>
    </div>
);

const LoadingTile = () => (
    <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
        {t("Loading time data...")}
    </div>
);

export const TimeView = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState<TimeTabId>("sprint");
    const [logOpen, setLogOpen] = useState(false);

    const { activeSprintId } = useSprintStore();
    const { sprints } = useSprintsList();
    const { users } = useUsersListLite();

    const [selectedSprintId, setSelectedSprintId] = useState<string>(activeSprintId ?? "");
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [selectedTaskId, setSelectedTaskId] = useState<string>("");
    const [allTasks, setAllTasks] = useState<{ id: string; title: string; code?: string | null }[]>([]);

    useEffect(() => {
        if (activeSprintId && activeSprintId !== selectedSprintId) setSelectedSprintId(activeSprintId);
    }, [activeSprintId, selectedSprintId]);

    useEffect(() => {
        if (selectedUserId === "" && users.length > 0) setSelectedUserId(users[0].id);
    }, [users, selectedUserId]);

    useEffect(() => {
        tasksService.listLiteHandler({ exclude_done: false })
            .then((result) => {
                const tasks = Array.isArray(result) ? result : [];
                setAllTasks(tasks);
                if (tasks.length > 0) setSelectedTaskId((prev) => prev || tasks[0].id);
            })
            .catch(() => {});
    }, []);

    const { data: sprintData, isLoading: loadingSprint, refetch: refetchSprint } = useTimeTrackingBySprint(selectedSprintId);
    const { data: userData, isLoading: loadingUser, refetch: refetchUser } = useTimeTrackingByUser(selectedUserId);
    const { data: taskData, isLoading: loadingTask, refetch: refetchTask } = useTimeTrackingByTask(selectedTaskId);

    const handleLogged = () => {
        if (tab === "sprint") refetchSprint();
        else if (tab === "user") refetchUser();
        else if (tab === "task") refetchTask();
    };

    return (
        <div>
            <Header
                title={t("Time")}
                description={t("Track hours across sprints, users, and tasks.")}
                actions={
                    <Button size="sm" className="gap-1.5" onClick={() => setLogOpen(true)}>
                        <Plus className="h-4 w-4" />
                        {t("Log Time")}
                    </Button>
                }
            />

            <div className="flex items-center gap-1 mb-5 border-b border-border">
                {TIME_TABS.map((tabDef) => (
                    <button
                        key={tabDef.id}
                        type="button"
                        onClick={() => setTab(tabDef.id)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium cursor-pointer transition-colors border-b-2 -mb-px",
                            tab === tabDef.id
                                ? "border-primary-medium text-primary-medium"
                                : "border-transparent text-text-muted hover:text-text-dark",
                        )}
                    >
                        {t(tabDef.label)}
                    </button>
                ))}
            </div>

            {tab === "sprint" && (
                <>
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {sprints.map((sprint) => (
                            <button
                                key={sprint.id}
                                type="button"
                                onClick={() => setSelectedSprintId(sprint.id)}
                                className={cn(
                                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                                    selectedSprintId === sprint.id
                                        ? "border-primary bg-primary-lighter text-primary"
                                        : "border-border text-text-muted hover:text-text-dark hover:bg-muted/40",
                                )}
                            >
                                {sprint.name}
                            </button>
                        ))}
                    </div>
                    {loadingSprint ? <LoadingTile /> : !sprintData ? (
                        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
                            {t("No time tracking data for this sprint.")}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                                <StatTile label={t("Total Estimated")} value={`${sprintData.total_estimated_hours}h`} />
                                <StatTile label={t("Total Logged")} value={`${sprintData.total_logged_hours}h`} />
                                <StatTile label={t("Variance")} value={`${sprintData.variance_hours}h`} />
                            </div>
                            <h3 className="text-sm font-semibold text-text-dark mb-3">{t("By User")}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {sprintData.by_user.map((u) => (
                                    <div key={u.user_id} className="rounded-lg border border-border bg-card p-4">
                                        <p className="text-sm font-semibold text-text-dark">{u.name}</p>
                                        <p className="text-xs text-text-muted mt-1">{u.total_logged_hours}h {t("logged")}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}

            {tab === "user" && (
                <>
                    <div className="mb-4 max-w-xs">
                        <Combobox
                            options={users.map((u) => ({ value: u.id, label: u.full_name }))}
                            value={selectedUserId}
                            onChange={setSelectedUserId}
                            placeholder={t("Select user")}
                        />
                    </div>
                    {loadingUser ? <LoadingTile /> : !userData ? (
                        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
                            {selectedUserId ? t("No time tracking data for this user.") : t("Select a user to view time tracking.")}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                <StatTile label={t("Total Logged")} value={`${userData.total_logged_hours}h`} />
                                <StatTile label={t("Days with Logs")} value={userData.by_day.length} />
                            </div>
                            <h3 className="text-sm font-semibold text-text-dark mb-3">{t("Daily Breakdown")}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                {userData.by_day.map((d) => (
                                    <div key={d.date} className="rounded-lg border border-border bg-card p-3">
                                        <p className="text-xs text-text-muted">{d.date}</p>
                                        <p className="text-sm font-bold text-text-dark mt-0.5">{d.logged_hours}h</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}

            {tab === "task" && (
                <>
                    <div className="mb-4 max-w-xs">
                        <Combobox
                            options={allTasks.map((task) => ({ value: task.id, label: task.code ? `${task.code} - ${task.title}` : task.title }))}
                            value={selectedTaskId}
                            onChange={setSelectedTaskId}
                            placeholder={t("Select task")}
                        />
                    </div>
                    {loadingTask ? <LoadingTile /> : !taskData ? (
                        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-text-muted">
                            {selectedTaskId ? t("No time tracking data for this task.") : t("Select a task to view time tracking.")}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                <StatTile label={t("Total Logged")} value={`${taskData.total_logged_hours}h`} />
                                <StatTile label={t("Contributors")} value={taskData.by_user.length} />
                            </div>
                            <h3 className="text-sm font-semibold text-text-dark mb-3">{t("By User")}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {taskData.by_user.map((u) => (
                                    <div key={u.user_id} className="rounded-lg border border-border bg-card p-4">
                                        <p className="text-sm font-semibold text-text-dark">{u.name}</p>
                                        <p className="text-xs text-text-muted mt-1">{u.total_logged_hours}h {t("logged")}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}

            <LogTimeDialog
                open={logOpen}
                onOpenChange={setLogOpen}
                currentUserId={user?.id ?? null}
                onLogged={handleLogged}
            />
        </div>
    );
};
