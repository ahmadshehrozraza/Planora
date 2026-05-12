"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
    createColumnAction, 
    updateColumnAction, 
    deleteColumnAction, 
    bulkUpdateColumnsOrder
} from "../server/column-actions";
import { ColumnCategory } from "@prisma/client";

export const useColumnMutations = () => {
    const queryClient = useQueryClient();

    const createColumn = useMutation({
        mutationFn: async (values: { projectId: string; name: string; workspaceId: string; category: ColumnCategory }) => {
            const response = await createColumnAction(values);
            if (response.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success("Column created");
            queryClient.invalidateQueries({ queryKey: ["columns", variables.projectId] });
            queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
        },
        onError: (error: any) => toast.error(error.message || "Failed to create column")
    });

    const updateColumn = useMutation({
        mutationFn: async (values: { columnId: string; name: string; projectId: string; category?: ColumnCategory }) => {
            const response = await updateColumnAction(values);
            if (response.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success("Column updated");
            queryClient.invalidateQueries({ queryKey: ["columns", variables.projectId] });
            queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
        },
        onError: (error: any) => toast.error(error.message || "Failed to update column")
    });

    const deleteColumn = useMutation({
        mutationFn: async (values: { columnId: string; projectId: string; workspaceId: string }) => {
            const response = await deleteColumnAction(values);
            if (response.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            toast.success("Column and its tasks deleted");
            queryClient.invalidateQueries({ queryKey: ["columns", variables.projectId] });
            queryClient.invalidateQueries({ queryKey: ["tasks", variables.workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
        },
        onError: (error: any) => toast.error(error.message || "Failed to delete column")
    });

    const reorderColumns = useMutation({
        mutationFn: async (values: { columns: { id: string; position: number }[]; projectId: string }) => {
            const response = await bulkUpdateColumnsOrder(values);
            if (response.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["columns", variables.projectId] });
        },
        onError: (error: any) => toast.error(error.message || "Failed to reorder columns")
    });

    return { createColumn, updateColumn, deleteColumn, reorderColumns };
};