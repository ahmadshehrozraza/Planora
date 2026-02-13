
import { toast } from "sonner";
import { useMutation, useQueryClient  } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono"; 

export const useDeleteProject = () => {



    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async() => {

            return null;
        },
        onSuccess: () => {
            toast.success("Project deleted successfully");

            queryClient.invalidateQueries({ queryKey: ["projects"]});
            queryClient.invalidateQueries({ queryKey: ["project",  ]});
        },
        onError: () => {
            toast.error("Failed to delete Project");
        }
    });

    return mutation;
};