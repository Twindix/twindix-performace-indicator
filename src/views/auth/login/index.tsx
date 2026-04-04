import { Activity } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Input, Label } from "@/atoms";
import { APP_NAME, DEMO_EMAIL, DEMO_PASSWORD, routesData } from "@/data";
import { useAuth } from "@/hooks";

export const LoginView = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { onLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError("");
        const success = onLogin(email, password);
        if (success) {
            navigate(routesData.dashboard);
        } else {
            setError("Invalid credentials. Please try again.");
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
                <div className="flex flex-col items-center mb-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-4 shadow-md">
                        <Activity className="h-7 w-7" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-dark">{APP_NAME}</h1>
                    <p className="text-sm text-text-secondary mt-1">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    {error && <p className="text-sm text-error font-medium">{error}</p>}

                    <Button type="submit" className="w-full mt-2 h-11 text-base font-semibold">Sign In</Button>
                </form>

                <div className="mt-6 rounded-xl bg-muted p-4">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 text-center">Demo Credentials</p>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-text-muted w-16">Email:</span>
                            <code className="text-xs font-semibold text-primary bg-primary-lighter/50 px-2 py-1 rounded-md flex-1">{DEMO_EMAIL}</code>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-text-muted w-16">Password:</span>
                            <code className="text-xs font-semibold text-primary bg-primary-lighter/50 px-2 py-1 rounded-md flex-1">{DEMO_PASSWORD}</code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
