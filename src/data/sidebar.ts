import {
    AlertTriangle,
    Bell,
    BookOpen,
    CalendarDays,
    Flag,
    LayoutDashboard,
    ListChecks,
    MessageCircle,
    type LucideIcon,
    Settings,
    Target,
    UserCog,
    Users,
} from "lucide-react";

import { routesData } from "./routes";

export interface SidebarItemInterface {
    label: string;
    path: string;
    icon: LucideIcon;
    disabled?: boolean;
}

export const sidebarItems: SidebarItemInterface[] = [
    { label: "Dashboard", path: routesData.dashboard, icon: LayoutDashboard },
    { label: "Sprints", path: routesData.sprints, icon: Target },
    { label: "Tasks", path: routesData.tasks, icon: ListChecks },
    { label: "Blockers", path: routesData.blockers, icon: AlertTriangle },
    { label: "Comments Log", path: routesData.commentsLog, icon: MessageCircle },
    { label: "Users", path: routesData.users, icon: UserCog },
    { label: "Teams", path: routesData.teams, icon: Users },
    { label: "Red Flags", path: routesData.redFlags, icon: Flag },
    { label: "Alerts", path: routesData.alerts, icon: Bell },
    { label: "Decisions", path: routesData.decisions, icon: BookOpen },
    { label: "Settings", path: routesData.settings, icon: Settings },
];
