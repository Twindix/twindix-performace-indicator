import { AlertTriangle } from "lucide-react";

import { Button, Logo } from "@/atoms";
import { buttonsConstants, msgsConstants } from "@/constants";
import { LogoSizeEnum } from "@/enums";

interface StackErrorProps {
    errorMessage: string;
}

export const StackError = ({ errorMessage }: StackErrorProps) => {
    const reloadHandler = () => window.location.reload();
    const goHomeHandler = () => { window.location.href = "/"; };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-4">
            <Logo size={LogoSizeEnum.LG} />
            <AlertTriangle className="size-12 text-error" />
            <div className="flex flex-col items-center gap-3">
                <h1 className="text-gradient text-4xl font-bold">{msgsConstants.stackErrorTitle}</h1>
                <p className="max-w-md text-center text-sm text-text-secondary">
                    {msgsConstants.stackErrorDescription}
                </p>
            </div>
            {errorMessage && (
                <div className="rounded-xl bg-muted p-4 max-w-md w-full">
                    <p className="text-xs font-mono text-error break-all">{errorMessage}</p>
                </div>
            )}
            <div className="flex gap-3">
                <Button onClick={reloadHandler}>{buttonsConstants.reload}</Button>
                <Button variant="outline" onClick={goHomeHandler}>{buttonsConstants.goHome}</Button>
            </div>
        </div>
    );
};
