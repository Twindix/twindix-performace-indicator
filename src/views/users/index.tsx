import { useState } from "react";
import { ArrowRight, MoreHorizontal, Plus, PowerOff, Trash2, UserCog, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Badge, Button, Card, CardContent, Input, Label } from "@/atoms";
import { EmptyState, Header } from "@/components/shared";
import { UserRole } from "@/enums";
import { t } from "@/hooks";
import type { UserInterface } from "@/interfaces";
import {
    Avatar, AvatarFallback,
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";
import { getStorageItem, setStorageItem, storageKeys } from "@/utils";

const ROLE_LABELS: Record<UserRole, string> = {
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

const emptyForm = { name: "", email: "", role: UserRole.FrontendEngineer, team: "Frontend", avatar: "" };

export const UsersView = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState<UserInterface[]>(() => getStorageItem<UserInterface[]>(storageKeys.teamMembers) ?? []);
    const [addOpen, setAddOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<UserInterface | null>(null);
    const [deactivateTarget, setDeactivateTarget] = useState<UserInterface | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});

    const save = (next: UserInterface[]) => {
        setStorageItem(storageKeys.teamMembers, next);
        setMembers(next);
    };

    const validate = () => {
        const e: Partial<typeof emptyForm> = {};
        if (!form.name.trim()) e.name = t("Required");
        if (!form.email.trim()) e.email = t("Required");
        if (!form.team.trim()) e.team = t("Required");
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleAdd = () => {
        if (!validate()) return;
        const initials = form.avatar.trim() || form.name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
        const newUser: UserInterface = {
            id: `usr-${Date.now()}`,
            name: form.name.trim(),
            email: form.email.trim(),
            role: form.role,
            team: form.team.trim() as unknown as UserInterface["team"],
            avatar: initials,
        };
        save([...members, newUser]);
        setAddOpen(false);
        setForm(emptyForm);
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        save(members.filter((m) => m.id !== deleteTarget.id));
        setDeleteTarget(null);
    };

    const handleToggleActive = () => {
        if (!deactivateTarget) return;
        const isActive = deactivateTarget.status !== "inactive";
        save(members.map((m) => m.id === deactivateTarget.id ? { ...m, status: isActive ? "inactive" : "active" } : m));
        setDeactivateTarget(null);
    };

    return (
        <div>
            <Header title={t("User Management")} description={t("Manage team members and view individual performance analytics")} />

            <div className="flex justify-end mb-6">
                <Button onClick={() => { setForm(emptyForm); setErrors({}); setAddOpen(true); }} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("Add User")}
                </Button>
            </div>

            {members.length === 0 ? (
                <EmptyState icon={UserCog} title={t("No Users")} description={t("Add team members to get started")} />
            ) : (
                <div className="flex flex-col gap-3">
                    {members.map((member) => {
                        const isInactive = member.status === "inactive";
                        return (
                            <Card key={member.id} className={`hover:shadow-md transition-shadow ${isInactive ? "opacity-60" : ""}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10 shrink-0">
                                            <AvatarFallback className="text-sm font-semibold">{member.avatar}</AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-semibold text-text-dark">{member.name}</p>
                                                <Badge variant="outline" className="text-xs">{ROLE_LABELS[member.role as UserRole] ?? member.role}</Badge>
                                                <Badge variant="secondary" className="text-xs">{typeof member.team === "string" ? member.team : member.team?.name}</Badge>
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
                                                    <DropdownMenuItem
                                                        className="gap-2 cursor-pointer"
                                                        onClick={() => setDeactivateTarget(member)}
                                                    >
                                                        {isInactive
                                                            ? <><Zap className="h-4 w-4 text-success" />{t("Activate")}</>
                                                            : <><PowerOff className="h-4 w-4 text-warning" />{t("Deactivate")}</>
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

            {/* Add Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserCog className="h-5 w-5 text-primary" />
                            {t("Add Team Member")}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="u-name">{t("Full Name")}</Label>
                                <Input id="u-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" className={errors.name ? "border-error" : ""} />
                                {errors.name && <p className="text-xs text-error">{errors.name}</p>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="u-email">{t("Email")}</Label>
                                <Input id="u-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" className={errors.email ? "border-error" : ""} />
                                {errors.email && <p className="text-xs text-error">{errors.email}</p>}
                            </div>
                        </div>

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
                                        {TEAM_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="u-avatar">{t("Avatar Initials")} <span className="text-text-muted text-xs">({t("optional, auto-generated if empty")})</span></Label>
                            <Input id="u-avatar" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value.toUpperCase().slice(0, 2) })} placeholder="JD" maxLength={2} className="w-24" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                        <DialogClose asChild><Button variant="outline">{t("Cancel")}</Button></DialogClose>
                        <Button onClick={handleAdd}>{t("Add Member")}</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Deactivate / Activate Confirm */}
            <Dialog open={!!deactivateTarget} onOpenChange={(o) => !o && setDeactivateTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className={deactivateTarget?.status === "inactive" ? "text-success" : "text-warning"}>
                            {deactivateTarget?.status === "inactive" ? t("Activate User") : t("Deactivate User")}
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-text-secondary py-2">
                        {deactivateTarget?.status === "inactive"
                            ? <>{t("Activate")} <span className="font-semibold text-text-dark">{deactivateTarget?.name}</span>? {t("They will regain access to the platform.")}</>
                            : <>{t("Deactivate")} <span className="font-semibold text-text-dark">{deactivateTarget?.name}</span>? {t("They will lose access until reactivated.")}</>
                        }
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeactivateTarget(null)}>{t("Cancel")}</Button>
                        <Button
                            variant={deactivateTarget?.status === "inactive" ? "default" : "outline"}
                            className={deactivateTarget?.status !== "inactive" ? "border-warning text-warning hover:bg-warning-light" : ""}
                            onClick={handleToggleActive}
                        >
                            {deactivateTarget?.status === "inactive" ? t("Activate") : t("Deactivate")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle className="text-error">{t("Remove User")}</DialogTitle></DialogHeader>
                    <p className="text-sm text-text-secondary py-2">
                        {t("Are you sure you want to remove")} <span className="font-semibold text-text-dark">{deleteTarget?.name}</span>? {t("This cannot be undone.")}
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t("Cancel")}</Button>
                        <Button variant="destructive" onClick={handleDelete}>{t("Remove")}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
