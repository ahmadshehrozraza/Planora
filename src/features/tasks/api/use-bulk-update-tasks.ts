

import { toast } from "sonner";
import { useMutation, useQueryClient  } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useBulkUpdateTasks = () => {

    const router = useRouter();
    const queryClient = useQueryClient();
    
    const mutation = useMutation({
        mutationFn: async() => {
            return null;
        },
        onSuccess: () => {

            toast.success("Tasks Updated");
            queryClient.invalidateQueries({ queryKey: ["tasks"]});

        },
        onError: () => {
            toast.error("Failed to update Tasks");
        }
    });

    return mutation;
};