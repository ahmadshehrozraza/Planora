

import { toast } from "sonner";
import { useMutation, useQueryClient  } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono"; 
import { ZodNull } from "zod";


export const useUpdateProject = () => {

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async() => {
            
            return ZodNull;
        },
        onSuccess: () => {
            toast.success("Project updated successfully");
            queryClient.invalidateQueries({ queryKey: ["projects"]});
            queryClient.invalidateQueries({ queryKey: ["project", ]});
        },
        onError: () => {
            toast.error("Failed to update Project");
        }
    });

    return mutation;
};