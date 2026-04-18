"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateProjectMemberAction } from "../server/update-project-member";

export const useUpdateProjectMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: { memberId: string; role: string; projectId: string }) => {
            const response = await updateProjectMemberAction(values);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["member-profile", variables.memberId] });
            queryClient.invalidateQueries({ queryKey: ["project-members", variables.projectId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update role");
        }
    });
};