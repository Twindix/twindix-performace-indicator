import * as yup from "yup";
import { TaskPriority } from "@/enums";

export const addTaskSchema = yup.object({
    title: yup.string().trim().required("Title is required"),
    description: yup.string().optional().default(""),
    assigneeId: yup.string().required("Please select an assignee"),
    priority: yup
        .mixed<TaskPriority>()
        .oneOf(Object.values(TaskPriority))
        .required()
        .default(TaskPriority.Medium),
    estimatedHours: yup
        .number()
        .min(0.5, "Estimated time must be at least 0.5 hours")
        .required("Estimated time is required"),
    attachments: yup.array().optional().default([]),
    initialComment: yup.string().optional().default(""),
});
