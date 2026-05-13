import {
    Activity,
    AlertTriangle,
    ArrowRightLeft,
    Bell,
    BookOpen,
    CalendarDays,
    Clock,
    FileText,
    Flag,
    FolderKanban,
    GanttChart,
    LayoutDashboard,
    ListChecks,
    MessageCircle,
    Rocket,
    Shield,
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

// Top group — existing pages.
export const sidebarItems: SidebarItemInterface[] = [
    { label: "Dashboard", path: routesData.dashboard, icon: LayoutDashboard },
    { label: "Projects", path: routesData.projects, icon: FolderKanban },
    { label: "Tasks", path: routesData.tasks, icon: ListChecks },
    { label: "Blockers", path: routesData.blockers, icon: AlertTriangle },
    { label: "Comments Log", path: routesData.commentsLog, icon: MessageCircle },
    { label: "Red Flags", path: routesData.redFlags, icon: Flag },
    { label: "Alerts", path: routesData.alerts, icon: Bell },
    { label: "Decisions", path: routesData.decisions, icon: BookOpen },
    { label: "Users", path: routesData.users, icon: UserCog },
    { label: "Teams", path: routesData.teams, icon: Users },
    { label: "Settings", path: routesData.settings, icon: Settings },
];

// Bottom group — new pages, rendered below a divider.
export const sidebarNewItems: SidebarItemInterface[] = [
    { label: "Delivery Analytics", path: routesData.deliveryAnalytics, icon: Activity },
    { label: "Gantt", path: routesData.gantt, icon: GanttChart },
    { label: "Time", path: routesData.time, icon: Clock },
    { label: "Meetings", path: routesData.meetings, icon: CalendarDays },
    { label: "Workload", path: routesData.workload, icon: Users },
    { label: "Handoffs", path: routesData.handoffs, icon: ArrowRightLeft },
    { label: "Ownership", path: routesData.ownership, icon: Shield },
    { label: "Reports", path: routesData.reports, icon: FileText },
    { label: "Deploys", path: routesData.deploys, icon: Rocket },
];
