"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { verifyPasswordAction } from "../server/verify-password-action";

export const useVerifyPassword = () => {
    return useMutation({
        mutationFn: async (password: string) => {
            // Server action ko direct call karein
            const response = await verifyPasswordAction(password);
            
            if (response.error) {
                throw new Error(response.error); 
            }
            
            return response;
        },
        onSuccess: () => {
            toast.success("Password Verified");
        },
        onError: (error) => {
            toast.error(error.message || "Wrong Password");
        }
    });
};