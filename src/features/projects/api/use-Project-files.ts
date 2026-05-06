"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadFileAction } from "@/lib/upload-file";
import { 
    getProjectFilesAction, 
    createProjectFileAction, 
    deleteProjectFileAction,
    createProjectFolderAction,
    deleteProjectFolderAction,
    updateProjectFolderAction
} from "../server/file-actions";

export const useGetProjectFiles = (projectId: string) => {
    return useQuery({
        queryKey: ["project-files", projectId],
        queryFn: async () => {
            const response = await getProjectFilesAction(projectId);
            if (response.error) throw new Error(response.error);
            return response.data || { folders: [], files: [] };
        },
        enabled: !!projectId,
    });
};

export const useCreateProjectFolder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: { projectId: string; name: string; isRestricted: boolean }) => {
            const response = await createProjectFolderAction(values);
            if (response.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (_, variables) => {
            toast.success("Folder created successfully");
            queryClient.invalidateQueries({ queryKey: ["project-files", variables.projectId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create folder");
        }
    });
};

export const useUpdateProjectFolder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: { folderId: string; projectId: string; name: string; isRestricted: boolean }) => {
            const response = await updateProjectFolderAction(values);
            if (response.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (_, variables) => {
            toast.success("Folder updated successfully");
            queryClient.invalidateQueries({ queryKey: ["project-files", variables.projectId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update folder");
        }
    });
};

export const useDeleteProjectFolder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: { folderId: string; projectId: string }) => {
            const response = await deleteProjectFolderAction(values);
            if (response.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (_, variables) => {
            toast.success("Folder deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["project-files", variables.projectId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete folder");
        }
    });
};

export const useUploadProjectFile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ file, projectId, folderId }: { file: File, projectId: string, folderId?: string }) => {
            const formData = new FormData();
            formData.append("file", file);
            const diskRes = await uploadFileAction(formData, "files");
            
            if (!diskRes.success || !diskRes.fileUrl) {
                throw new Error(diskRes.error || "Failed to upload to server");
            }

            const dbRes = await createProjectFileAction({
                projectId,
                folderId,
                name: file.name,
                size: file.size,
                type: file.type,
                url: diskRes.fileUrl
            });

            if (dbRes.error) throw new Error(dbRes.error);
            return dbRes;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["project-files", variables.projectId] });
        }
    });
};

export const useDeleteProjectFile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ fileId, fileUrl, projectId }: { fileId: string, fileUrl: string, projectId: string }) => {
            const response = await deleteProjectFileAction(fileId, fileUrl);
            if (response.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (_, variables) => {
            toast.success("File deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["project-files", variables.projectId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete file");
        }
    });
};