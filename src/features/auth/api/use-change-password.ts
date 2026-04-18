"use client";

import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { changePasswordAction } from "../server/change-password-action";

export const useChangePassword = () => {
    return useMutation({
        mutationFn: async (data: { currentPassword?: string, newPassword: string }) => {
            const response = await changePasswordAction(data.currentPassword, data.newPassword);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data) => {
            toast.success(data.success);
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update password");
        }
    });
};