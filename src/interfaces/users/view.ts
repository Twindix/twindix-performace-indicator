import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { UserInterface } from "@/interfaces/common";
import type { TeamLiteInterface } from "@/interfaces/teams";

import type {
    AddUserFormErrorsInterface,
    AddUserFormStateInterface,
    UserAnalyticsAlertsEngagementInterface,
    UserAnalyticsAssignedTaskInterface,
    UserAnalyticsBlockerActivityInterface,
    UserAnalyticsCommentsActivityInterface,
    UserAnalyticsCommunicationInterface,
    UserAnalyticsQuickStatsInterface,
    UserAnalyticsRedFlagsInterface,
    UserAnalyticsTasksByPhaseInterface,
    UserAnalyticsTopStatsInterface,
    UserAnalyticsUserInterface,
} from "./domain";

export interface ActivityCardPropsInterface {
    icon?: LucideIcon;
    title: string;
    children: ReactNode;
    titleSize?: "sm" | "base";
}

export interface BarPropsInterface {
    value: number;
    max: number;
    color?: string;
}

export interface StatPropsInterface {
    label: string;
    value: number;
    suffix?: string;
    color?: string;
}

export interface UserCardPropsInterface {
    user: UserInterface;
    canEdit: boolean;
    onToggleStatus: (user: UserInterface) => void;
    onView: (id: string) => void;
}

export interface UsersListPropsInterface {
    users: UserInterface[];
    canEdit: boolean;
    onToggleStatus: (user: UserInterface) => void;
    onView: (id: string) => void;
}

export interface AddUserDialogPropsInterface {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: () => void;
}

export interface AddUserFormFieldsPropsInterface {
    form: AddUserFormStateInterface;
    errors: AddUserFormErrorsInterface;
    teams: TeamLiteInterface[];
    onChange: (field: keyof AddUserFormStateInterface, value: string) => void;
}

export interface UserDetailProfileCardPropsInterface {
    user: UserAnalyticsUserInterface;
}

export interface QuickStatsCardPropsInterface {
    quickStats: UserAnalyticsQuickStatsInterface;
}

export interface KpiRowPropsInterface {
    topStats: UserAnalyticsTopStatsInterface;
}

export interface PhaseRowInterface {
    phase: string;
    count: number;
    label: string;
}

export interface TasksByPhaseCardPropsInterface {
    tasksByPhase: UserAnalyticsTasksByPhaseInterface;
}

export interface ResponseDistributionItemInterface {
    label: string;
    count: number;
}

export interface CommunicationCardPropsInterface {
    communication: UserAnalyticsCommunicationInterface;
}

export interface BlockerActivityCardPropsInterface {
    blockerActivity: UserAnalyticsBlockerActivityInterface;
}

export interface AssignedTasksCardPropsInterface {
    tasks: UserAnalyticsAssignedTaskInterface[];
}

export interface AlertsEngagementCardPropsInterface {
    alertsEngagement: UserAnalyticsAlertsEngagementInterface;
}

export interface RedFlagsCardPropsInterface {
    redFlags: UserAnalyticsRedFlagsInterface;
}

export interface CommentsActivityCardPropsInterface {
    commentsActivity: UserAnalyticsCommentsActivityInterface;
}

export interface UseUsersAddReturnInterface {
    form: AddUserFormStateInterface;
    errors: AddUserFormErrorsInterface;
    teams: TeamLiteInterface[];
    isCreating: boolean;
    setField: (field: keyof AddUserFormStateInterface, value: string) => void;
    submit: () => Promise<UserInterface | null>;
    reset: () => void;
}

export interface UseUsersToggleStatusReturnInterface {
    toggleStatus: (user: UserInterface) => Promise<void>;
}

export interface UseUsersAddArgsInterface {
    onCreated: () => void;
}
