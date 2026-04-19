import { Briefcase, Mail, Pencil, Shield, Users } from "lucide-react";
import { useState } from "react";

import { Badge, Card, CardContent, Button, Input } from "@/atoms";
import { Header } from "@/components/shared";
import { ProfileSkeleton } from "@/components/skeletons";
import { t, useAuth, usePageLoader, useUpdateProfile } from "@/hooks";
import { Avatar, AvatarFallback } from "@/ui";

const roleLabels: Record<string, string> = {
    ceo: "Chief Executive Officer",
    cto: "Chief Technology Officer",
    senior_frontend_engineer: "Senior Frontend Engineer",
    frontend_engineer: "Frontend Engineer",
    senior_backend_engineer: "Senior Backend Engineer",
    ai_engineer: "AI Engineer",
    quality_control: "Quality Control",
    project_manager: "Project Manager",
    hr_manager: "HR Manager",
    data_analyst: "Data Analyst",
    uiux_designer: "UI/UX Product Designer",
};

export const ProfileView = () => {
    const isLoading = usePageLoader();
    const { user, onUpdateUser } = useAuth();
    const { updateHandler: updateProfileHandler, isLoading: isSaving } = useUpdateProfile();
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(user?.full_name ?? "");

    const handleSave = async () => {
        if (!editedName.trim()) return;
        const res = await updateProfileHandler({ full_name: editedName.trim() });
        if (res) {
            onUpdateUser({ full_name: res.full_name });
            setIsEditingName(false);
        }
    };

    if (!user) return null;
    if (isLoading) return <ProfileSkeleton />;

    return (
        <div>
            <Header title={t("My Profile")} description={t("Your account details")} />

            <Card className="max-w-2xl">
                <CardContent className="p-6 flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mb-4">
                        <AvatarFallback className="text-2xl font-bold">{user.avatar_initials}</AvatarFallback>
                    </Avatar>
                    {isEditingName ? (
                        <div className="flex items-center gap-2 mt-1">
                            <Input
                                autoFocus
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSave();
                                    else if (e.key === "Escape") { setEditedName(user.full_name); setIsEditingName(false); }
                                }}
                                className="text-xl font-bold text-center h-9"
                            />
                            <Button size="sm" onClick={handleSave} disabled={isSaving || !editedName.trim()}>
                                {isSaving ? t("Saving...") : t("Save")}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setEditedName(user.full_name); setIsEditingName(false); }}>{t("Cancel")}</Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-text-dark">{user.full_name}</h2>
                            <button onClick={() => { setEditedName(user.full_name); setIsEditingName(true); }} className="text-text-muted hover:text-text-dark transition-colors cursor-pointer" aria-label="Edit name">
                                <Pencil className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                    <p className="text-sm text-primary font-medium mt-1">{roleLabels[user.role] ?? user.role}</p>
                    <Badge variant="default" className="mt-2">{user.team} {t("Team")}</Badge>

                    <div className="w-full mt-6 space-y-3">
                        <div className="flex items-center gap-3 text-sm text-text-secondary">
                            <Mail className="h-4 w-4 text-text-muted" />
                            <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-text-secondary">
                            <Briefcase className="h-4 w-4 text-text-muted" />
                            <span>{roleLabels[user.role] ?? user.role}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-text-secondary">
                            <Users className="h-4 w-4 text-text-muted" />
                            <span>{user.team} {t("Team")}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-text-secondary">
                            <Shield className="h-4 w-4 text-text-muted" />
                            <span>{user.status === "inactive" ? t("Inactive") : t("Active Member")}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
