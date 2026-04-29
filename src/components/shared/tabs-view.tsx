import type { ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui";

interface TabItem {
    value: string;
    label: string;
    count?: number;
    children: ReactNode;
}

export const TabsView = ({ tabs, defaultValue }: { tabs: TabItem[]; defaultValue?: string }) => (
    <Tabs defaultValue={defaultValue ?? tabs[0]?.value}>
        <TabsList>
            {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ""}
                </TabsTrigger>
            ))}
        </TabsList>
        {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
                {tab.children}
            </TabsContent>
        ))}
    </Tabs>
);
