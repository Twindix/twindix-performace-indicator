import type { UsersListPropsInterface } from "@/interfaces/users";

import { UserCard } from "./UserCard";

export const UsersList = ({ users, canEdit, onToggleStatus, onView }: UsersListPropsInterface) => (
    <div className="flex flex-col gap-3">
        {users.map((user) => (
            <UserCard
                key={user.id}
                user={user}
                canEdit={canEdit}
                onToggleStatus={onToggleStatus}
                onView={onView}
            />
        ))}
    </div>
);
