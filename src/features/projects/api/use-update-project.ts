"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProjectAction } from "../server/project-actions";
import { useRouter } from "next/navigation";
import { uploadFileAction } from "@/lib/upload-file";

export const useUpdateProject = () => {
    const queryClient = useQueryClient();
    const router = useRouter(); 
    
    return useMutation({
        mutationFn: async ({ projectId, workspaceId, values }: { projectId: string, workspaceId: string, values: any }) => {
            let finalImageUrl = values.imageUrl;

            if (values.imageFile instanceof File) {
                const formData = new FormData();
                formData.append("file", values.imageFile);
                
                const uploadRes = await uploadFileAction(formData, "projects");
                if (uploadRes.success && uploadRes.fileUrl) {
                    finalImageUrl = uploadRes.fileUrl;
                } else {
                    throw new Error(uploadRes.error || "Failed to upload new image");
                }
            }

            const { imageFile, imageUrl, ...plainValues } = values;

            const response = await updateProjectAction(projectId, {
                ...plainValues,
                imageUrl: finalImageUrl
            });

            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success(data.success || "Project updated successfully");
            queryClient.invalidateQueries({ queryKey: ["projects", variables.workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["project", variables.projectId] });
            
            router.refresh();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update Project");
        }
    });
};