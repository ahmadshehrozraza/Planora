"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient  } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useUpdateWorkspace = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async() => {
            return null;
        },
        onSuccess: () => {

            toast.success("Workspace Updated");
            queryClient.invalidateQueries({ queryKey: ["workspaces"]});
            queryClient.invalidateQueries({ queryKey: ["workspace",  ]});
        },
        onError: () => {
            toast.error("Failed to Update Workspace");
        }
    });

    return mutation;
};