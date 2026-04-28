import { t } from "@/hooks";
import type { AlertsTabsPropsInterface } from "@/interfaces";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui";

export const AlertsTabs = ({
    pendingCount,
    doneCount,
    pendingChildren,
    doneChildren,
}: AlertsTabsPropsInterface) => (
    <Tabs defaultValue="pending">
        <TabsList>
            <TabsTrigger value="pending">{t("Pending")} ({pendingCount})</TabsTrigger>
            <TabsTrigger value="done">{t("Done")} ({doneCount})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">{pendingChildren}</TabsContent>
        <TabsContent value="done" className="mt-4">{doneChildren}</TabsContent>
    </Tabs>
);
