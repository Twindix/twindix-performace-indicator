import { useEffect, useState } from "react";
import { ArrowLeft, Mail, Shield, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Badge, Button, Card, CardContent } from "@/atoms";
import { Header } from "@/components/shared";
import { t, useGetUser } from "@/hooks";
import type { UserInterface } from "@/interfaces";
import { Avatar, AvatarFallback } from "@/ui";

const ROLE_LABELS: Record<string, string> = {
    ceo: "CEO", cto: "CTO",
    senior_frontend_engineer: "Sr. Frontend Engineer",
    frontend_engineer: "Frontend Engineer",
    senior_backend_engineer: "Sr. Backend Engineer",
    ai_engineer: "AI Engineer",
    quality_control: "Quality Control",
    project_manager: "Project Manager",
    hr_manager: "HR Manager",
    data_analyst: "Data Analyst",
    uiux_designer: "UI/UX Designer",
};

export const UserDetailView = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { getHandler, isLoading } = useGetUser();
    const [user, setUser] = useState<UserInterface | null>(null);

    useEffect(() => {
        if (!userId) return;
        getHandler(userId).then((res) => { if (res) setUser(res); });
    }, [userId, getHandler]);

    if (!user && !isLoading) {
        return (
            <div>
                <Button variant="outline" onClick={() => navigate("/users")} className="gap-2 mb-6">
                    <ArrowLeft className="h-4 w-4" />{t("Back to Users")}
                </Button>
                <p className="text-text-muted">{t("User not found")}</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div>
            <div className="mb-4">
                <Button variant="outline" size="sm" onClick={() => navigate("/users")} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />{t("Back")}
                </Button>
            </div>

            <Header title={user.name} description={t("User details")} />

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 shrink-0">
                            <AvatarFallback className="text-xl font-semibold">{user.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-text-dark">{user.name}</h2>
                            <div className="flex items-center gap-2 flex-wrap mt-2">
                                <Badge variant="outline" className="gap-1"><Shield className="h-3 w-3" />{ROLE_LABELS[user.role] ?? user.role}</Badge>
                                <Badge variant="secondary" className="gap-1"><Users className="h-3 w-3" />{user.team}</Badge>
                                {user.status === "inactive" && <Badge variant="error">{t("Inactive")}</Badge>}
                            </div>
                            <div className="flex items-center gap-2 mt-3 text-sm text-text-muted">
                                <Mail className="h-4 w-4" />
                                <span>{user.email}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
