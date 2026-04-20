import {
    Flag,
    LayoutDashboard,
    type LucideIcon,
    Settings,
    Target,
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
    { label: "Red Flags", path: routesData.redFlags, icon: Flag },
    { label: "Settings", path: routesData.settings, icon: Settings },
];
