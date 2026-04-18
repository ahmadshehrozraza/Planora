import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { setNewPasswordAction } from "../server/set-new-password";

export const useResetPassword = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: async ({ values, token }: { values: any, token: string }) => {
            return await setNewPasswordAction(values, token);
        },
        onSuccess: (data) => {
            if (data?.error) {
                toast.error(data.error);
            }
            if (data?.success) {
                toast.success(data.success);
                router.push("/sign-in");
            }
        },
        onError: () => {
            toast.error("Network error or something went wrong.");
        }
    });
};