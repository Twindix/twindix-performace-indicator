import {
    AlertTriangle,
    BarChart3,
    Bell,
    BookOpen,
    Flag,
    GitBranch,
    LayoutDashboard,
    ListChecks,
    MessageCircle,
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
    { label: "Dashboard", path: routesData.dashboard, icon: LayoutDashboard },
    { label: "Tasks", path: routesData.tasks, icon: ListChecks },
    { label: "Blockers", path: routesData.blockers, icon: AlertTriangle },
    { label: "Decisions", path: routesData.decisions, icon: BookOpen },
    { label: "Communication", path: routesData.communication, icon: MessageSquare },
    { label: "Comments Log", path: routesData.commentsLog, icon: MessageCircle },
    { label: "Workload", path: routesData.workload, icon: Users },
    { label: "Reports", path: routesData.reports, icon: BarChart3 },
    { label: "Analytics", path: routesData.analytics, icon: TrendingUp },
    { label: "Ownership", path: routesData.ownership, icon: Shield },
    { label: "Handoffs", path: routesData.handoffs, icon: GitBranch },
    { label: "Red Flags", path: routesData.redFlags, icon: Flag },
    { label: "Alerts", path: routesData.alerts, icon: Bell },
    { label: "Settings", path: routesData.settings, icon: Settings },
];
