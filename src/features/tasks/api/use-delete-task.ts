

import { toast } from "sonner";
import { useMutation, useQueryClient  } from "@tanstack/react-query";

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {

      return null;

    },

    onSuccess: (res) => {
      toast.success("Task Deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },


    onError: () => {
      toast.error("Failed to delete Task");
    },
  });

  return mutation;
};
