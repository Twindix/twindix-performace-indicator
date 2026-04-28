import { Card, CardContent, CardHeader, CardTitle } from "@/atoms";
import type { ActivityCardPropsInterface } from "@/interfaces/users";
import { cn } from "@/utils";

export const ActivityCard = ({ icon: Icon, title, children, titleSize = "base" }: ActivityCardPropsInterface) => (
    <Card>
        <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", titleSize === "sm" ? "text-sm" : "text-base")}>
                {Icon && <Icon className="h-4 w-4" />}{title}
            </CardTitle>
        </CardHeader>
        {children}
    </Card>
);
