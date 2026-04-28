import { Badge, Card, CardContent } from "@/atoms";
import { t } from "@/hooks";
import type { ProfileCardPropsInterface } from "@/interfaces/users";
import { Avatar, AvatarFallback } from "@/ui";

export const ProfileCard = ({ user }: ProfileCardPropsInterface) => (
    <Card>
        <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
            <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl font-bold">{user.avatar_initials}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold text-text-dark">{user.full_name}</p>
                <p className="text-xs text-text-muted mt-0.5">{user.email}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
                <Badge variant="outline">{user.role_label}</Badge>
                <Badge variant="secondary">{user.team || t("No Team")}</Badge>
            </div>
        </CardContent>
    </Card>
);
