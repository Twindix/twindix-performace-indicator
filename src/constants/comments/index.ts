export const commentsConstants = {
    errors: {
        fetchFailed: "Failed to load comments.",
        fetchDetailFailed: "Failed to load comment.",
        analyticsFailed: "Failed to load comments analytics.",
        createFailed: "Failed to post comment.",
        updateFailed: "Failed to update comment.",
        deleteFailed: "Failed to delete comment.",
        respondFailed: "Failed to respond to comment.",
        genericError: "Something went wrong.",
    },
    messages: {
        createSuccess: "Comment posted.",
        updateSuccess: "Comment updated.",
        deleteSuccess: "Comment deleted.",
        respondSuccess: "Response sent.",
    },
    emptyForm: {
        body: "",
        task_title: "",
        mentioned_user_ids: [] as string[],
    },
    responseStatusOptions: [
        { value: "all", label: "All Statuses" },
        { value: "responded", label: "Responded" },
        { value: "no_response", label: "No Response" },
    ],
};
