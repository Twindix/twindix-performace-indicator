import {
    AlertTriangle,
    Bell,
    BookOpen,
    Flag,
    LayoutDashboard,
    ListChecks,
    MessageCircle,
    type LucideIcon,
    Settings,
    UserCog,
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
    { label: "Comments Log", path: routesData.commentsLog, icon: MessageCircle },
    { label: "Users", path: routesData.users, icon: UserCog },
    { label: "Red Flags", path: routesData.redFlags, icon: Flag },
    { label: "Alerts", path: routesData.alerts, icon: Bell },
    { label: "Decisions", path: routesData.decisions, icon: BookOpen },
    { label: "Settings", path: routesData.settings, icon: Settings },
    // { label: "Communication", path: routesData.communication, icon: MessageSquare, disabled: true },
    // { label: "Workload", path: routesData.workload, icon: Users, disabled: true },
    // { label: "Reports", path: routesData.reports, icon: BarChart3, disabled: true },
    // { label: "Analytics", path: routesData.analytics, icon: TrendingUp, disabled: true },
    // { label: "Ownership", path: routesData.ownership, icon: Shield, disabled: true },
    // { label: "Handoffs", path: routesData.handoffs, icon: GitBranch, disabled: true },
];
