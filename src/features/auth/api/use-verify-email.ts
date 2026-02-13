import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono"; 
import { toast } from "sonner";
import { client } from "@/lib/rpc"; 

type ResponseType = InferResponseType<typeof client.api.auth["forgot-password"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.auth["forgot-password"]["$post"]>

export const useVerifyEmail = () => {
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async({ json }) => {
            const response = await client.api.auth["forgot-password"]["$post"]({ json });

            if(!response.ok){
                throw new Error("Email not found");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Email verified successfully");
        },
        onError: () => {
            toast.error("Email not found in our system");
        }
    });

    return mutation;
};