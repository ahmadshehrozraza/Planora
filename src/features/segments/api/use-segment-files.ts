"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadFileAction } from "@/lib/upload-file";
import { createSegmentFileAction, deleteSegmentFileAction, getSegmentFilesAction } from "../server/file-actions";

export const useGetSegmentFiles = (segmentId: string) => {
    return useQuery({
        queryKey: ["segment-files", segmentId],
        queryFn: async () => {
            const response = await getSegmentFilesAction(segmentId);
            if (response.error) throw new Error(response.error);
            return response.data || [];
        },
        enabled: !!segmentId,
    });
};

export const useUploadSegmentFile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ file, segmentId }: { file: File, segmentId: string }) => {
            const formData = new FormData();
            formData.append("file", file);
            const diskRes = await uploadFileAction(formData, "files");
            
            if (!diskRes.success || !diskRes.fileUrl) {
                throw new Error(diskRes.error || "Failed to upload to server");
            }

            const dbRes = await createSegmentFileAction({
                segmentId,
                name: file.name,
                size: file.size,
                type: file.type,
                url: diskRes.fileUrl
            });

            if (dbRes.error) throw new Error(dbRes.error);
            return dbRes;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["segment-files", variables.segmentId] });
        }
    });
};

export const useDeleteSegmentFile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ fileId, fileUrl, segmentId }: { fileId: string, fileUrl: string, segmentId: string }) => {
            const response = await deleteSegmentFileAction(fileId, fileUrl);
            if (response.error) throw new Error(response.error);
            return response;
        },
        onSuccess: (_, variables) => {
            toast.success("File deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["segment-files", variables.segmentId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete file");
        }
    });
};