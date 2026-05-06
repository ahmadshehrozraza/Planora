"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWorkspaceAction } from "../server/create-workspace";
import { useRouter } from "next/navigation";
import { uploadFileAction } from "@/lib/upload-file"; 

export const useCreateWorkspace = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (values: { name: string, imageFile?: File | null }) => {
            let imageUrl = undefined;

            if (values.imageFile) {
                const formData = new FormData();
                formData.append("file", values.imageFile);
                
                const uploadRes = await uploadFileAction(formData, "workspaces");
                if (uploadRes.success && uploadRes.fileUrl) {
                    imageUrl = uploadRes.fileUrl;
                } else {
                    throw new Error(uploadRes.error || "Failed to upload image");
                }
            }

            const response = await createWorkspaceAction({
                name: values.name,
                imageUrl: imageUrl
            });

            if (response.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data) => {
            if (data?.success && data.data) {
                toast.success(data.success);
                queryClient.invalidateQueries({ queryKey: ["workspaces"] }); 
                router.refresh();
                router.push(`/workspaces/${data.data.id}`); 
            }
        },
        onError: (error: any) => {
            toast.error(error.message || "Network Error: Failed to create Workspace");
        }
    });

    return mutation;
};