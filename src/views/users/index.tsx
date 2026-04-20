import { useState } from "react";
import { ArrowRight, Edit, MoreHorizontal, Plus, PowerOff, Trash2, UserCog, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Badge, Button, Card, CardContent, Input, Label } from "@/atoms";
import { EmptyState, Header } from "@/components/shared";
import { UsersProvider, useUsers } from "@/contexts";
import { UserRole } from "@/enums";
import { t, useCreateUser, useDeleteUser, useUpdateUser } from "@/hooks";
import type { UserInterface } from "@/interfaces";
import {
    Avatar, AvatarFallback,
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";

const getTeamName = (team?: string | { id: string; name: string }): string =>
    typeof team === "object" ? team.name : (team ?? "");

const ROLE_LABELS: Record<string, string> = {
    [UserRole.CEO]: "CEO",
    [UserRole.CTO]: "CTO",
    [UserRole.SeniorFrontendEngineer]: "Sr. Frontend Engineer",
    [UserRole.FrontendEngineer]: "Frontend Engineer",
    [UserRole.SeniorBackendEngineer]: "Sr. Backend Engineer",
    [UserRole.AIEngineer]: "AI Engineer",
    [UserRole.QualityControl]: "Quality Control",
    [UserRole.ProjectManager]: "Project Manager",
    [UserRole.HRManager]: "HR Manager",
    [UserRole.DataAnalyst]: "Data Analyst",
    [UserRole.UIUXDesigner]: "UI/UX Designer",
};

const TEAM_OPTIONS = ["Frontend", "Backend", "Leadership", "HR", "Product", "QA", "AI", "Data", "Design"];

const emptyForm = { name: "", email: "", password: "", role: UserRole.FrontendEngineer, team: "Frontend" };

export const UsersView = () => (
    <UsersProvider>
        <UsersViewInner />
    </UsersProvider>
);

const UsersViewInner = () => {
    const navigate = useNavigate();
    const { users, isLoading, patchUserLocal, removeUserLocal } = useUsers();
    const { createHandler: createUserHandler, isLoading: isCreating } = useCreateUser();
    const { updateHandler: updateUserHandler, isLoading: isUpdating } = useUpdateUser();
    const { deleteHandler: deleteUserHandler } = useDeleteUser();

    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<UserInterface | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<UserInterface | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});

    const validate = (requirePassword: boolean) => {
        const e: Partial<typeof emptyForm> = {};
        if (!form.name.trim()) e.name = t("Required");
        if (!form.email.trim()) e.email = t("Required");
        if (!form.team.trim()) e.team = t("Required");
        if (requirePassword && !form.password.trim()) e.password = t("Required");
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const openAdd = () => { setForm(emptyForm); setErrors({}); setAddOpen(true); };

    const openEdit = (user: UserInterface) => {
        setForm({
            name: user.full_name,
            email: user.email,
            password: "",
            role: (user.role_tier ?? UserRole.FrontendEngineer) as UserRole,
            team: getTeamName(user.team) || "Frontend",
        });
        setErrors({});
        setEditTarget(user);
    };

    const handleAdd = async () => {
        if (!validate(true)) return;
        const created = await createUserHandler({
            full_name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            role_tier: form.role,
            role_label: ROLE_LABELS[form.role] ?? form.role,
            team_id: form.team,
        });
        if (created) {
            patchUserLocal(created);
            setAddOpen(false);
            setForm(emptyForm);
        }
    };

    const handleEdit = async () => {
        if (!editTarget) return;
        if (!validate(false)) return;
        const updated = await updateUserHandler(editTarget.id, {
            full_name: form.name.trim(),
            email: form.email.trim(),
            role_tier: form.role,
            role_label: ROLE_LABELS[form.role] ?? form.role,
            team_id: form.team,
        });
        if (updated) {
            patchUserLocal(updated);
            setEditTarget(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const ok = await deleteUserHandler(deleteTarget.id);
        if (ok) {
            removeUserLocal(deleteTarget.id);
            setDeleteTarget(null);
        }
    };

    return (
        <div>
            <Header title={t("User Management")} description={t("Manage team members and view individual performance analytics")} />

            <div className="flex justify-end mb-6">
                <Button onClick={openAdd} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("Add User")}
                </Button>
            </div>

            {isLoading ? null : users.length === 0 ? (
                <EmptyState icon={UserCog} title={t("No Users")} description={t("Add team members to get started")} />
            ) : (
                <div className="flex flex-col gap-3">
                    {users.map((member) => {
                        const isInactive = member.account_status === "inactive";
                        return (
                            <Card key={member.id} className={`hover:shadow-md transition-shadow ${isInactive ? "opacity-60" : ""}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10 shrink-0">
                                            <AvatarFallback className="text-sm font-semibold">{member.avatar_initials}</AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-semibold text-text-dark">{member.full_name}</p>
                                                <Badge variant="outline" className="text-xs">{member.role_label ?? member.role_tier}</Badge>
                                                <Badge variant="secondary" className="text-xs">{getTeamName(member.team)}</Badge>
                                                {isInactive && <Badge variant="error" className="text-xs">{t("Inactive")}</Badge>}
                                            </div>
                                            <p className="text-xs text-text-muted mt-0.5">{member.email}</p>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-1.5 rounded-md text-text-muted hover:text-text-dark hover:bg-accent transition-colors cursor-pointer">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-44">
                                                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openEdit(member)}>
                                                        <Edit className="h-4 w-4" />
                                                        {t("Edit")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="gap-2 text-error focus:text-error cursor-pointer"
                                                        onClick={() => setDeleteTarget(member)}
                                                    >
                                                        {isInactive
                                                            ? <><Zap className="h-4 w-4" />{t("Activate")}</>
                                                            : <><PowerOff className="h-4 w-4" />{t("Deactivate")}</>
                                                        }
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="gap-2 text-error focus:text-error cursor-pointer"
                                                        onClick={() => setDeleteTarget(member)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        {t("Delete")}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            <button
                                                onClick={() => navigate(`/users/${member.id}`)}
                                                className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary-lighter transition-colors cursor-pointer"
                                                aria-label="View analytics"
                                            >
                                                <ArrowRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Add / Edit Dialog */}
            <Dialog open={addOpen || !!editTarget} onOpenChange={(open) => { if (!open) { setAddOpen(false); setEditTarget(null); } }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserCog className="h-5 w-5 text-primary" />
                            {editTarget ? t("Edit Team Member") : t("Add Team Member")}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="u-name">{t("Full Name")} <span className="text-error">*</span></Label>
                                <Input id="u-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" className={errors.name ? "border-error" : ""} />
                                {errors.name && <p className="text-xs text-error">{errors.name}</p>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="u-email">{t("Email")} <span className="text-error">*</span></Label>
                                <Input id="u-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" className={errors.email ? "border-error" : ""} />
                                {errors.email && <p className="text-xs text-error">{errors.email}</p>}
                            </div>
                        </div>

                        {!editTarget && (
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="u-password">{t("Password")} <span className="text-error">*</span></Label>
                                <Input id="u-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={errors.password ? "border-error" : ""} />
                                {errors.password && <p className="text-xs text-error">{errors.password}</p>}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label>{t("Role")}</Label>
                                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(ROLE_LABELS).map(([val, label]) => (
                                            <SelectItem key={val} value={val}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>{t("Team")}</Label>
                                <Select value={form.team} onValueChange={(v) => setForm({ ...form, team: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {TEAM_OPTIONS.map((tm) => <SelectItem key={tm} value={tm}>{tm}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                        <DialogClose asChild><Button variant="outline">{t("Cancel")}</Button></DialogClose>
                        <Button onClick={editTarget ? handleEdit : handleAdd} disabled={isCreating || isUpdating}>
                            {(isCreating || isUpdating) ? t("Saving...") : editTarget ? t("Save Changes") : t("Add Member")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete/Deactivate Confirm */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle className="text-error">{t("Deactivate User")}</DialogTitle></DialogHeader>
                    <p className="text-sm text-text-secondary py-2">
                        {t("Are you sure you want to deactivate")} <span className="font-semibold text-text-dark">{deleteTarget?.full_name}</span>? {t("They will lose access.")}
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t("Cancel")}</Button>
                        <Button variant="destructive" onClick={handleDelete}>{t("Deactivate")}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
