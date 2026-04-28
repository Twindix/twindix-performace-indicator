import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Copy, ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/atoms";
import { t } from "@/hooks";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    showStack: boolean;
    copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null, showStack: false, copied: false };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo });
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = "/";
    };

    handleCopyError = () => {
        const { error, errorInfo } = this.state;
        const text = [
            `Error: ${error?.message}`,
            `\nStack:\n${error?.stack}`,
            `\nComponent Stack:\n${errorInfo?.componentStack}`,
        ].join("\n");
        navigator.clipboard.writeText(text).then(() => {
            this.setState({ copied: true });
            setTimeout(() => this.setState({ copied: false }), 2000);
        });
    };

    toggleStack = () => {
        this.setState((prev) => ({ showStack: !prev.showStack }));
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        const { error, errorInfo, showStack, copied } = this.state;
        const isNetworkError = error?.message?.toLowerCase().includes("network") ||
            error?.message?.toLowerCase().includes("fetch") ||
            error?.message?.toLowerCase().includes("failed to load") ||
            error?.message?.toLowerCase().includes("chunk");

        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="w-full max-w-lg">
                    <div className="rounded-2xl border border-border bg-card p-8 shadow-lg text-center">
                        {/* Icon */}
                        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-6 ${isNetworkError ? "bg-warning-light" : "bg-error-light"}`}>
                            <AlertTriangle className={`h-8 w-8 ${isNetworkError ? "text-warning" : "text-error"}`} />
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-text-dark mb-2">
                            {isNetworkError ? t("Connection Error") : t("Something Went Wrong")}
                        </h1>

                        {/* Description */}
                        <p className="text-sm text-text-secondary mb-6 max-w-sm mx-auto">
                            {isNetworkError
                                ? t("Unable to connect to the server. Please check your internet connection and try again.")
                                : t("An unexpected error occurred. The error has been logged and our team will look into it.")}
                        </p>

                        {/* Error message */}
                        <div className="rounded-xl bg-muted p-4 mb-6 text-start">
                            <p className="text-xs font-mono text-error break-all">{error?.message}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 justify-center mb-4">
                            <Button onClick={this.handleReload} className="gap-2">
                                <RefreshCw className="h-4 w-4" />
                                {t("Reload Page")}
                            </Button>
                            <Button variant="outline" onClick={this.handleGoHome}>
                                {t("Go to Dashboard")}
                            </Button>
                        </div>

                        {/* Stack trace toggle */}
                        <div className="mt-4">
                            <button
                                onClick={this.toggleStack}
                                className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                            >
                                {showStack ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                {showStack ? t("Hide Technical Details") : t("Show Technical Details")}
                            </button>

                            {showStack && (
                                <div className="mt-3 rounded-xl bg-muted border border-border overflow-hidden">
                                    <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                                        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{t("Stack Trace")}</span>
                                        <button
                                            onClick={this.handleCopyError}
                                            className="inline-flex items-center gap-1 text-[10px] text-text-muted hover:text-primary transition-colors cursor-pointer"
                                        >
                                            <Copy className="h-3 w-3" />
                                            {copied ? t("Copied!") : t("Copy")}
                                        </button>
                                    </div>
                                    <pre className="p-3 text-[10px] font-mono text-text-secondary overflow-auto max-h-48 text-start leading-relaxed scrollbar-thin">
                                        {error?.stack}
                                        {errorInfo?.componentStack && (
                                            <>
                                                {"\n\n--- Component Stack ---\n"}
                                                {errorInfo.componentStack}
                                            </>
                                        )}
                                    </pre>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <p className="mt-6 text-[10px] text-text-muted">
                            {t("Twindix Performance Indicator v0.1")}
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}
