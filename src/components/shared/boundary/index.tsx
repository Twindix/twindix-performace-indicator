import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

import { checkIsNetworkErrorHandler, getErrorMessageHandler } from "@/utils";

import { NetworkError } from "../network/network-error";
import { StackError } from "../stack";

export class BoundaryErrorClass extends Component<
    { children: ReactNode },
    {
        error: unknown;
        hasError: boolean;
    }
> {
    state = {
        error: null,
        hasError: false,
    };

    static getDerivedStateFromError(error: unknown) {
        return {
            error,
            hasError: true,
        };
    }

    componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
        console.error(error, errorInfo);
    }

    render() {
        const { error, hasError } = this.state;
        const { children } = this.props;

        if (!hasError) return children;

        if (checkIsNetworkErrorHandler(error)) return <NetworkError />;

        return <StackError errorMessage={getErrorMessageHandler(error)} />;
    }
}
