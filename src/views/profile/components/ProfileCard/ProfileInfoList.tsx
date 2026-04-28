import { Briefcase, Calendar, Mail, Shield, Users } from "lucide-react";

import { t } from "@/hooks";
import type { ProfileInfoListPropsInterface } from "@/interfaces/profile";
import { formatJoinedDate } from "@/lib/profile";

import { ProfileInfoRow } from "./ProfileInfoRow";

export const ProfileInfoList = ({ user }: ProfileInfoListPropsInterface) => {
    const teamName = user.team?.name ?? "";

    return (
        <div className="w-full mt-6 space-y-3">
            <ProfileInfoRow icon={Mail}>{user.email}</ProfileInfoRow>
            <ProfileInfoRow icon={Briefcase}>{user.role_label}</ProfileInfoRow>
            <ProfileInfoRow icon={Users}>{teamName} {t("Team")}</ProfileInfoRow>
            <ProfileInfoRow icon={Calendar}>
                {t("Joined")} {formatJoinedDate(user.created_at)}
            </ProfileInfoRow>
            <ProfileInfoRow icon={Shield}>{user.account_status}</ProfileInfoRow>
        </div>
    );
};
