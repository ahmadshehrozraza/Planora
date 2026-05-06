import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
    getWorkspaceRolesAction, 
    createWorkspaceRoleAction, 
    updateWorkspaceRoleAction, 
    deleteWorkspaceRoleAction 
} from "../server/workspace-roles-action";

export const useGetWorkspaceRoles = (workspaceId: string) => {
    return useQuery({
        queryKey: ["workspace-roles", workspaceId],
        queryFn: async () => {
            const res = await getWorkspaceRolesAction(workspaceId);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
    });
};

export const useCreateWorkspaceRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createWorkspaceRoleAction,
        onSuccess: (res, variables) => {
            if (res.error) toast.error(res.error);
            else {
                toast.success(res.success);
                queryClient.invalidateQueries({ queryKey: ["workspace-roles", variables.workspaceId] });
            }
        },
        onError: (err) => toast.error(err.message),
    });
};

export const useUpdateWorkspaceRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateWorkspaceRoleAction,
        onSuccess: (res, variables) => {
            if (res.error) toast.error(res.error);
            else {
                toast.success(res.success);
                queryClient.invalidateQueries({ queryKey: ["workspace-roles", variables.workspaceId] });
            }
        },
        onError: (err) => toast.error(err.message),
    });
};

export const useDeleteWorkspaceRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ roleId, workspaceId }: { roleId: string, workspaceId: string }) => 
            deleteWorkspaceRoleAction(roleId, workspaceId),
        onSuccess: (res, variables) => {
            if (res.error) toast.error(res.error);
            else {
                toast.success(res.success);
                queryClient.invalidateQueries({ queryKey: ["workspace-roles", variables.workspaceId] });
            }
        },
        onError: (err) => toast.error(err.message),
    });
};