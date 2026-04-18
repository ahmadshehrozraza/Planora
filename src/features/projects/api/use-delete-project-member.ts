"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteProjectMemberAction } from "../server/delete-project-member";

export const useDeleteProjectMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: { memberId: string, projectId: string }) => {
            const response = await deleteProjectMemberAction(values);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success || "Member removed from project");
            queryClient.invalidateQueries({ queryKey: ["project-members", variables.projectId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to remove member");
        }
    });
};