

import { toast } from "sonner";
import { useMutation, useQueryClient  } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono"; 

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["$delete"], 200>;
type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["$delete"]>

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.tasks[":taskId"]["$delete"]({ param });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      const json = (await response.json()) as ResponseType;

      return json;
    },

    onSuccess: (res) => {
      toast.success("Task Deleted successfully");
      const taskId = res?.data?.$id;
      
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      if (taskId) {
        queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      }

    },


    onError: () => {
      toast.error("Failed to delete Task");
    },
  });

  return mutation;
};
