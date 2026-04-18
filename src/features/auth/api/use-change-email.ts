"use client";

import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { changeEmailAction } from "../server/change-email-action";
import { signOut } from "next-auth/react"; 

export const useChangeEmail = () => {
    return useMutation({
        mutationFn: async (data: { currentPassword?: string, newEmail: string }) => {
            const response = await changeEmailAction(data.currentPassword, data.newEmail);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: async (data) => {
            toast.success(data.success);
            toast.info("Please log in again with your new email."); 
            
            await signOut({ callbackUrl: "/sign-in" }); 
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update email");
        }
    });
};