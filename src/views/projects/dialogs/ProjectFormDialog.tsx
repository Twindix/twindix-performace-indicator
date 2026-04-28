import { Button, Input, Label, Textarea } from "@/atoms";
import { projectStatusLabels, projectStatusOptions } from "@/constants";
import { t } from "@/hooks";
import type { ProjectFormDialogPropsInterface, ProjectStatus } from "@/interfaces";
import {
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";

export const ProjectFormDialog = ({
    isOpen,
    isEditMode,
    form,
    isSubmitting,
    onClose,
    onSubmit,
}: ProjectFormDialogPropsInterface) => {
    const { value, onPatch, getError, clearError } = form;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? t("Edit Project") : t("Add Project")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                    <div className="space-y-2">
                        <Label htmlFor="pj-name">{t("Name")} <span className="text-error">*</span></Label>
                        <Input
                            id="pj-name"
                            value={value.name}
                            onChange={(e) => { onPatch({ name: e.target.value }); clearError("name"); }}
                            placeholder={t("Project name")}
                        />
                        {getError("name") && <p className="text-xs text-error">{getError("name")}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pj-desc">{t("Description")}</Label>
                        <Textarea
                            id="pj-desc"
                            rows={3}
                            value={value.description}
                            onChange={(e) => { onPatch({ description: e.target.value }); clearError("description"); }}
                            placeholder={t("What is this project about?")}
                        />
                        {getError("description") && <p className="text-xs text-error">{getError("description")}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="pj-start">{t("Start Date")}</Label>
                            <Input
                                id="pj-start"
                                type="date"
                                value={value.start_date}
                                onChange={(e) => { onPatch({ start_date: e.target.value }); clearError("start_date"); }}
                            />
                            {getError("start_date") && <p className="text-xs text-error">{getError("start_date")}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pj-end">{t("End Date")}</Label>
                            <Input
                                id="pj-end"
                                type="date"
                                value={value.end_date}
                                onChange={(e) => { onPatch({ end_date: e.target.value }); clearError("end_date"); }}
                            />
                            {getError("end_date") && <p className="text-xs text-error">{getError("end_date")}</p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pj-status">{t("Status")}</Label>
                        <Select
                            value={value.status}
                            onValueChange={(next) => onPatch({ status: next as ProjectStatus })}
                        >
                            <SelectTrigger id="pj-status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {projectStatusOptions.map((status) => (
                                    <SelectItem key={status} value={status}>{t(projectStatusLabels[status])}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isSubmitting}>{t("Cancel")}</Button>
                    </DialogClose>
                    <Button onClick={onSubmit} loading={isSubmitting} disabled={!value.name.trim()}>
                        {isEditMode ? t("Save Changes") : t("Create Project")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
