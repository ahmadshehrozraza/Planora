import { useMutation, useQueryClient  } from "@tanstack/react-query";
import { toast } from "sonner";

export const useRegister = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async() => {
            
      return null;
      
        },
        onSuccess: () => {
            toast.success("Succesfully Registered");

            queryClient.invalidateQueries({ queryKey: ["current"]});
        },
        onError: () => {
            toast.error("Failed to register");
        }
    });

    return mutation;
};