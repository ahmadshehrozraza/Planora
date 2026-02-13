import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono"; 
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.auth[":userId"]["$delete"], 200>;
type RequestType = InferRequestType<typeof client.api.auth[":userId"]["$delete"]>

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async({ param }) => {
            const response = await client.api.auth[":userId"]["$delete"]({ param });
            
            if(!response.ok){
                throw new Error("Failed to delete user account");
            }
            
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Account deleted successfully");
            queryClient.clear(); 
            router.push("/sign-in"); 
        },
        onError: () => {
            toast.error("Failed to delete account");
        }
    });

    return mutation;
};