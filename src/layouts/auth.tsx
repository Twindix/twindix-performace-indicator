import { Heart } from "lucide-react";
import { Outlet } from "react-router-dom";

export const AuthLayout = () => (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="flex-1 flex items-center justify-center w-full">
            <Outlet />
        </div>
        <footer className="py-4">
            <p className="text-center text-sm text-text-muted flex items-center justify-center gap-1.5 group">
                Developed with
                <Heart className="h-4 w-4 text-error animate-[heartbeat_1.5s_ease-in-out_infinite] group-hover:scale-125 transition-transform" />
                by
                <a
                    href="https://hawary.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:text-primary-dark transition-colors duration-200 hover:underline underline-offset-2"
                >
                    Mohamed Elhawary
                </a>
            </p>
        </footer>
    </div>
);
