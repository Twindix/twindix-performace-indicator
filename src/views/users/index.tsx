import { useState } from "react";
import { Plus, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/atoms";
import { EmptyState, EntityList, Header, QueryBoundary } from "@/components/shared";
import { UsersSkeleton } from "@/components/skeletons";
import { t, usePermissions, useUsersList, useUsersToggleStatus } from "@/hooks";

import { UserCard } from "./components";
import { AddUserDialog } from "./dialogs";

export const UsersView = () => {
    const navigate = useNavigate();
    const p = usePermissions();
    const { users, isLoading, refetch, patchUserLocal } = useUsersList();
    const { toggleStatus } = useUsersToggleStatus(patchUserLocal);

    const [addOpen, setAddOpen] = useState(false);

    return (
        <div>
            <Header
                title={t("User Management")}
                description={t("Manage team members and view individual performance analytics")}
            />

            {p.users.create() && (
                <div className="flex justify-end mb-6">
                    <Button onClick={() => setAddOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t("Add User")}
                    </Button>
                </div>
            )}

            <QueryBoundary
                isLoading={isLoading}
                skeleton={<UsersSkeleton />}
                empty={users.length === 0}
                emptyState={<EmptyState icon={UserCog} title={t("No Users")} description={t("Add team members to get started")} />}
            >
                <EntityList
                    items={users}
                    renderItem={(user) => (
                        <UserCard
                            key={user.id}
                            user={user}
                            canEdit={p.users.edit()}
                            onToggleStatus={toggleStatus}
                            onView={(id) => navigate(`/users/${id}`)}
                        />
                    )}
                />
            </QueryBoundary>

            <AddUserDialog open={addOpen} onOpenChange={setAddOpen} onCreated={refetch} />
        </div>
    );
};
