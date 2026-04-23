import { useState } from "react";
import { Plus, X } from "lucide-react";

import { Button, Input, Label, Textarea } from "@/atoms";
import { MeetingType } from "@/enums";
import { t } from "@/hooks";
import type { RequestMeetingPayloadInterface } from "@/interfaces/meetings";
import {
    Checkbox,
    Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui";

import { MEETING_TYPE_LABEL } from "./constants";

interface AttendeeOption {
    id: string;
    full_name: string;
}

interface ProjectOption {
    id: string;
    name: string;
}

interface TeamOption {
    id: string;
    name: string;
}

interface RequestMeetingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    attendees: AttendeeOption[];
    projects: ProjectOption[];
    teams: TeamOption[];
    onSubmit: (payload: RequestMeetingPayloadInterface) => void;
}

interface SlotDraft {
    date: string;
    start_time: string;
    end_time: string;
}

const emptySlot = (): SlotDraft => ({ date: "", start_time: "", end_time: "" });

export const RequestMeetingDialog = ({
    open,
    onOpenChange,
    attendees,
    projects,
    teams,
    onSubmit,
}: RequestMeetingDialogProps) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [agenda, setAgenda] = useState("");
    const [location, setLocation] = useState("");
    const [type, setType] = useState<MeetingType | "">("");
    const [projectId, setProjectId] = useState<string>("");
    const [teamId, setTeamId] = useState<string>("");
    const [attendeeIds, setAttendeeIds] = useState<string[]>([]);
    const [suggestTimes, setSuggestTimes] = useState(false);
    const [fixedDate, setFixedDate] = useState("");
    const [fixedStart, setFixedStart] = useState("");
    const [fixedEnd, setFixedEnd] = useState("");
    const [slots, setSlots] = useState<SlotDraft[]>([emptySlot()]);

    const reset = () => {
        setTitle("");
        setDescription("");
        setAgenda("");
        setLocation("");
        setType("");
        setProjectId("");
        setTeamId("");
        setAttendeeIds([]);
        setSuggestTimes(false);
        setFixedDate("");
        setFixedStart("");
        setFixedEnd("");
        setSlots([emptySlot()]);
    };

    const toggleAttendee = (id: string) => {
        setAttendeeIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const updateSlot = (index: number, patch: Partial<SlotDraft>) => {
        setSlots((prev) => prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
    };

    const addSlot = () => setSlots((prev) => [...prev, emptySlot()]);
    const removeSlot = (index: number) =>
        setSlots((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

    const validSlots = slots.filter((slot) => slot.date && slot.start_time && slot.end_time);

    const canSubmit =
        title.trim().length > 0 &&
        type !== "" &&
        attendeeIds.length > 0 &&
        (suggestTimes
            ? validSlots.length >= 2
            : fixedDate !== "" && fixedStart !== "" && fixedEnd !== "");

    const handleSubmit = () => {
        if (!canSubmit || !type) return;
        onSubmit({
            title: title.trim(),
            description: description.trim() || undefined,
            agenda: agenda.trim() || undefined,
            location: location.trim() || undefined,
            type,
            project_id: projectId || null,
            team_id: teamId || null,
            attendee_ids: attendeeIds,
            date: suggestTimes ? null : fixedDate,
            start_time: suggestTimes ? null : fixedStart,
            end_time: suggestTimes ? null : fixedEnd,
            suggested_slots: suggestTimes ? validSlots : undefined,
        });
        reset();
        onOpenChange(false);
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
                        <Input
                            id="mt-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t("Meeting title")}
                        />
                    </div>

                    <div className="flex items-start gap-2 p-3 rounded-lg border border-border bg-muted/30">
                        <Checkbox
                            id="mt-suggest"
                            checked={suggestTimes}
                            onCheckedChange={(next) => setSuggestTimes(next === true)}
                            className="mt-0.5"
                        />
                        <div className="flex-1">
                            <Label htmlFor="mt-suggest" className="cursor-pointer font-medium">
                                {t("Suggest multiple times and let attendees vote")}
                            </Label>
                            <p className="text-[11px] text-text-muted mt-0.5">
                                {t("Attendees pick their preferred slot. You can add more and close voting anytime.")}
                            </p>
                        </div>
                    </div>

                    {suggestTimes ? (
                        <div className="space-y-2">
                            <Label>{t("Proposed Time Slots")}</Label>
                            {slots.map((slot, index) => (
                                <div key={index} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
                                    <Input
                                        type="date"
                                        value={slot.date}
                                        onChange={(e) => updateSlot(index, { date: e.target.value })}
                                    />
                                    <Input
                                        type="time"
                                        value={slot.start_time}
                                        onChange={(e) => updateSlot(index, { start_time: e.target.value })}
                                        className="w-28"
                                    />
                                    <Input
                                        type="time"
                                        value={slot.end_time}
                                        onChange={(e) => updateSlot(index, { end_time: e.target.value })}
                                        className="w-28"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9"
                                        onClick={() => removeSlot(index)}
                                        disabled={slots.length === 1}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" className="gap-1.5" onClick={addSlot}>
                                <Plus className="h-3.5 w-3.5" />
                                {t("Add another slot")}
                            </Button>
                            <p className="text-[11px] text-text-muted">{t("Add at least 2 slots for voting.")}</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-1.5">
                                <Label htmlFor="mt-date">{t("Date")}</Label>
                                <Input id="mt-date" type="date" value={fixedDate} onChange={(e) => setFixedDate(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="mt-start">{t("Start Time")}</Label>
                                    <Input id="mt-start" type="time" value={fixedStart} onChange={(e) => setFixedStart(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="mt-end">{t("End Time")}</Label>
                                    <Input id="mt-end" type="time" value={fixedEnd} onChange={(e) => setFixedEnd(e.target.value)} />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="mt-location">{t("Location / Link")}</Label>
                        <Input
                            id="mt-location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder={t("Room name or meeting link")}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>{t("Meeting Type")}</Label>
                            <Select value={type} onValueChange={(value) => setType(value as MeetingType)}>
                                <SelectTrigger><SelectValue placeholder={t("Select type")} /></SelectTrigger>
                                <SelectContent>
                                    {(Object.keys(MEETING_TYPE_LABEL) as MeetingType[]).map((key) => (
                                        <SelectItem key={key} value={key}>{t(MEETING_TYPE_LABEL[key])}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                            {attendees.map((a) => (
                                <label key={a.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer">
                                    <Checkbox
                                        checked={attendeeIds.includes(a.id)}
                                        onCheckedChange={() => toggleAttendee(a.id)}
                                    />
                                    <span className="text-sm text-text-dark">{a.full_name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="mt-desc">{t("Description")}</Label>
                        <Textarea id="mt-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="mt-agenda">{t("Notes / Agenda")}</Label>
                        <Textarea id="mt-agenda" rows={2} value={agenda} onChange={(e) => setAgenda(e.target.value)} />
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <DialogClose asChild>
                        <Button variant="outline">{t("Cancel")}</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={!canSubmit}>{t("Save")}</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
