import { useMutation, useQueryClient  } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono"; 

import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { redirect, useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.auth.logout["$post"]>;
type RequestType = InferRequestType<typeof client.api.auth.logout["$post"]>

export const useLogout = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        { workspaceId?: string } 
    >({
        mutationFn: async ({ workspaceId }) => {
            console.log("Logging out from workspace:", workspaceId);

            const response = await client.api.auth.logout["$post"]({
                json: { workspaceId }
            });

            if (!response.ok) {
                throw new Error("Failed to Log out");
            }

            return await response.json();
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