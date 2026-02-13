

import { toast } from "sonner";
import { useMutation, useQueryClient  } from "@tanstack/react-query";

export const useDeleteMember = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async() => {
            
            return null;
        },
        onSuccess: () => {
            toast.success("Member deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["members"]});
        },
        onError: () => {
            toast.error("Failed to delete member");
        }
    });

    return mutation;
};