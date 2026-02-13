
import { toast } from "sonner";
import { useMutation, useQueryClient  } from "@tanstack/react-query";

export const useUpdateMember = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async() => {

            return null;
        },
        onSuccess: () => {
            toast.success("Member updated successfully");
            queryClient.invalidateQueries({ queryKey: ["members"]});
        },
        onError: () => {
            toast.error("Failed to update member");
        }
    });

    return mutation;
};