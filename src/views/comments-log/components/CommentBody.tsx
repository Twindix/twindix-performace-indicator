import type { CommentCardBodyPropsInterface } from "@/interfaces";

export const CommentBody = ({ body, onClick }: CommentCardBodyPropsInterface) => (
    <p className="text-sm text-text-dark mb-3 cursor-pointer" onClick={onClick}>{body}</p>
);
