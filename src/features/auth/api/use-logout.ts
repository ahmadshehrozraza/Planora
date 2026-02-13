import { useMutation, useQueryClient  } from "@tanstack/react-query";
import { toast } from "sonner";
import { redirect, useRouter } from "next/navigation";

export const useLogout = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation<
        { workspaceId?: string } 
    >({
        mutationFn: async () => {

        }, 
        onSuccess: () => {
            toast.success("Logged out")

            queryClient.clear();

            queryClient.removeQueries({ queryKey: ["current"] });
            queryClient.removeQueries({ queryKey: ["workspaces"] });
            queryClient.removeQueries({ queryKey: ["members"] });
            queryClient.removeQueries({ queryKey: ["projects"] });
            queryClient.removeQueries({ queryKey: ["tasks"]});
            queryClient.removeQueries({ queryKey: ["task"]});
            queryClient.removeQueries({ queryKey: ["profile"]});

            router.push("/sign-in");
        },
        onError: () => {
            toast.error("Failed to log out");
        }
    });

    return mutation;
};