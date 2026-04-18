import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { signOut } from "next-auth/react"; 

export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await signOut({ callbackUrl: "/sign-in" }); 
        },
        onSuccess: () => {
            toast.success("Logged out successfully");
            queryClient.invalidateQueries({ queryKey: ["current"] });
        },
        onError: () => {
            toast.error("Failed to log out");
        }
    });
};