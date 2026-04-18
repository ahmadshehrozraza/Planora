"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadFileAction } from "@/lib/upload-file";
import { updateUserAction } from "../server/update-user-action"; 
import { useRouter } from "next/navigation";

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (values: any) => {
            let finalImageUrl = values.imageUrl;

            if (values.imageFile instanceof File) {
                const formData = new FormData();
                formData.append("file", values.imageFile);

                const uploadRes = await uploadFileAction(formData, "avatars"); 
                if (uploadRes.success && uploadRes.fileUrl) {
                    finalImageUrl = uploadRes.fileUrl;
                } else {
                    throw new Error(uploadRes.error || "Failed to upload avatar");
                }
            }

            const { imageFile, imageUrl, ...plainValues } = values;

            const response = await updateUserAction({
                ...plainValues,
                imageUrl: finalImageUrl 
            });

            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data) => {
            toast.success(data.success);
            queryClient.invalidateQueries({ queryKey: ["current"] });
            router.refresh(); 
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update Profile");
        }
    });
};