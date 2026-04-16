import { WifiOff } from "lucide-react";

import { Button, Logo } from "@/atoms";
import { buttonsConstants, msgsConstants } from "@/constants";
import { LogoSizeEnum } from "@/enums";

export const NetworkError = () => {
    const reloadHandler = () => window.location.reload();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-4">
            <Logo size={LogoSizeEnum.LG} />
            <WifiOff className="size-12 text-text-muted" />
            <div className="flex flex-col items-center gap-3">
                <h1 className="text-gradient text-4xl font-bold">{msgsConstants.networkErrorTitle}</h1>
                <p className="max-w-md text-center text-sm text-text-secondary">
                    {msgsConstants.networkErrorDescription}
                </p>
            </div>
            <Button onClick={reloadHandler}>
                {buttonsConstants.tryAgain}
            </Button>
        </div>
    );
};
