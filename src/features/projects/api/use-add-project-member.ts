"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addProjectMemberAction } from "../server/add-project-member";

export const useAddProjectMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: { projectId: string; userId: string; roleId: string }) => {
            const response = await addProjectMemberAction(values);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success || "Member added to project successfully!");
            queryClient.invalidateQueries({ queryKey: ["project-members", variables.projectId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to add member. Please try again.");
        }
    });
};