import { Badge, Card, CardContent } from "@/atoms";
import { t } from "@/hooks";
import type { ProfileCardPropsInterface } from "@/interfaces/profile";
import { Avatar, AvatarFallback } from "@/ui";

import { ProfileInfoList } from "./ProfileInfoList";
import { ProfileNameEditor } from "./ProfileNameEditor";

export const ProfileCard = ({ user, canEdit, edit }: ProfileCardPropsInterface) => {
    const teamName = user.team?.name ?? "";

    return (
        <Card className="lg:row-span-2">
            <CardContent className="p-6 flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mb-4">
                    <AvatarFallback className="text-2xl font-bold">{user.avatar_initials}</AvatarFallback>
                </Avatar>

                <ProfileNameEditor user={user} canEdit={canEdit} edit={edit} />

                <p className="text-sm text-primary font-medium mt-1">{user.role_label}</p>
                <Badge variant="default" className="mt-2">{teamName} {t("Team")}</Badge>

                <ProfileInfoList user={user} />
            </CardContent>
        </Card>
    );
};
