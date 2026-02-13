

import { toast } from "sonner";
import { useMutation, useQueryClient  } from "@tanstack/react-query";

export const useUpdateTask = () => {

    const queryClient = useQueryClient();
    
    const mutation = useMutation({
        mutationFn: async() => {
            
      return null;
      
        },
        onSuccess: () => {
            toast.success("Task Updated successfully");
            queryClient.invalidateQueries({ queryKey: ["tasks"]});
            queryClient.invalidateQueries({ queryKey: ["task", ]});

        },
        onError: () => {
            toast.error("Failed to update Task");
        }
    });

    return mutation;
};