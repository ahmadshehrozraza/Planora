import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { registerUserAction } from "../server/sign-up-user"; 

export const useRegister = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    
    const mutation = useMutation({
        mutationFn: registerUserAction, 
        
        onSuccess: (data) => {

            if (data?.error) {
                toast.error(data.error);
            }

            if (data?.success) {
                toast.success(data.success);

                queryClient.invalidateQueries({ queryKey: ["current"] });
                router.push("/sign-in"); 
            }
        },
        onError: () => {
            toast.error("Network error or something went wrong."); 
        }
    });

    return mutation;
};