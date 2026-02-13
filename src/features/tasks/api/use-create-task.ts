import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateTask = () => {
    const queryClient = useQueryClient();
    
    const mutation = useMutation({
        mutationFn: async () => {
            return null;
        },
        onSuccess: () => {
            toast.success("Task created successfully");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
        onError: () => {
            toast.error("Failed to create task");
        }
    });

    return mutation;
};
