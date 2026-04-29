import React, { createContext, useContext, useEffect, type ReactNode } from "react";

import { Card, CardContent } from "@/atoms";
import { t, useSettings } from "@/hooks";
import type { PageHeaderAnalyticItemInterface, PageHeaderRootPropsInterface } from "@/interfaces";
import { cn } from "@/utils";

import { AnimatedNumber } from "./animated-number";

const Ctx = createContext<{ compact: boolean }>({ compact: false });

const colClass: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
};

const PageHeaderAnalytics = ({ items }: { items: PageHeaderAnalyticItemInterface[] }) => {
    const { compact } = useContext(Ctx);
    const gridCols = colClass[Math.min(items.length, 4)] ?? "grid-cols-2 lg:grid-cols-4";
    return (
        <div className={cn("grid", gridCols, compact ? "gap-2 mt-3" : "gap-4 mt-6")}>
            {items.map((item, i) => (
                <Card key={i}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", item.iconWrapperClassName ?? "bg-primary-lighter")}>
                                <item.icon className={cn("h-5 w-5", item.iconClassName ?? "text-primary")} />
                            </div>
                            <div>
                                <p className={cn("text-2xl font-bold", item.valueClassName ?? "text-text-dark")}>
                                    <AnimatedNumber value={item.value} />
                                </p>
                                <p className="text-xs text-text-muted">{t(item.label)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
PageHeaderAnalytics.displayName = "PageHeaderAnalytics";

const PageHeaderActions = ({ children }: { children: ReactNode }) => (
    <div className="flex items-center gap-2 flex-wrap">{children}</div>
);
PageHeaderActions.displayName = "PageHeaderActions";

const PageHeaderRoot = ({ title, description, children }: PageHeaderRootPropsInterface) => {
    const [settings] = useSettings();
    const compact = settings.compactView;

    useEffect(() => {
        document.title = `${t("Twindix")} ${t("Performance Indicator")} | ${title}`;
        return () => { document.title = `${t("Twindix")} ${t("Performance Indicator")}`; };
    }, [title]);

    const childArray = React.Children.toArray(children);
    const actionsChild = childArray.find(
        (c) => React.isValidElement(c) && (c.type as { displayName?: string }).displayName === "PageHeaderActions",
    );
    const analyticsChild = childArray.find(
        (c) => React.isValidElement(c) && (c.type as { displayName?: string }).displayName === "PageHeaderAnalytics",
    );

    return (
        <Ctx.Provider value={{ compact }}>
            <div className={cn("flex flex-col", compact ? "mb-3" : "mb-6")}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                        <h1 className={cn("font-bold text-text-dark", compact ? "text-lg" : "text-xl sm:text-2xl")}>{title}</h1>
                        {description && (
                            <p className={cn("text-text-secondary mt-1", compact ? "text-xs" : "text-xs sm:text-sm")}>{description}</p>
                        )}
                    </div>
                    {actionsChild}
                </div>
                {analyticsChild}
            </div>
        </Ctx.Provider>
    );
};

export const PageHeader = Object.assign(PageHeaderRoot, {
    Actions: PageHeaderActions,
    Analytics: PageHeaderAnalytics,
});
