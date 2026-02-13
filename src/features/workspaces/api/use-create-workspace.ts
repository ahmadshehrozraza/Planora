

import { toast } from "sonner";
import { useMutation, useQueryClient  } from "@tanstack/react-query";

export const useCreateWorkspace = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async() => {
            
            return null;
        },
        onSuccess: () => {
            toast.success("Workspace Created");
            queryClient.invalidateQueries({ queryKey: ["workspaces"]});
        },
        onError: () => {
            toast.error("Failed to create Workspace");
        }
    });

    return mutation;
};