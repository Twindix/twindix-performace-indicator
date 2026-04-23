import {
    Activity,
    AlertTriangle,
    Bell,
    BookOpen,
    CalendarDays,
    Clock,
    Flag,
    FolderKanban,
    GanttChart,
    LayoutDashboard,
    ListChecks,
    MessageCircle,
    type LucideIcon,
    Settings,
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

export interface SidebarSectionInterface {
    title: string;
    items: SidebarItemInterface[];
}

export const sidebarSections: SidebarSectionInterface[] = [
    {
        title: "Overview",
        items: [
            { label: "Dashboard", path: routesData.dashboard, icon: LayoutDashboard },
            { label: "Delivery Analytics", path: routesData.deliveryAnalytics, icon: Activity },
        ],
    },
    {
        title: "Planning",
        items: [
            { label: "Projects", path: routesData.projects, icon: FolderKanban },
            { label: "Tasks", path: routesData.tasks, icon: ListChecks },
        ],
    },
    {
        title: "Scheduling",
        items: [
            { label: "Gantt", path: routesData.gantt, icon: GanttChart },
            { label: "Time", path: routesData.time, icon: Clock },
            { label: "Meetings", path: routesData.meetings, icon: CalendarDays },
        ],
    },
    {
        title: "Activity",
        items: [
            { label: "Blockers", path: routesData.blockers, icon: AlertTriangle },
            { label: "Comments Log", path: routesData.commentsLog, icon: MessageCircle },
            { label: "Red Flags", path: routesData.redFlags, icon: Flag },
            { label: "Alerts", path: routesData.alerts, icon: Bell },
            { label: "Decisions", path: routesData.decisions, icon: BookOpen },
        ],
    },
    {
        title: "People",
        items: [
            { label: "Users", path: routesData.users, icon: UserCog },
            { label: "Teams", path: routesData.teams, icon: Users },
        ],
    },
    {
        title: "System",
        items: [
            { label: "Settings", path: routesData.settings, icon: Settings },
        ],
    },
];
