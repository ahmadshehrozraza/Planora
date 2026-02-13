

import { toast } from "sonner";
import { useMutation, useQueryClient  } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono"; 


export const useCreateProject = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation
    ({
        mutationFn: async() => {
            
            return null;
        },
        onSuccess: () => {
            toast.success("Project Created successfully");
            queryClient.invalidateQueries({ queryKey: ["projects"]});
        },
        onError: () => {
            toast.error("Failed to create Project");
        }
    });

    return mutation;
};