import {
    AlertTriangle,
    BarChart3,
    BookOpen,
    GitBranch,
    LayoutDashboard,
    ListChecks,
    MessageSquare,
    type LucideIcon,
    Settings,
    Shield,
    TrendingUp,
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
    { label: "Dashboard",     path: routesData.dashboard.path,     icon: LayoutDashboard,  disabled: routesData.dashboard.disabled },
    { label: "Tasks",         path: routesData.tasks.path,         icon: ListChecks,        disabled: routesData.tasks.disabled },
    { label: "Blockers",      path: routesData.blockers.path,      icon: AlertTriangle,     disabled: routesData.blockers.disabled },
    { label: "Decisions",     path: routesData.decisions.path,     icon: BookOpen,          disabled: routesData.decisions.disabled },
    { label: "Communication", path: routesData.communication.path, icon: MessageSquare,     disabled: routesData.communication.disabled },
    { label: "Workload",      path: routesData.workload.path,      icon: Users,             disabled: routesData.workload.disabled },
    { label: "Reports",       path: routesData.reports.path,       icon: BarChart3,         disabled: routesData.reports.disabled },
    { label: "Analytics",     path: routesData.analytics.path,     icon: TrendingUp,        disabled: routesData.analytics.disabled },
    { label: "Ownership",     path: routesData.ownership.path,     icon: Shield,            disabled: routesData.ownership.disabled },
    { label: "Handoffs",      path: routesData.handoffs.path,      icon: GitBranch,         disabled: routesData.handoffs.disabled },
    { label: "Settings",      path: routesData.settings.path,      icon: Settings,          disabled: routesData.settings.disabled },
];
