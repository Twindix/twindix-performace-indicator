import { Plus } from "lucide-react";

import { Button } from "@/atoms";
import { Header } from "@/components/shared";
import { t } from "@/hooks";
import type { CommentsHeaderPropsInterface } from "@/interfaces";

export const CommentsHeader = ({ canAdd, onAdd }: CommentsHeaderPropsInterface) => (
    <Header
        title={t("Comments Log")}
        description={t("Track all task comments, mentions, and responses")}
        actions={
            canAdd ? (
                <Button onClick={onAdd} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("Add Comment")}
                </Button>
            ) : null
        }
    />
);
