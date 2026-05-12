import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createRiskAction, getProjectRisksAction, updateRiskAction, deleteRiskAction } from "../server/risk-actions";

export const useGetRisks = (projectId: string) => {
  return useQuery({
    queryKey: ["risks", projectId],
    queryFn: async () => {
      const res = await getProjectRisksAction(projectId);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
  });
};

export const useCreateRisk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRiskAction,
    onSuccess: (data) => {
      if (data.error) toast.error(data.error);
      else {
        toast.success("Risk logged successfully");
        queryClient.invalidateQueries({ queryKey: ["risks"] });
      }
    },
    onError: () => toast.error("Something went wrong"),
  });
};

export const useUpdateRisk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRiskAction,
    onSuccess: (data) => {
      if (data.error) toast.error(data.error);
      else {
        toast.success("Risk updated successfully");
        queryClient.invalidateQueries({ queryKey: ["risks"] });
      }
    },
    onError: () => toast.error("Failed to update risk"),
  });
};

export const useDeleteRisk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRiskAction,
    onSuccess: (data) => {
      if (data.error) toast.error(data.error);
      else {
        toast.success("Risk deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["risks"] });
      }
    },
    onError: () => toast.error("Failed to delete risk"),
  });
};