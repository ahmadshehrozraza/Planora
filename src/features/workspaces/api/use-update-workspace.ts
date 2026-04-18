"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateWorkspaceAction } from "../server/workspace-actions"; 
import { useRouter } from "next/navigation";
import { uploadFileAction } from "@/lib/upload-file";

export const useUpdateWorkspace = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    
    return useMutation({
        mutationFn: async ({ workspaceId, values }: { workspaceId: string, values: any }) => {
            let finalImageUrl = values.imageUrl;

            if (values.imageFile instanceof File) {
                const formData = new FormData();
                formData.append("file", values.imageFile);
                
                const uploadRes = await uploadFileAction(formData, "workspaces");
                if (uploadRes.success && uploadRes.fileUrl) {
                    finalImageUrl = uploadRes.fileUrl;
                } else {
                    throw new Error(uploadRes.error || "Failed to upload new image");
                }
            }

            const { imageFile, imageUrl, ...plainValues } = values;

            const response = await updateWorkspaceAction(workspaceId, {
                ...plainValues,
                imageUrl: finalImageUrl 
            });

            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success);
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            queryClient.invalidateQueries({ queryKey: ["workspace", variables.workspaceId] });
            router.refresh();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to Update Workspace");
        }
    });
};