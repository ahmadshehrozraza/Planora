

import { toast } from "sonner";
import { useMutation, useQueryClient  } from "@tanstack/react-query";

export const useDeleteWorkspace = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async() => {
            
            
            return null;
        },
        onSuccess: ( ) => {
            toast.success("Workspace deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["workspaces"]});
            queryClient.invalidateQueries({ queryKey: ["workspace", ]});
        },
        onError: () => {
            toast.error("Failed to delete Workspace");
        }
    });

    return mutation;
};