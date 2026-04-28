import { Header, QueryBoundary } from "@/components/shared";
import { ProfileSkeleton } from "@/components/skeletons";
import { t, useAuth, useEditProfileName, usePageLoader, usePermissions } from "@/hooks";

import { ProfileCard } from "./components";

export const ProfileView = () => {
    const isLoading = usePageLoader();
    const p = usePermissions();
    const { user } = useAuth();
    const { edit } = useEditProfileName();

    if (!user) return null;

    return (
        <QueryBoundary isLoading={isLoading} skeleton={<ProfileSkeleton />}>
            <div>
                <Header title={t("My Profile")} description={t("Your account details")} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <ProfileCard user={user} canEdit={p.auth.editProfile()} edit={edit} />
                </div>
            </div>
        </QueryBoundary>
    );
};
