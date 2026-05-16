import { useState } from "react";
import { Plus, X } from "lucide-react";

import { Button, Input, Label, Textarea } from "@/atoms";
import { t, useCreateMeeting, useFormErrors, useProjectsListLite, useTeamsListLite, useUsersListLite } from "@/hooks";
import type { CreateMeetingTimeSlotPayloadInterface, MeetingTypeApi } from "@/interfaces";
import {
    Checkbox,
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";

import { MEETING_TYPE_LABEL } from "./constants";

interface RequestMeetingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated?: () => void;
}

const emptySlot = (): CreateMeetingTimeSlotPayloadInterface => ({ date: "", start_time: "", end_time: "" });

export const RequestMeetingDialog = ({ open, onOpenChange, onCreated }: RequestMeetingDialogProps) => {
    const { projects } = useProjectsListLite();
    const { teams } = useTeamsListLite();
    const { users } = useUsersListLite();
    const { setFieldErrors, getError, clear: clearFieldErrors } = useFormErrors();
    const { createHandler, isLoading } = useCreateMeeting({ onFieldErrors: setFieldErrors });

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [notes, setNotes] = useState("");
    const [location, setLocation] = useState("");
    const [meetingType, setMeetingType] = useState<MeetingTypeApi | "">("");
    const [projectId, setProjectId] = useState<string>("");
    const [teamId, setTeamId] = useState<string>("");
    const [attendeeIds, setAttendeeIds] = useState<string[]>([]);
    const [slots, setSlots] = useState<CreateMeetingTimeSlotPayloadInterface[]>([emptySlot()]);

    const reset = () => {
        setTitle("");
        setDescription("");
        setNotes("");
        setLocation("");
        setMeetingType("");
        setProjectId("");
        setTeamId("");
        setAttendeeIds([]);
        setSlots([emptySlot()]);
        clearFieldErrors();
    };

    const toggleAttendee = (id: string) => {
        setAttendeeIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const updateSlot = (index: number, patch: Partial<CreateMeetingTimeSlotPayloadInterface>) => {
        setSlots((prev) => prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
    };

    const addSlot = () => setSlots((prev) => [...prev, emptySlot()]);
    const removeSlot = (index: number) =>
        setSlots((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

    const validSlots = slots.filter((slot) => slot.date && slot.start_time && slot.end_time);

    const canSubmit =
        title.trim().length > 0 &&
        meetingType !== "" &&
        attendeeIds.length > 0 &&
        validSlots.length >= 1 &&
        !isLoading;

    const handleSubmit = async () => {
        if (!canSubmit || !meetingType) return;
        const result = await createHandler({
            title: title.trim(),
            description: description.trim() || undefined,
            notes: notes.trim() || undefined,
            location: location.trim() || undefined,
            meeting_type: meetingType,
            project_id: projectId || undefined,
            team_id: teamId || undefined,
            attendee_ids: attendeeIds,
            time_slots: validSlots,
        });
        if (result) {
            reset();
            onCreated?.();
            onOpenChange(false);
        }
    };

    const handleCancel = () => {
        reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleCancel())}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("Request a Meeting")}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="mt-title">{t("Title")}</Label>
                        <Input id="mt-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Meeting title")} />
                        {getError("title") && <p className="text-[11px] text-error">{getError("title")}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>{t("Proposed Time Slots")}</Label>
                        {slots.map((slot, index) => (
                            <div key={index} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
                                <Input type="date" value={slot.date} onChange={(e) => updateSlot(index, { date: e.target.value })} />
                                <Input type="time" value={slot.start_time} onChange={(e) => updateSlot(index, { start_time: e.target.value })} className="w-28" />
                                <Input type="time" value={slot.end_time} onChange={(e) => updateSlot(index, { end_time: e.target.value })} className="w-28" />
                                <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeSlot(index)} disabled={slots.length === 1}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={addSlot}>
                            <Plus className="h-3.5 w-3.5" />
                            {t("Add another slot")}
                        </Button>
                        <p className="text-[11px] text-text-muted">{t("Attendees vote on which slot they prefer. At least 1 slot required.")}</p>
                        {getError("time_slots") && <p className="text-[11px] text-error">{getError("time_slots")}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="mt-location">{t("Location / Link")}</Label>
                        <Input id="mt-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("Room name or meeting link")} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>{t("Meeting Type")}</Label>
                            <Select value={meetingType} onValueChange={(value) => setMeetingType(value as MeetingTypeApi)}>
                                <SelectTrigger><SelectValue placeholder={t("Select type")} /></SelectTrigger>
                                <SelectContent>
                                    {(Object.keys(MEETING_TYPE_LABEL) as MeetingTypeApi[]).map((key) => (
                                        <SelectItem key={key} value={key}>{t(MEETING_TYPE_LABEL[key])}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {getError("meeting_type") && <p className="text-[11px] text-error">{getError("meeting_type")}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>{t("Team (optional)")}</Label>
                            <Select value={teamId} onValueChange={setTeamId}>
                                <SelectTrigger><SelectValue placeholder={t("Optional")} /></SelectTrigger>
                                <SelectContent>
                                    {teams.map((team) => (
                                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t("Project (optional)")}</Label>
                        <Select value={projectId} onValueChange={setProjectId}>
                            <SelectTrigger><SelectValue placeholder={t("Optional")} /></SelectTrigger>
                            <SelectContent>
                                {projects.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t("Attendees")} <span className="text-error">*</span></Label>
                        <div className="rounded-lg border border-border max-h-40 overflow-y-auto p-2 space-y-1">
                            {users.length === 0 ? (
                                <p className="text-xs text-text-muted px-2 py-1.5">{t("No users available.")}</p>
                            ) : (
                                users.map((u) => (
                                    <label key={u.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer">
                                        <Checkbox checked={attendeeIds.includes(u.id)} onCheckedChange={() => toggleAttendee(u.id)} />
                                        <span className="text-sm text-text-dark">{u.full_name}</span>
                                    </label>
                                ))
                            )}
                        </div>
                        {getError("attendee_ids") && <p className="text-[11px] text-error">{getError("attendee_ids")}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="mt-desc">{t("Description")}</Label>
                        <Textarea id="mt-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="mt-notes">{t("Notes / Agenda")}</Label>
                        <Textarea id="mt-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isLoading}>{t("Cancel")}</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={!canSubmit}>
                        {isLoading ? t("Creating...") : t("Save")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
