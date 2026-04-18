import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { loginUserAction } from "../server/sign-in-user"; 

export const useLogin = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: loginUserAction, 
        
        onSuccess: (data) => {
            if (data?.error) {
                toast.error(data.error);
            }
            
            if (data?.success) {
                toast.success(data.success);
                queryClient.invalidateQueries({ queryKey: ["current"] });
                router.refresh();
            }
        },
        onError: () => {
            toast.error("Network error or something went wrong.");
        }
    });
};