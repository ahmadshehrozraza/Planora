

import { toast } from "sonner";
import { useMutation, useQueryClient  } from "@tanstack/react-query"; 

export const useResetInviteCode = () => {
   
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async() => {
            return null;
        },
        onSuccess: () => {
            toast.success("Invite Code reset successfully");

            queryClient.invalidateQueries({ queryKey: ["workspaces"]});
            queryClient.invalidateQueries({ queryKey: ["workspace", ]});
        },
        onError: () => {
            toast.error("Failed to reset Invite Code");
        }
    });

    return mutation;
};