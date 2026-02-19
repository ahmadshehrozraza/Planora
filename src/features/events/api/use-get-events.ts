import { useQuery } from "@tanstack/react-query";
import { EventTypes } from "../types";
import { DUMMY_EVENTS } from "../server/dummy-events"; 
import { isSameDay } from "date-fns"; 

interface UseGetEventsProps {
  workspaceId: string;
  projectId?: string | null;
  date?: Date | null;
}

export const useGetEvents = ({ 
  workspaceId, 
  projectId, 
  date 
}: UseGetEventsProps) => {
  
  const query = useQuery({
    queryKey: ["events", workspaceId, projectId, date],
    
    queryFn: async (): Promise<EventTypes[]> => {
      let filteredEvents = [...DUMMY_EVENTS];

      if (projectId) {

      }

      if (date) {
        filteredEvents = filteredEvents.filter(event => 
          isSameDay(new Date(event.date), date)
        );
      }

      return filteredEvents;
    },
    
    staleTime: Infinity,
  });

  return query;
};


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