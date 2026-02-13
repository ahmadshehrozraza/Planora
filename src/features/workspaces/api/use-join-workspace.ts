

import { toast } from "sonner";
import { useMutation, useQueryClient  } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono"; 

export const useJoinWorkspace = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        
        mutationFn: async() => {
            
            return null;
        },
        onSuccess: () => {
            toast.success("Joined workspace successfully");
            queryClient.invalidateQueries({ queryKey: ["workspaces"]});
            queryClient.invalidateQueries({ queryKey: ["workspace", ]});
        },
        onError: () => {
            toast.error("Failed to join workspace 1111");
        }
    });

    return mutation;
};