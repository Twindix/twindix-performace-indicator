import { DEMO_USERS } from "@/data";
import { t } from "@/hooks";

export const DemoCredentials = () => (
    <div className="mt-6 rounded-xl bg-muted p-4">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 text-center">
            {t("Demo Credentials")}
        </p>

        <div className="flex flex-col gap-3">
            {DEMO_USERS.map((user) => (
                <div key={user.role} className="flex flex-col gap-2">
                    <p className="text-xs font-semibold text-primary text-center">
                        {user.role}
                    </p>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-text-muted w-20">
                            {t("Email")}:
                        </span>
                        <code className="text-xs font-semibold text-primary bg-primary-lighter/50 px-2 py-1 rounded-md flex-1">
                            {user.email}
                        </code>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-text-muted w-20">
                            {t("Password")}:
                        </span>
                        <code className="text-xs font-semibold text-primary bg-primary-lighter/50 px-2 py-1 rounded-md flex-1">
                            {user.password}
                        </code>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
