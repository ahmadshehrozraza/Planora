import { useParams } from "next/navigation";

export const useEventId = () => {
  const params = useParams();
  return params.eventId as string;
};
