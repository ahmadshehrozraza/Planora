import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono"; 
import { client2 } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client2.api.auth[":userId"]["$patch"], 200>;
type RequestType = InferRequestType<typeof client2.api.auth[":userId"]["$patch"]>;

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ form, param }) => {
            const response = await client2.api.auth[":userId"]["$patch"]({ 
                form, 
                param 
            });

            if (!response.ok) {

                let errorMessage = "Failed to update user";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            return await response.json();
        },
        onSuccess: ({ data }) => {
            toast.success("Profile updated successfully api");
            queryClient.invalidateQueries({ queryKey: ["current"] });
            queryClient.invalidateQueries({ queryKey: ["members"] }); 
        },
        onError: (error) => {
            console.error("Update error:", error);
            toast.error(error.message || "Failed to update profile");
        }
    });

    return mutation;
};