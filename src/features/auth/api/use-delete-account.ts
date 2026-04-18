"use client";

import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { deleteAccountAction } from "../server/delete-account-action";
import { signOut } from "next-auth/react"; 

export const useDeleteAccount = () => {
    return useMutation({
        mutationFn: async (password: string) => {
            const response = await deleteAccountAction(password);
            if (response?.error) throw new Error(response.error);
            return response;
        },
        onSuccess: async (data) => {
            toast.success(data.success);
            await signOut({ callbackUrl: "/sign-in" }); 
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete account");
        }
    });
};