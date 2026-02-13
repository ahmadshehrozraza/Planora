import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono"; 
import { toast } from "sonner";
import { client } from "@/lib/rpc"; 

type ResponseType = InferResponseType<typeof client.api.auth["verify-password"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.auth["verify-password"]["$post"]>

export const useVerifyPassword = () => {
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async({ json }) => {
            const response = await client.api.auth["verify-password"]["$post"]({ json });

            if(!response.ok){
                const errorData = await response.json();
                throw new Error("Failed to verify password from api");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Password Verified");
        },
        onError: (error) => {
            toast.error("Wrong Password");
        }
    });

    return mutation;
};