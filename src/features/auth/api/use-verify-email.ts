import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { resetPasswordAction } from "../server/reset-password";

export const useVerifyEmail = () => {
    return useMutation({
        mutationFn: resetPasswordAction,
        
        onSuccess: (data) => {
            if (data?.error) {
                toast.error(data.error);
            }

            if (data?.success) {
                toast.success(data.success);
            }
        },
        onError: () => {
            toast.error("Network error or something went wrong.");
        }
    });
};