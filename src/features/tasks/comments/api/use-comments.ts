"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
    getCommentsAction, 
    createCommentAction, 
    updateCommentAction, 
    deleteCommentAction, 
    toggleLikeCommentAction 
} from "../server/comment-actions";

export const useGetComments = (taskId: string) => {
    return useQuery({
        queryKey: ["comments", taskId],
        queryFn: async () => {
            const response = await getCommentsAction(taskId);
            return response;
        },
        enabled: !!taskId,
        staleTime: 0,
    });
};

export const useCommentMutations = (taskId: string) => {
    const queryClient = useQueryClient();

    const invalidate = async () => {
        await queryClient.invalidateQueries({ queryKey: ["comments"] });
    };

    const createComment = useMutation({
        mutationFn: async (values: { taskId: string, text: string, parentId?: string }) => {
            const response = await createCommentAction(values);
            if (response.error) throw new Error(response.error);
            return response;
        },
        onSuccess: () => toast.success("Comment posted"),
        onError: (error: any) => toast.error(error.message || "Failed to post comment"),
        onSettled: () => invalidate()
    });

    const updateComment = useMutation({
        mutationFn: async (values: { commentId: string, text: string }) => {
            const response = await updateCommentAction(values);
            if (response.error) throw new Error(response.error);
            return response;
        },
        onSuccess: () => toast.success("Comment updated"),
        onError: (error: any) => toast.error(error.message || "Failed to update comment"),
        onSettled: () => invalidate()
    });

    const deleteComment = useMutation({
        mutationFn: async (commentId: string) => {
            const response = await deleteCommentAction(commentId);
            if (response.error) throw new Error(response.error);
            return response;
        },
        onSuccess: () => toast.success("Comment deleted"),
        onError: (error: any) => toast.error(error.message || "Failed to delete comment"),
        onSettled: () => invalidate()
    });

    const toggleLike = useMutation({
        mutationFn: async (commentId: string) => {
            const response = await toggleLikeCommentAction(commentId);
            if (response.error) throw new Error(response.error);
            return response;
        },
        onError: (error: any) => toast.error(error.message || "Failed to toggle like"),
        onSettled: () => invalidate()
    });

    return { createComment, updateComment, deleteComment, toggleLike };
};