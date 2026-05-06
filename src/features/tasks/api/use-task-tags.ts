"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
    getTagsAction, 
    createTagAction, 
    updateTagAction, 
    deleteTagAction 
} from "../server/task-tags.action";

export const useGetTags = (projectId?: string) => {
    return useQuery({
        queryKey: ["tags", projectId],
        queryFn: async () => {
            if (!projectId) return [];
            const response = await getTagsAction(projectId);
            if (response.error) throw new Error(response.error);
            return response.data || [];
        },
        enabled: !!projectId,
    });
};

export const useCreateTag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: { projectId: string; name: string; color?: string }) => {
            const response = await createTagAction(values);
            if (response.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success);
            queryClient.invalidateQueries({ queryKey: ["tags", variables.projectId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create tag");
        }
    });
};

export const useUpdateTag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: { tagId: string; projectId: string; name: string; color: string }) => {
            const response = await updateTagAction({
                tagId: values.tagId,
                name: values.name,
                color: values.color
            });
            if (response.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success);
            queryClient.invalidateQueries({ queryKey: ["tags", variables.projectId] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update tag");
        }
    });
};

export const useDeleteTag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ tagId }: { tagId: string; projectId: string }) => {
            const response = await deleteTagAction(tagId);
            if (response.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success);
            queryClient.invalidateQueries({ queryKey: ["tags", variables.projectId] });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete tag");
        }
    });
};