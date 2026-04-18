"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProjectAction } from "../server/create-project";
import { useRouter } from "next/navigation";
import { uploadFileAction } from "@/lib/upload-file"; 

export const useCreateProject = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (values: any) => {
            let uploadedImageUrl = undefined;

            if (values.imageFile) {
                const formData = new FormData();
                formData.append("file", values.imageFile);
                
                const uploadRes = await uploadFileAction(formData, "projects");
                if (uploadRes.success && uploadRes.fileUrl) {
                    uploadedImageUrl = uploadRes.fileUrl;
                } else {
                    throw new Error(uploadRes.error || "Failed to upload project image");
                }
            }

            const { imageFile, imageUrl, ...plainValues } = values;

            const response = await createProjectAction({
                ...plainValues,
                imageUrl: uploadedImageUrl
            });
            
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data) => {
            if (data?.success && data.data) {
                toast.success(data.success);
                queryClient.invalidateQueries({ queryKey: ["projects", data.data.workspaceId] });
                
                router.refresh();
                router.push(`/workspaces/${data.data.workspaceId}/projects/${data.data.id}`);
            }
        },
        onError: (error: any) => {
            toast.error(error.message || "Network Error: Failed to create Project");
        }
    });
};