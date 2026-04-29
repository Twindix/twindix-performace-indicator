import { useNavigate } from "react-router-dom";

import { routesData } from "@/data";
import {
    useAuth,
    useAutoActiveSprint,
    useEditSprintForm,
    useLogout,
    usePermissions,
    usePresence,
    useProjectsListLite,
    useSettings,
    useSprintsList,
    useTheme,
} from "@/hooks";
import { useProjectStore, useSprintStore } from "@/store";

import { MobileNav } from "../mobile-nav";
import {
    EditSprintButton,
    ProjectSelector,
    SprintSelector,
    ThemeToggle,
    UserMenu,
} from "./components";
import { EditSprintDialog } from "./dialogs";

export const Topbar = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { onLogout } = useLogout();
    const { isDarkMode, onToggleTheme } = useTheme();
    const [settings] = useSettings();
    const { activeSprintId, onSetActiveSprint } = useSprintStore();
    const { activeProjectId, onSetActiveProject } = useProjectStore();
    const { projects } = useProjectsListLite();
    const { sprints, refetch: refetchSprints } = useSprintsList();
    const p = usePermissions();
    const canEditProfile = p.auth.editProfile();
    const { status, updateStatus } = usePresence(user?.id, !canEditProfile);

    const isArabic = settings.language === "ar";
    const activeSprint = sprints.find((s) => s.id === activeSprintId);

    useAutoActiveSprint({ sprints, activeSprintId, onSetActive: onSetActiveSprint });

    const editSprint = useEditSprintForm({ activeSprint, onSaved: refetchSprints });

    return (
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-border bg-surface/80 backdrop-blur-sm px-3 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4">
                <MobileNav />
                <div className="flex items-center gap-1.5">
                    <ProjectSelector projects={projects} value={activeProjectId} onChange={onSetActiveProject} />
                    <SprintSelector sprints={sprints} value={activeSprintId} onChange={onSetActiveSprint} />
                    <EditSprintButton disabled={!activeSprint} onClick={editSprint.open} />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
                <UserMenu
                    user={user}
                    isArabic={isArabic}
                    canEditProfile={canEditProfile}
                    presence={{ status, onChange: updateStatus }}
                    actions={{
                        onLogout,
                        onNavigateProfile: () => navigate(routesData.profile),
                        onNavigateSettings: () => navigate(routesData.settings),
                    }}
                />
            </div>

            <EditSprintDialog
                open={editSprint.isOpen}
                isSaving={editSprint.isSaving}
                value={editSprint.value}
                onChange={editSprint.onChange}
                onClose={editSprint.close}
                onSave={editSprint.onSave}
            />
        </header>
    );
};
