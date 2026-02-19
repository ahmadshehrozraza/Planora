import { useQuery } from "@tanstack/react-query";
import { EventTypes } from "../types";
import { DUMMY_EVENTS } from "../server/dummy-events"; 

interface UseGetEventProps {
  eventId: string;
}

export const useGetEvent = ({ eventId }: UseGetEventProps) => {
  const query = useQuery({
    queryKey: ["event", eventId],

    queryFn: async (): Promise<EventTypes> => {
      const event = DUMMY_EVENTS.find((e) => e.$id === eventId);

      if (!event) {
        throw new Error("Event not found");
      }

      return event;
    },

    enabled: !!eventId, 
    staleTime: Infinity,
  });

  return query;
};