import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
    getProjectRolesAction, 
    createProjectRoleAction, 
    updateProjectRoleAction, 
    deleteProjectRoleAction 
} from "../server/project-roles-action";

export const useGetProjectRoles = (projectId: string) => {
    return useQuery({
        queryKey: ["project-roles", projectId],
        queryFn: async () => {
            const res = await getProjectRolesAction(projectId);
            if (res.error) throw new Error(res.error);
            return res.data;
        },
        enabled: !!projectId,
    });
};

export const useCreateProjectRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createProjectRoleAction,
        onSuccess: (res, variables) => {
            if (res.error) toast.error(res.error);
            else {
                toast.success(res.success);
                queryClient.invalidateQueries({ queryKey: ["project-roles", variables.projectId] });
            }
        },
        onError: (err) => toast.error(err.message),
    });
};

export const useUpdateProjectRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateProjectRoleAction,
        onSuccess: (res, variables) => {
            if (res.error) toast.error(res.error);
            else {
                toast.success(res.success);
                queryClient.invalidateQueries({ queryKey: ["project-roles", variables.projectId] });
            }
        },
        onError: (err) => toast.error(err.message),
    });
};

export const useDeleteProjectRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ roleId, projectId, workspaceId }: { roleId: string, projectId: string, workspaceId: string }) => 
            deleteProjectRoleAction(roleId, projectId, workspaceId),
        onSuccess: (res, variables) => {
            if (res.error) toast.error(res.error);
            else {
                toast.success(res.success);
                queryClient.invalidateQueries({ queryKey: ["project-roles", variables.projectId] });
            }
        },
        onError: (err) => toast.error(err.message),
    });
};